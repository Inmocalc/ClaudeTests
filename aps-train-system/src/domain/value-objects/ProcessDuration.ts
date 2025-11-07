/**
 * ProcessDuration Value Object
 * Encapsulates process duration in days with validation
 *
 * Value Object - Immutable
 * Principles: Encapsulation of business rules
 */

export class ProcessDuration {
  private readonly _days: number;

  private constructor(days: number) {
    this._days = days;
    this.validate();
  }

  /**
   * Factory method to create ProcessDuration
   */
  static fromDays(days: number): ProcessDuration {
    return new ProcessDuration(days);
  }

  /**
   * Validate business rules
   */
  private validate(): void {
    if (this._days <= 0) {
      throw new Error('Process duration must be greater than 0 days');
    }
    if (!Number.isInteger(this._days)) {
      throw new Error('Process duration must be a whole number of days');
    }
    if (this._days > 365) {
      throw new Error('Process duration cannot exceed 365 days');
    }
  }

  /**
   * Get days value
   */
  get days(): number {
    return this._days;
  }

  /**
   * Add days
   */
  add(other: ProcessDuration): ProcessDuration {
    return ProcessDuration.fromDays(this._days + other.days);
  }

  /**
   * Subtract days (returns minimum 1 day)
   */
  subtract(other: ProcessDuration): ProcessDuration {
    const result = Math.max(1, this._days - other.days);
    return ProcessDuration.fromDays(result);
  }

  /**
   * Compare durations
   */
  isGreaterThan(other: ProcessDuration): boolean {
    return this._days > other.days;
  }

  isLessThan(other: ProcessDuration): boolean {
    return this._days < other.days;
  }

  /**
   * Equality check
   */
  equals(other: ProcessDuration): boolean {
    return this._days === other.days;
  }

  /**
   * Convert to string
   */
  toString(): string {
    return `${this._days} ${this._days === 1 ? 'día' : 'días'}`;
  }

  /**
   * Convert to number
   */
  toNumber(): number {
    return this._days;
  }
}
