/**
 * OperationType Entity
 * Represents a type of operation that can be performed
 *
 * Domain Entity - No external dependencies
 * Principles: SRP - Only represents an operation type definition
 */

export interface OperationTypeData {
  name: string;
  description: string;
  defaultDurationDays: number;
  defaultWorkersRequired: number;
  color?: string;
}

export class OperationType {
  readonly name: string;
  readonly description: string;
  readonly defaultDurationDays: number;
  readonly defaultWorkersRequired: number;
  readonly color: string;

  private constructor(
    name: string,
    description: string,
    defaultDurationDays: number,
    defaultWorkersRequired: number,
    color: string
  ) {
    this.name = name;
    this.description = description;
    this.defaultDurationDays = defaultDurationDays;
    this.defaultWorkersRequired = defaultWorkersRequired;
    this.color = color;
    this.validate();
  }

  static create(data: OperationTypeData): OperationType {
    return new OperationType(
      data.name,
      data.description,
      data.defaultDurationDays,
      data.defaultWorkersRequired,
      data.color || '#6B7280'
    );
  }

  private validate(): void {
    if (!this.name || this.name.trim() === '') {
      throw new Error('Operation type name is required');
    }
    if (!this.description || this.description.trim() === '') {
      throw new Error('Operation type description is required');
    }
    if (this.defaultDurationDays <= 0) {
      throw new Error('Default duration must be greater than 0');
    }
    if (this.defaultWorkersRequired < 0) {
      throw new Error('Default workers required cannot be negative');
    }
    if (this.color && !this.color.match(/^#[0-9A-Fa-f]{6}$/)) {
      throw new Error('Color must be a valid hex color (#RRGGBB)');
    }
  }

  withDefaults(durationDays: number, workersRequired: number): OperationType {
    return OperationType.create({
      name: this.name,
      description: this.description,
      defaultDurationDays: durationDays,
      defaultWorkersRequired: workersRequired,
      color: this.color
    });
  }

  withColor(color: string): OperationType {
    return OperationType.create({
      name: this.name,
      description: this.description,
      defaultDurationDays: this.defaultDurationDays,
      defaultWorkersRequired: this.defaultWorkersRequired,
      color
    });
  }

  equals(other: OperationType): boolean {
    return this.name === other.name;
  }

  toJSON(): OperationTypeData {
    return {
      name: this.name,
      description: this.description,
      defaultDurationDays: this.defaultDurationDays,
      defaultWorkersRequired: this.defaultWorkersRequired,
      color: this.color
    };
  }
}
