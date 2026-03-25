/**
 * WorkerAllocation Value Object
 * Encapsulates worker allocation with validation
 *
 * Value Object - Immutable
 * Principles: Encapsulation of business rules for worker allocation
 */

export class WorkerAllocation {
  private readonly _count: number;

  private constructor(count: number) {
    this._count = count;
    this.validate();
  }

  /**
   * Factory method to create WorkerAllocation
   */
  static create(count: number): WorkerAllocation {
    return new WorkerAllocation(count);
  }

  /**
   * Validate business rules
   */
  private validate(): void {
    if (this._count < 0) {
      throw new Error('Worker allocation cannot be negative');
    }
    if (!Number.isInteger(this._count)) {
      throw new Error('Worker allocation must be a whole number');
    }
    if (this._count > 100) {
      throw new Error('Worker allocation cannot exceed 100 workers');
    }
  }

  /**
   * Get count value
   */
  get count(): number {
    return this._count;
  }

  /**
   * Check if allocation is zero
   */
  isZero(): boolean {
    return this._count === 0;
  }

  /**
   * Check if allocation is available (non-zero)
   */
  isAvailable(): boolean {
    return this._count > 0;
  }

  /**
   * Add workers
   */
  add(other: WorkerAllocation): WorkerAllocation {
    return WorkerAllocation.create(this._count + other.count);
  }

  /**
   * Subtract workers (returns minimum 0)
   */
  subtract(other: WorkerAllocation): WorkerAllocation {
    const result = Math.max(0, this._count - other.count);
    return WorkerAllocation.create(result);
  }

  /**
   * Check if can allocate requested workers
   */
  canAllocate(requested: WorkerAllocation): boolean {
    return this._count >= requested.count;
  }

  /**
   * Compare allocations
   */
  isGreaterThan(other: WorkerAllocation): boolean {
    return this._count > other.count;
  }

  isLessThan(other: WorkerAllocation): boolean {
    return this._count < other.count;
  }

  /**
   * Equality check
   */
  equals(other: WorkerAllocation): boolean {
    return this._count === other.count;
  }

  /**
   * Convert to string
   */
  toString(): string {
    return `${this._count} ${this._count === 1 ? 'trabajador' : 'trabajadores'}`;
  }

  /**
   * Convert to number
   */
  toNumber(): number {
    return this._count;
  }
}
