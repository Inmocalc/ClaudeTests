/**
 * DTOs for Update Process Configuration Use Case
 */

import type { ProcessConfigData } from '../../domain/entities/ProcessConfig';

// Re-export ProcessConfigData for convenience
export type { ProcessConfigData };

/**
 * Input for updating process configuration for a model
 */
export interface UpdateProcessConfigInput {
  modelId: string; // A, B, C, etc.
  processes: {
    processName: string;
    operationType: string;
    durationDays: number;
    workersRequired: number;
    sequenceOrder: number;
  }[];
}

/**
 * Output from updating process config
 */
export interface UpdateProcessConfigOutput {
  modelId: string;
  processes: ProcessConfigData[];
  totalDuration: number;
  message: string;
}

/**
 * Input for getting process configuration
 */
export interface GetProcessConfigInput {
  modelId: string;
}

/**
 * Output for getting process config
 */
export interface GetProcessConfigOutput {
  modelId: string;
  processes: ProcessConfigData[];
  totalDuration: number;
}

/**
 * Output for listing all configured models
 */
export interface ListConfiguredModelsOutput {
  models: {
    modelId: string;
    processCount: number;
    totalDuration: number;
  }[];
}
