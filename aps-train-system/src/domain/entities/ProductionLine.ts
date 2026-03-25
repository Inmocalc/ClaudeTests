/**
 * ProductionLine Entity
 * Represents a physical production line
 *
 * Domain Entity - No external dependencies
 * Principles: SRP - Only represents a production line
 */

export interface ProductionLineData {
  id: string;
  operationType: string;
  lineNumber: number;
  workersRequired: number;
  isActive: boolean;
}

export class ProductionLine {
  readonly id: string;
  readonly operationType: string;
  readonly lineNumber: number;
  readonly workersRequired: number;
  readonly isActive: boolean;

  private constructor(
    id: string,
    operationType: string,
    lineNumber: number,
    workersRequired: number,
    isActive: boolean
  ) {
    this.id = id;
    this.operationType = operationType;
    this.lineNumber = lineNumber;
    this.workersRequired = workersRequired;
    this.isActive = isActive;
    this.validate();
  }

  static create(data: ProductionLineData): ProductionLine {
    return new ProductionLine(
      data.id,
      data.operationType,
      data.lineNumber,
      data.workersRequired,
      data.isActive
    );
  }

  private validate(): void {
    if (!this.id || this.id.trim() === '') {
      throw new Error('Production line ID is required');
    }
    if (!this.operationType || this.operationType.trim() === '') {
      throw new Error('Operation type is required');
    }
    if (this.lineNumber <= 0) {
      throw new Error('Line number must be greater than 0');
    }
    if (this.workersRequired < 0) {
      throw new Error('Workers required cannot be negative');
    }
  }

  canPerformOperation(operationType: string): boolean {
    return this.isActive && this.operationType === operationType;
  }

  getDisplayName(): string {
    return `${this.operationType} - Línea ${this.lineNumber}`;
  }

  withActiveStatus(isActive: boolean): ProductionLine {
    return ProductionLine.create({
      id: this.id,
      operationType: this.operationType,
      lineNumber: this.lineNumber,
      workersRequired: this.workersRequired,
      isActive
    });
  }

  withWorkers(workersRequired: number): ProductionLine {
    return ProductionLine.create({
      id: this.id,
      operationType: this.operationType,
      lineNumber: this.lineNumber,
      workersRequired,
      isActive: this.isActive
    });
  }

  deactivate(): ProductionLine {
    return this.withActiveStatus(false);
  }

  activate(): ProductionLine {
    return this.withActiveStatus(true);
  }

  equals(other: ProductionLine): boolean {
    return this.id === other.id;
  }

  toJSON(): ProductionLineData {
    return {
      id: this.id,
      operationType: this.operationType,
      lineNumber: this.lineNumber,
      workersRequired: this.workersRequired,
      isActive: this.isActive
    };
  }
}
