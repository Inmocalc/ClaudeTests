/**
 * ProductionOrder Entity
 * Represents a production order for a specific train model
 *
 * Domain Entity - No external dependencies
 * Principles: SRP - Only represents a production order
 */

export type OrderStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export const OrderStatus = {
  PENDING: 'pending' as OrderStatus,
  SCHEDULED: 'scheduled' as OrderStatus,
  IN_PROGRESS: 'in_progress' as OrderStatus,
  COMPLETED: 'completed' as OrderStatus,
  CANCELLED: 'cancelled' as OrderStatus
};

export interface ProductionOrderData {
  id: string;
  modelType: string;
  dueDate: string;
  priority: number;
  status: OrderStatus;
  createdAt?: string;
  completedAt?: string;
}

export class ProductionOrder {
  readonly id: string;
  readonly modelType: string;
  readonly dueDate: string;
  readonly priority: number;
  readonly status: OrderStatus;
  readonly createdAt: string;
  readonly completedAt?: string;

  private constructor(
    id: string,
    modelType: string,
    dueDate: string,
    priority: number,
    status: OrderStatus,
    createdAt: string,
    completedAt?: string
  ) {
    this.id = id;
    this.modelType = modelType;
    this.dueDate = dueDate;
    this.priority = priority;
    this.status = status;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.validate();
  }

  static create(data: ProductionOrderData): ProductionOrder {
    return new ProductionOrder(
      data.id,
      data.modelType,
      data.dueDate,
      data.priority,
      data.status,
      data.createdAt || new Date().toISOString(),
      data.completedAt
    );
  }

  private validate(): void {
    if (!this.id || this.id.trim() === '') {
      throw new Error('Production order ID is required');
    }
    if (!this.modelType || this.modelType.trim() === '') {
      throw new Error('Model type is required');
    }
    if (!this.dueDate) {
      throw new Error('Due date is required');
    }
    if (isNaN(Date.parse(this.dueDate))) {
      throw new Error('Due date must be a valid ISO date string');
    }
    if (this.priority < 0) {
      throw new Error('Priority cannot be negative');
    }
  }

  canSchedule(): boolean {
    return this.status === OrderStatus.PENDING;
  }

  markAsScheduled(): ProductionOrder {
    if (!this.canSchedule()) {
      throw new Error('Order cannot be scheduled from current status');
    }
    return ProductionOrder.create({
      ...this.toJSON(),
      status: OrderStatus.SCHEDULED
    });
  }

  startProduction(): ProductionOrder {
    if (this.status !== OrderStatus.SCHEDULED) {
      throw new Error('Order must be scheduled before starting production');
    }
    return ProductionOrder.create({
      ...this.toJSON(),
      status: OrderStatus.IN_PROGRESS
    });
  }

  complete(): ProductionOrder {
    if (this.status !== OrderStatus.IN_PROGRESS) {
      throw new Error('Order must be in progress to complete');
    }
    return ProductionOrder.create({
      ...this.toJSON(),
      status: OrderStatus.COMPLETED,
      completedAt: new Date().toISOString()
    });
  }

  cancel(): ProductionOrder {
    if (this.status === OrderStatus.COMPLETED) {
      throw new Error('Cannot cancel completed order');
    }
    return ProductionOrder.create({
      ...this.toJSON(),
      status: OrderStatus.CANCELLED
    });
  }

  isLate(currentDate: string): boolean {
    if (this.status === OrderStatus.COMPLETED) {
      return false;
    }
    return new Date(this.dueDate) < new Date(currentDate);
  }

  getDaysUntilDue(currentDate: string): number {
    const due = new Date(this.dueDate);
    const current = new Date(currentDate);
    const diffTime = due.getTime() - current.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  withPriority(priority: number): ProductionOrder {
    return ProductionOrder.create({
      ...this.toJSON(),
      priority
    });
  }

  withDueDate(dueDate: string): ProductionOrder {
    return ProductionOrder.create({
      ...this.toJSON(),
      dueDate
    });
  }

  equals(other: ProductionOrder): boolean {
    return this.id === other.id;
  }

  toJSON(): ProductionOrderData {
    return {
      id: this.id,
      modelType: this.modelType,
      dueDate: this.dueDate,
      priority: this.priority,
      status: this.status,
      createdAt: this.createdAt,
      completedAt: this.completedAt
    };
  }
}
