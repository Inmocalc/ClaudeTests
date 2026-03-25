/**
 * TrainModel Entity
 * Represents a train model type (A, B, C) with its production processes
 *
 * Domain Entity - No external dependencies
 * Principles: SRP - Only represents a train model
 */

import { ProcessConfig } from './ProcessConfig';

export interface TrainModelData {
  id: string;
  description: string;
  processes: ProcessConfig[];
}

export class TrainModel {
  readonly id: string;
  readonly description: string;
  readonly processes: ReadonlyArray<ProcessConfig>;

  private constructor(id: string, description: string, processes: ReadonlyArray<ProcessConfig>) {
    this.id = id;
    this.description = description;
    this.processes = processes;
    this.validate();
  }

  static create(data: TrainModelData): TrainModel {
    if (!data.id || data.id.trim() === '') {
      throw new Error('TrainModel ID is required');
    }
    if (!data.description || data.description.trim() === '') {
      throw new Error('TrainModel description is required');
    }
    if (!data.processes || data.processes.length === 0) {
      throw new Error('TrainModel must have at least one process');
    }

    return new TrainModel(data.id, data.description, data.processes);
  }

  private validate(): void {
    const processNames = this.processes.map(p => p.processName);
    const uniqueNames = new Set(processNames);

    if (processNames.length !== uniqueNames.size) {
      throw new Error('TrainModel cannot have duplicate process names');
    }
  }

  getProcess(index: number): ProcessConfig | undefined {
    return this.processes[index];
  }

  getTotalDuration(): number {
    return this.processes.reduce((total, process) => total + process.durationDays, 0);
  }

  hasProcess(processName: string): boolean {
    return this.processes.some(p => p.processName === processName);
  }

  getProcessIndex(processName: string): number {
    return this.processes.findIndex(p => p.processName === processName);
  }

  withProcesses(processes: ProcessConfig[]): TrainModel {
    return TrainModel.create({
      id: this.id,
      description: this.description,
      processes
    });
  }

  equals(other: TrainModel): boolean {
    return this.id === other.id;
  }

  toJSON(): TrainModelData {
    return {
      id: this.id,
      description: this.description,
      processes: [...this.processes]
    };
  }
}
