/**
 * ValidationService - Domain Service
 * Contains business rule validation logic
 *
 * Domain Service - Pure validation logic, no side effects
 * Principles: SRP - Only responsible for validation
 *            OCP - New validations can be added without modifying existing
 */

import { ProductionOrder } from '../entities/ProductionOrder';
import type { ScheduledProcess, DailyResourceUsage } from './SchedulingService';

export interface Conflict {
  type: 'late_delivery' | 'resource_overload' | 'sequence_violation' | 'line_conflict';
  orderId?: string;
  date?: string;
  processName?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  conflicts: Conflict[];
  warnings: Conflict[];
}

export class ValidationService {
  /**
   * Validate complete schedule
   */
  validate(
    scheduledProcesses: ScheduledProcess[],
    orders: ProductionOrder[],
    completionDates: Map<string, string>,
    resourceUsage: DailyResourceUsage[]
  ): ValidationResult {
    const conflicts: Conflict[] = [];
    const warnings: Conflict[] = [];

    // Check late deliveries
    const lateDeliveries = this.checkLateDeliveries(orders, completionDates);
    conflicts.push(...lateDeliveries);

    // Check resource overload
    const resourceConflicts = this.checkResourceOverload(resourceUsage);
    conflicts.push(...resourceConflicts);

    // Check process sequence violations
    const sequenceViolations = this.checkProcessSequence(scheduledProcesses);
    conflicts.push(...sequenceViolations);

    // Check line conflicts (overlapping processes on same line)
    const lineConflicts = this.checkLineConflicts(scheduledProcesses);
    conflicts.push(...lineConflicts);

    return {
      isValid: conflicts.length === 0,
      conflicts,
      warnings
    };
  }

  /**
   * Check for late deliveries
   */
  private checkLateDeliveries(
    orders: ProductionOrder[],
    completionDates: Map<string, string>
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    orders.forEach(order => {
      const completionDate = completionDates.get(order.id);
      if (!completionDate) return;

      if (order.isLate(completionDate)) {
        const daysLate = order.getDaysUntilDue(completionDate);
        conflicts.push({
          type: 'late_delivery',
          orderId: order.id,
          message: `Orden ${order.id} se entregará ${Math.abs(daysLate)} día(s) tarde`,
          severity: 'error'
        });
      }
    });

    return conflicts;
  }

  /**
   * Check for resource overload
   */
  private checkResourceOverload(resourceUsage: DailyResourceUsage[]): Conflict[] {
    const conflicts: Conflict[] = [];

    resourceUsage.forEach(usage => {
      if (usage.isOverloaded) {
        conflicts.push({
          type: 'resource_overload',
          date: usage.date,
          message: `Sobrecarga de trabajadores en ${usage.date}: ${usage.assignedWorkers} necesarios, ${usage.availableWorkers} disponibles`,
          severity: 'error'
        });
      }
    });

    return conflicts;
  }

  /**
   * Check process sequence (process N must end before process N+1 starts)
   */
  private checkProcessSequence(scheduledProcesses: ScheduledProcess[]): Conflict[] {
    const conflicts: Conflict[] = [];

    // Group by order
    const processsByOrder = this.groupProcessesByOrder(scheduledProcesses);

    processsByOrder.forEach((processes, orderId) => {
      // Sort by process index
      const sortedProcesses = [...processes].sort((a, b) => a.processIndex - b.processIndex);

      for (let i = 1; i < sortedProcesses.length; i++) {
        const previous = sortedProcesses[i - 1];
        const current = sortedProcesses[i];

        const previousEnd = new Date(previous.endDate);
        const currentStart = new Date(current.startDate);

        if (currentStart < previousEnd) {
          conflicts.push({
            type: 'sequence_violation',
            orderId,
            processName: current.processName,
            message: `Violación de secuencia en orden ${orderId}: ${current.processName} inicia antes de que termine ${previous.processName}`,
            severity: 'error'
          });
        }
      }
    });

    return conflicts;
  }

  /**
   * Check line conflicts (multiple processes on same line at same time)
   */
  private checkLineConflicts(scheduledProcesses: ScheduledProcess[]): Conflict[] {
    const conflicts: Conflict[] = [];

    // Group by production line
    const processesByLine = this.groupProcessesByLine(scheduledProcesses);

    processesByLine.forEach((processes, lineId) => {
      // Check each pair of processes for overlap
      for (let i = 0; i < processes.length; i++) {
        for (let j = i + 1; j < processes.length; j++) {
          const process1 = processes[i];
          const process2 = processes[j];

          if (this.datesOverlap(
            process1.startDate,
            process1.endDate,
            process2.startDate,
            process2.endDate
          )) {
            conflicts.push({
              type: 'line_conflict',
              orderId: process1.orderId,
              message: `Conflicto en línea ${lineId}: procesos ${process1.processName} (orden ${process1.orderId}) y ${process2.processName} (orden ${process2.orderId}) se solapan`,
              severity: 'error'
            });
          }
        }
      }
    });

    return conflicts;
  }

  /**
   * Check if two date ranges overlap
   */
  private datesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    const s1 = new Date(start1);
    const e1 = new Date(end1);
    const s2 = new Date(start2);
    const e2 = new Date(end2);

    return s1 < e2 && s2 < e1;
  }

  /**
   * Group processes by order
   */
  private groupProcessesByOrder(
    scheduledProcesses: ScheduledProcess[]
  ): Map<string, ScheduledProcess[]> {
    const grouped = new Map<string, ScheduledProcess[]>();

    scheduledProcesses.forEach(process => {
      if (!grouped.has(process.orderId)) {
        grouped.set(process.orderId, []);
      }
      grouped.get(process.orderId)!.push(process);
    });

    return grouped;
  }

  /**
   * Group processes by line
   */
  private groupProcessesByLine(
    scheduledProcesses: ScheduledProcess[]
  ): Map<string, ScheduledProcess[]> {
    const grouped = new Map<string, ScheduledProcess[]>();

    scheduledProcesses.forEach(process => {
      if (!grouped.has(process.productionLineId)) {
        grouped.set(process.productionLineId, []);
      }
      grouped.get(process.productionLineId)!.push(process);
    });

    return grouped;
  }
}
