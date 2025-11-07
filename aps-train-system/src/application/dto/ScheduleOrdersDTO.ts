/**
 * DTOs for Schedule Orders Use Case
 */

import type { ScheduledProcess, DailyResourceUsage } from '../../domain/services/SchedulingService';
import type { Conflict } from '../../domain/services/ValidationService';

/**
 * Input for scheduling orders
 */
export interface ScheduleOrdersInput {
  orderIds?: string[]; // If empty, schedule all pending orders
  startDate?: string; // ISO date, defaults to today
  horizonDays?: number; // Planning horizon, defaults to 30
}

/**
 * Output from scheduling orders
 */
export interface ScheduleOrdersOutput {
  scheduledProcesses: ScheduledProcess[];
  completionDates: Map<string, string>;
  resourceUsage: DailyResourceUsage[];
  validation: {
    isValid: boolean;
    conflicts: Conflict[];
    warnings: Conflict[];
  };
  metadata: {
    totalOrders: number;
    scheduledOrders: number;
    totalProcesses: number;
    executionTimeMs: number;
  };
}
