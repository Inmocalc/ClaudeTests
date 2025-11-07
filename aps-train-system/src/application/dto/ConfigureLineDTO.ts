/**
 * DTOs for Configure Production Line Use Case
 */

import type { ProductionLineData } from '../../domain/entities/ProductionLine';

/**
 * Input for creating/updating a production line
 */
export interface ConfigureLineInput {
  id?: string; // If provided, update existing line
  operationType: string;
  lineNumber: number;
  workersRequired: number;
  isActive?: boolean; // Defaults to true
}

/**
 * Output from configuring a line
 */
export interface ConfigureLineOutput {
  line: ProductionLineData;
  message: string;
}

/**
 * Input for deleting a production line
 */
export interface DeleteLineInput {
  lineId: string;
}

/**
 * Input for listing lines
 */
export interface ListLinesInput {
  operationType?: string; // Filter by operation type
  activeOnly?: boolean; // Only active lines
}

/**
 * Output for listing lines
 */
export interface ListLinesOutput {
  lines: ProductionLineData[];
  total: number;
}
