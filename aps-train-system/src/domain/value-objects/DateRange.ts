/**
 * DateRange Value Object
 * Represents a range of dates with validation
 *
 * Value Object - Immutable
 * Principles: Encapsulation of date range logic without external dependencies
 * Uses only native Date and ISO strings
 */

export class DateRange {
  private readonly _startDate: string; // ISO date string
  private readonly _endDate: string; // ISO date string

  private constructor(startDate: string, endDate: string) {
    this._startDate = startDate;
    this._endDate = endDate;
    this.validate();
  }

  /**
   * Factory method to create DateRange
   */
  static create(startDate: string, endDate: string): DateRange {
    return new DateRange(startDate, endDate);
  }

  /**
   * Create from Date objects
   */
  static fromDates(startDate: Date, endDate: Date): DateRange {
    return new DateRange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  }

  /**
   * Validate business rules
   */
  private validate(): void {
    // Validate ISO date format
    if (isNaN(Date.parse(this._startDate))) {
      throw new Error('Start date must be a valid ISO date string');
    }
    if (isNaN(Date.parse(this._endDate))) {
      throw new Error('End date must be a valid ISO date string');
    }

    // Validate range
    const start = new Date(this._startDate);
    const end = new Date(this._endDate);

    if (start > end) {
      throw new Error('Start date cannot be after end date');
    }
  }

  /**
   * Get start date
   */
  get startDate(): string {
    return this._startDate;
  }

  /**
   * Get end date
   */
  get endDate(): string {
    return this._endDate;
  }

  /**
   * Get start date as Date object
   */
  getStartDateObject(): Date {
    return new Date(this._startDate);
  }

  /**
   * Get end date as Date object
   */
  getEndDateObject(): Date {
    return new Date(this._endDate);
  }

  /**
   * Get duration in days
   */
  getDurationDays(): number {
    const start = new Date(this._startDate);
    const end = new Date(this._endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if this range overlaps with another
   */
  overlaps(other: DateRange): boolean {
    const thisStart = new Date(this._startDate);
    const thisEnd = new Date(this._endDate);
    const otherStart = new Date(other.startDate);
    const otherEnd = new Date(other.endDate);

    return thisStart <= otherEnd && otherStart <= thisEnd;
  }

  /**
   * Check if this range contains a specific date
   */
  contains(date: string): boolean {
    const checkDate = new Date(date);
    const start = new Date(this._startDate);
    const end = new Date(this._endDate);

    return checkDate >= start && checkDate <= end;
  }

  /**
   * Check if this range contains another range
   */
  containsRange(other: DateRange): boolean {
    const thisStart = new Date(this._startDate);
    const thisEnd = new Date(this._endDate);
    const otherStart = new Date(other.startDate);
    const otherEnd = new Date(other.endDate);

    return thisStart <= otherStart && thisEnd >= otherEnd;
  }

  /**
   * Check if this range is before another range
   */
  isBefore(other: DateRange): boolean {
    return new Date(this._endDate) < new Date(other.startDate);
  }

  /**
   * Check if this range is after another range
   */
  isAfter(other: DateRange): boolean {
    return new Date(this._startDate) > new Date(other.endDate);
  }

  /**
   * Shift range by days
   */
  shift(days: number): DateRange {
    const startDate = new Date(this._startDate);
    const endDate = new Date(this._endDate);

    startDate.setDate(startDate.getDate() + days);
    endDate.setDate(endDate.getDate() + days);

    return DateRange.fromDates(startDate, endDate);
  }

  /**
   * Extend range by days
   */
  extend(days: number): DateRange {
    const endDate = new Date(this._endDate);
    endDate.setDate(endDate.getDate() + days);

    return DateRange.create(this._startDate, endDate.toISOString().split('T')[0]);
  }

  /**
   * Equality check
   */
  equals(other: DateRange): boolean {
    return this._startDate === other.startDate && this._endDate === other.endDate;
  }

  /**
   * Convert to string
   */
  toString(): string {
    return `${this._startDate} → ${this._endDate}`;
  }

  /**
   * Convert to plain object
   */
  toJSON(): { startDate: string; endDate: string } {
    return {
      startDate: this._startDate,
      endDate: this._endDate
    };
  }
}
