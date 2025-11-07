/**
 * SchedulingService - Domain Service
 * Contains core scheduling algorithm logic
 *
 * Domain Service - Pure business logic, no external dependencies
 * Principles: SRP - Only responsible for scheduling algorithm
 *            OCP - Can be extended with new scheduling strategies
 *            DIP - Doesn't depend on infrastructure
 *
 * All methods are pure - no side effects, deterministic output
 */

import { ProductionOrder } from '../entities/ProductionOrder';
import { ProductionLine } from '../entities/ProductionLine';
import { TrainModel } from '../entities/TrainModel';


export interface ScheduledProcess {
  orderId: string;
  modelType: string;
  processName: string;
  processIndex: number;
  productionLineId: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  workersAssigned: number;
}

export interface WorkerAvailability {
  date: string; // ISO date
  availableWorkers: number;
}

export interface SchedulingInput {
  orders: ProductionOrder[];
  lines: ProductionLine[];
  models: TrainModel[];
  workerAvailability: WorkerAvailability[];
  startDate: string; // ISO date
  horizonDays: number;
}

export interface SchedulingResult {
  scheduledProcesses: ScheduledProcess[];
  completionDates: Map<string, string>; // orderId -> completion date
  resourceUsage: DailyResourceUsage[];
}

export interface DailyResourceUsage {
  date: string;
  availableWorkers: number;
  assignedWorkers: number;
  isOverloaded: boolean;
}

export class SchedulingService {
  /**
   * Main scheduling method - Forward Scheduling with EDD (Earliest Due Date)
   * Pure function - same input always produces same output
   */
  schedule(input: SchedulingInput): SchedulingResult {
    // Sort orders by due date (EDD priority)
    const sortedOrders = this.sortOrdersByDueDate(input.orders);

    const scheduledProcesses: ScheduledProcess[] = [];
    const completionDates = new Map<string, string>();

    // Track when each line will be available
    const lineAvailability = this.initializeLineAvailability(input.lines, input.startDate);

    // Schedule each order
    for (const order of sortedOrders) {
      const model = this.findModel(input.models, order.modelType);
      if (!model) {
        console.error(`Model ${order.modelType} not found`);
        continue;
      }

      let previousEndDate = input.startDate;

      // Schedule each process for this order
      for (let i = 0; i < model.processes.length; i++) {
        const process = model.processes[i];

        // Find suitable production line
        const productionLine = this.findSuitableLine(input.lines, process.operationType);
        if (!productionLine) {
          console.error(`No production line found for operation: ${process.operationType}`);
          continue;
        }

        // Earliest start = max(previous process end, line available)
        const lineNextAvailable = lineAvailability.get(productionLine.id) || input.startDate;
        const earliestStart = this.getLatestDate(previousEndDate, lineNextAvailable);

        // Find first date with enough workers
        const startDate = this.findDateWithWorkers(
          earliestStart,
          process.durationDays,
          productionLine.workersRequired,
          input.workerAvailability
        );

        const endDate = this.addDays(startDate, process.durationDays);

        // Create scheduled process
        scheduledProcesses.push({
          orderId: order.id,
          modelType: order.modelType,
          processName: process.processName,
          processIndex: i,
          productionLineId: productionLine.id,
          startDate,
          endDate,
          workersAssigned: productionLine.workersRequired
        });

        // Update line availability
        lineAvailability.set(productionLine.id, endDate);
        previousEndDate = endDate;
      }

      // Store completion date
      completionDates.set(order.id, previousEndDate);
    }

    // Calculate resource usage
    const resourceUsage = this.calculateResourceUsage(
      scheduledProcesses,
      input.workerAvailability,
      input.startDate,
      input.horizonDays
    );

    return {
      scheduledProcesses,
      completionDates,
      resourceUsage
    };
  }

  /**
   * Sort orders by due date (EDD - Earliest Due Date)
   */
  private sortOrdersByDueDate(orders: ProductionOrder[]): ProductionOrder[] {
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return dateA - dateB;
    });
  }

  /**
   * Initialize line availability map
   */
  private initializeLineAvailability(
    lines: ProductionLine[],
    startDate: string
  ): Map<string, string> {
    const availability = new Map<string, string>();
    lines.forEach(line => {
      availability.set(line.id, startDate);
    });
    return availability;
  }

  /**
   * Find model by type
   */
  private findModel(models: TrainModel[], modelType: string): TrainModel | null {
    return models.find(m => m.id === modelType) || null;
  }

  /**
   * Find suitable production line for operation type
   */
  private findSuitableLine(
    lines: ProductionLine[],
    operationType: string
  ): ProductionLine | null {
    const suitableLines = lines.filter(
      line => line.isActive && line.canPerformOperation(operationType)
    );
    return suitableLines.length > 0 ? suitableLines[0] : null;
  }

  /**
   * Find first date where enough workers are available for entire duration
   */
  private findDateWithWorkers(
    startDate: string,
    durationDays: number,
    workersNeeded: number,
    workerAvailability: WorkerAvailability[]
  ): string {
    let currentDate = startDate;
    const maxIterations = 100; // Safety limit
    let iterations = 0;

    while (iterations < maxIterations) {
      let hasEnoughWorkers = true;

      // Check all days in duration
      for (let i = 0; i < durationDays; i++) {
        const checkDate = this.addDays(currentDate, i);
        const available = this.getAvailableWorkers(checkDate, workerAvailability);

        if (available < workersNeeded) {
          hasEnoughWorkers = false;
          break;
        }
      }

      if (hasEnoughWorkers) {
        return currentDate;
      }

      // Move to next day
      currentDate = this.addDays(currentDate, 1);
      iterations++;
    }

    // If no suitable date found, return start date (validation will catch this)
    return startDate;
  }

  /**
   * Get available workers for a specific date
   */
  private getAvailableWorkers(
    date: string,
    workerAvailability: WorkerAvailability[]
  ): number {
    const availability = workerAvailability.find(w => w.date === date);
    return availability ? availability.availableWorkers : 5; // Default
  }

  /**
   * Calculate daily resource usage across schedule
   */
  private calculateResourceUsage(
    scheduledProcesses: ScheduledProcess[],
    workerAvailability: WorkerAvailability[],
    startDate: string,
    horizonDays: number
  ): DailyResourceUsage[] {
    const usage: DailyResourceUsage[] = [];

    for (let i = 0; i < horizonDays; i++) {
      const date = this.addDays(startDate, i);
      const available = this.getAvailableWorkers(date, workerAvailability);

      // Count workers assigned on this date
      let assigned = 0;
      scheduledProcesses.forEach(process => {
        if (this.isDateInRange(date, process.startDate, process.endDate)) {
          assigned += process.workersAssigned;
        }
      });

      usage.push({
        date,
        availableWorkers: available,
        assignedWorkers: assigned,
        isOverloaded: assigned > available
      });
    }

    return usage;
  }

  /**
   * Check if date is in range [startDate, endDate)
   */
  private isDateInRange(date: string, startDate: string, endDate: string): boolean {
    const d = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return d >= start && d < end;
  }

  /**
   * Add days to date
   */
  private addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get latest of two dates
   */
  private getLatestDate(date1: string, date2: string): string {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1 > d2 ? date1 : date2;
  }
}
