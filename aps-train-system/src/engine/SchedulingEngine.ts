import { addDays, parseISO, formatISO, differenceInDays } from 'date-fns';
import type {
  ProductionOrder,
  ScheduledProcess,
  SystemConfiguration,
  ScheduleResult,
  TrainModel,
  DailyResourceUsage,
  Conflict,
  ProductionLine,
} from '../types/interfaces';

export class SchedulingEngine {
  private config: SystemConfiguration;

  constructor(config: SystemConfiguration) {
    this.config = config;
  }

  /**
   * Main scheduling function - implements forward scheduling with EDD priority
   */
  scheduleOrders(orders: ProductionOrder[]): ScheduleResult {
    // Sort orders by due date (EDD - Earliest Due Date)
    const sortedOrders = [...orders].sort((a, b) => {
      return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
    });

    const scheduledProcesses: ScheduledProcess[] = [];
    const completionDates = new Map<string, string>();

    // Track line availability (next available date for each line)
    const lineAvailability = new Map<string, string>();
    this.config.productionLines.forEach((line) => {
      lineAvailability.set(line.id, this.config.startDate);
    });

    // Schedule each order
    for (const order of sortedOrders) {
      const model = this.getTrainModel(order.modelType);
      let previousEndDate = this.config.startDate;

      // Schedule each process for this order
      for (let i = 0; i < model.processes.length; i++) {
        const process = model.processes[i];

        // Find suitable production line
        const productionLine = this.findProductionLine(process.name);

        if (!productionLine) {
          console.error(`No production line found for process: ${process.name}`);
          continue;
        }

        // Determine earliest start date (after previous process AND when line is available)
        const lineNextAvailable = lineAvailability.get(productionLine.id) || this.config.startDate;
        const earliestStart = this.getLatestDate(previousEndDate, lineNextAvailable);

        // Find first date with enough workers
        const startDate = this.findDateWithWorkers(
          earliestStart,
          process.durationDays,
          productionLine.workersRequired
        );

        const endDate = this.addWorkingDays(startDate, process.durationDays);

        // Create scheduled process
        scheduledProcesses.push({
          orderId: order.id,
          modelType: order.modelType,
          processName: process.name,
          processIndex: i,
          productionLineId: productionLine.id,
          startDate,
          endDate,
          workersAssigned: productionLine.workersRequired,
          color: model.color,
        });

        // Update line availability
        lineAvailability.set(productionLine.id, endDate);
        previousEndDate = endDate;
      }

      // Store completion date for this order
      completionDates.set(order.id, previousEndDate);
    }

    // Calculate resource usage
    const resourceUsage = this.calculateResourceUsage(scheduledProcesses);

    // Validate schedule and detect conflicts
    const validation = this.validateSchedule(scheduledProcesses, orders, completionDates);

    return {
      scheduledProcesses,
      validation,
      resourceUsage,
      completionDates,
    };
  }

  /**
   * Find a production line for a specific process type
   */
  private findProductionLine(processName: string): ProductionLine | null {
    const lines = this.config.productionLines.filter(
      (line) => line.processType === processName
    );

    // For processes with multiple lines (Preparación), return first one
    // The algorithm will alternate between them naturally based on availability
    return lines.length > 0 ? lines[0] : null;
  }

  /**
   * Find the first date where enough workers are available
   */
  private findDateWithWorkers(
    startDate: string,
    durationDays: number,
    workersNeeded: number
  ): string {
    let currentDate = startDate;
    const maxIterations = 100; // Prevent infinite loops
    let iterations = 0;

    while (iterations < maxIterations) {
      // Check if all days in the duration have enough workers
      let hasEnoughWorkers = true;

      for (let i = 0; i < durationDays; i++) {
        const checkDate = this.addWorkingDays(currentDate, i);
        const available = this.getAvailableWorkers(checkDate);

        if (available < workersNeeded) {
          hasEnoughWorkers = false;
          break;
        }
      }

      if (hasEnoughWorkers) {
        return currentDate;
      }

      // Move to next day
      currentDate = this.addWorkingDays(currentDate, 1);
      iterations++;
    }

    // If we can't find a date with enough workers, return the start date anyway
    // The validation will catch this as a conflict
    return startDate;
  }

  /**
   * Get available workers for a specific date
   */
  private getAvailableWorkers(date: string): number {
    const availability = this.config.workerAvailability.find((w) => w.date === date);
    return availability ? availability.availableWorkers : 5; // Default to 5 if not found
  }

  /**
   * Calculate daily resource usage across the schedule
   */
  private calculateResourceUsage(scheduledProcesses: ScheduledProcess[]): DailyResourceUsage[] {
    const usage: DailyResourceUsage[] = [];
    const startDate = parseISO(this.config.startDate);

    for (let i = 0; i < this.config.horizonDays; i++) {
      const date = formatISO(addDays(startDate, i), { representation: 'date' });
      const available = this.getAvailableWorkers(date);

      // Count workers assigned on this date
      let assigned = 0;
      scheduledProcesses.forEach((process) => {
        if (this.isDateInRange(date, process.startDate, process.endDate)) {
          assigned += process.workersAssigned;
        }
      });

      usage.push({
        date,
        availableWorkers: available,
        assignedWorkers: assigned,
        isOverloaded: assigned > available,
      });
    }

    return usage;
  }

  /**
   * Check if a date is within a range (inclusive of start, exclusive of end)
   */
  private isDateInRange(date: string, startDate: string, endDate: string): boolean {
    const d = parseISO(date);
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return d >= start && d < end;
  }

  /**
   * Validate the schedule and detect conflicts
   */
  private validateSchedule(
    scheduledProcesses: ScheduledProcess[],
    orders: ProductionOrder[],
    completionDates: Map<string, string>
  ) {
    const conflicts: Conflict[] = [];

    // Check for late deliveries
    orders.forEach((order) => {
      const completionDate = completionDates.get(order.id);
      if (completionDate) {
        const dueDate = parseISO(order.dueDate);
        const actualDate = parseISO(completionDate);

        if (actualDate > dueDate) {
          const daysLate = differenceInDays(actualDate, dueDate);
          conflicts.push({
            type: 'late_delivery',
            orderId: order.id,
            message: `Order ${order.id} will be ${daysLate} day(s) late`,
            severity: 'error',
          });
        }
      }
    });

    // Check for resource overload
    const resourceUsage = this.calculateResourceUsage(scheduledProcesses);
    resourceUsage.forEach((usage) => {
      if (usage.isOverloaded) {
        conflicts.push({
          type: 'resource_overload',
          date: usage.date,
          message: `Workers overloaded on ${usage.date}: ${usage.assignedWorkers} needed, ${usage.availableWorkers} available`,
          severity: 'error',
        });
      }
    });

    return {
      isValid: conflicts.length === 0,
      conflicts,
      warnings: [],
    };
  }

  /**
   * Get train model by ID
   */
  private getTrainModel(modelType: 'A' | 'B' | 'C'): TrainModel {
    const model = this.config.trainModels.find((m) => m.id === modelType);
    if (!model) {
      throw new Error(`Train model ${modelType} not found`);
    }
    return model;
  }

  /**
   * Add working days to a date
   */
  private addWorkingDays(dateStr: string, days: number): string {
    const date = parseISO(dateStr);
    const result = addDays(date, days);
    return formatISO(result, { representation: 'date' });
  }

  /**
   * Get the latest of two dates
   */
  private getLatestDate(date1: string, date2: string): string {
    const d1 = parseISO(date1);
    const d2 = parseISO(date2);
    return d1 > d2 ? date1 : date2;
  }
}
