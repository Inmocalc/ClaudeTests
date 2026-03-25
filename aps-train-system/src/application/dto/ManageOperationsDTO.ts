/**
 * DTOs for Manage Operations Use Case
 */

import type { OperationTypeData } from '../../domain/entities/OperationType';

/**
 * Input for adding a new operation type
 */
export interface AddOperationInput {
  name: string;
  description: string;
  defaultDurationDays: number;
  defaultWorkersRequired: number;
  color?: string; // Hex color, e.g., #FF5733
}

/**
 * Output from adding an operation
 */
export interface AddOperationOutput {
  operation: OperationTypeData;
  message: string;
}

/**
 * Input for updating an existing operation type
 */
export interface UpdateOperationInput {
  name: string; // Operation to update (name is the key)
  description?: string;
  defaultDurationDays?: number;
  defaultWorkersRequired?: number;
  color?: string;
}

/**
 * Input for deleting an operation type
 */
export interface DeleteOperationInput {
  operationName: string;
}

/**
 * Output for deleting an operation
 */
export interface DeleteOperationOutput {
  message: string;
  affectedLines: number; // Number of lines that were using this operation
}

/**
 * Output for listing operations
 */
export interface ListOperationsOutput {
  operations: OperationTypeData[];
  total: number;
}
