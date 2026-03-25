/**
 * IConfigRepository Interface (Port)
 * Defines the contract for configuration persistence
 *
 * Domain Port - No implementation details
 * Principles: DIP - High-level policy doesn't depend on low-level details
 *
 * This interface allows dynamic configuration of:
 * - Production lines
 * - Operation types
 * - Process configurations per model
 */

import { ProductionLine } from '../entities/ProductionLine';
import { OperationType } from '../entities/OperationType';
import { ProcessConfig } from '../entities/ProcessConfig';

export interface IConfigRepository {
  // ========== Production Lines ==========
  /**
   * Get all production lines
   */
  getLines(): Promise<ProductionLine[]>;

  /**
   * Get production lines by operation type
   */
  getLinesByOperation(operationType: string): Promise<ProductionLine[]>;

  /**
   * Save or update a production line
   */
  saveLine(line: ProductionLine): Promise<void>;

  /**
   * Delete a production line
   */
  deleteLine(lineId: string): Promise<void>;

  // ========== Operation Types ==========
  /**
   * Get all operation types
   */
  getOperations(): Promise<OperationType[]>;

  /**
   * Get operation type by name
   */
  getOperation(name: string): Promise<OperationType | null>;

  /**
   * Save or update an operation type
   */
  saveOperation(operation: OperationType): Promise<void>;

  /**
   * Delete an operation type
   */
  deleteOperation(operationName: string): Promise<void>;

  /**
   * Check if operation exists
   */
  operationExists(operationName: string): Promise<boolean>;

  // ========== Process Configurations ==========
  /**
   * Get process configuration for a specific model
   */
  getProcessConfig(modelId: string): Promise<ProcessConfig[]>;

  /**
   * Save process configuration for a specific model
   */
  saveProcessConfig(modelId: string, config: ProcessConfig[]): Promise<void>;

  /**
   * Get all model IDs that have configurations
   */
  getConfiguredModels(): Promise<string[]>;
}
