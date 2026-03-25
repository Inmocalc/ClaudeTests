/**
 * ProcessConfig Entity
 * Represents the configuration of a specific process for a train model
 *
 * Domain Entity - No external dependencies
 * Principles: SRP - Only represents a process configuration
 */

export interface ProcessConfigData {
  processName: string;
  operationType: string;
  durationDays: number;
  workersRequired: number;
  sequenceOrder: number;
}

export class ProcessConfig {
  readonly processName: string;
  readonly operationType: string;
  readonly durationDays: number;
  readonly workersRequired: number;
  readonly sequenceOrder: number;

  private constructor(
    processName: string,
    operationType: string,
    durationDays: number,
    workersRequired: number,
    sequenceOrder: number
  ) {
    this.processName = processName;
    this.operationType = operationType;
    this.durationDays = durationDays;
    this.workersRequired = workersRequired;
    this.sequenceOrder = sequenceOrder;
    this.validate();
  }

  static create(data: ProcessConfigData): ProcessConfig {
    return new ProcessConfig(
      data.processName,
      data.operationType,
      data.durationDays,
      data.workersRequired,
      data.sequenceOrder
    );
  }

  private validate(): void {
    if (!this.processName || this.processName.trim() === '') {
      throw new Error('Process name is required');
    }
    if (!this.operationType || this.operationType.trim() === '') {
      throw new Error('Operation type is required');
    }
    if (this.durationDays <= 0) {
      throw new Error('Process duration must be greater than 0');
    }
    if (this.workersRequired < 0) {
      throw new Error('Workers required cannot be negative');
    }
    if (this.sequenceOrder < 0) {
      throw new Error('Sequence order cannot be negative');
    }
  }

  withDuration(durationDays: number): ProcessConfig {
    return ProcessConfig.create({
      processName: this.processName,
      operationType: this.operationType,
      durationDays,
      workersRequired: this.workersRequired,
      sequenceOrder: this.sequenceOrder
    });
  }

  withWorkers(workersRequired: number): ProcessConfig {
    return ProcessConfig.create({
      processName: this.processName,
      operationType: this.operationType,
      durationDays: this.durationDays,
      workersRequired,
      sequenceOrder: this.sequenceOrder
    });
  }

  equals(other: ProcessConfig): boolean {
    return (
      this.processName === other.processName &&
      this.operationType === other.operationType &&
      this.durationDays === other.durationDays &&
      this.workersRequired === other.workersRequired &&
      this.sequenceOrder === other.sequenceOrder
    );
  }

  toJSON(): ProcessConfigData {
    return {
      processName: this.processName,
      operationType: this.operationType,
      durationDays: this.durationDays,
      workersRequired: this.workersRequired,
      sequenceOrder: this.sequenceOrder
    };
  }
}
