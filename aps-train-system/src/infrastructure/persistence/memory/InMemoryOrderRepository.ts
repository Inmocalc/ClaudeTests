/**
 * InMemoryOrderRepository
 * In-memory implementation of IOrderRepository
 *
 * Stores orders in a Map for fast access
 * Initializes with sample orders
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { ProductionOrder, OrderStatus } from '../../../domain/entities/ProductionOrder';

export class InMemoryOrderRepository implements IOrderRepository {
  private orders: Map<string, ProductionOrder>;

  constructor() {
    this.orders = new Map();
    this.initializeSampleOrders();
  }

  private initializeSampleOrders(): void {
    const today = new Date();

    // Order 1: Model A, due in 10 days
    const order1 = ProductionOrder.create({
      id: 'ORD-001',
      modelType: 'A',
      dueDate: this.addDays(today, 10),
      priority: 1,
      status: OrderStatus.PENDING,
      createdAt: today.toISOString()
    });

    // Order 2: Model B, due in 15 days
    const order2 = ProductionOrder.create({
      id: 'ORD-002',
      modelType: 'B',
      dueDate: this.addDays(today, 15),
      priority: 2,
      status: OrderStatus.PENDING,
      createdAt: today.toISOString()
    });

    // Order 3: Model C, due in 8 days (urgent)
    const order3 = ProductionOrder.create({
      id: 'ORD-003',
      modelType: 'C',
      dueDate: this.addDays(today, 8),
      priority: 1,
      status: OrderStatus.PENDING,
      createdAt: today.toISOString()
    });

    // Order 4: Model A, due in 20 days
    const order4 = ProductionOrder.create({
      id: 'ORD-004',
      modelType: 'A',
      dueDate: this.addDays(today, 20),
      priority: 3,
      status: OrderStatus.PENDING,
      createdAt: today.toISOString()
    });

    // Order 5: Model B, due in 12 days
    const order5 = ProductionOrder.create({
      id: 'ORD-005',
      modelType: 'B',
      dueDate: this.addDays(today, 12),
      priority: 2,
      status: OrderStatus.PENDING,
      createdAt: today.toISOString()
    });

    this.orders.set(order1.id, order1);
    this.orders.set(order2.id, order2);
    this.orders.set(order3.id, order3);
    this.orders.set(order4.id, order4);
    this.orders.set(order5.id, order5);
  }

  private addDays(date: Date, days: number): string {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
  }

  // ========== Repository Methods ==========

  async getAll(): Promise<ProductionOrder[]> {
    return Array.from(this.orders.values());
  }

  async getById(id: string): Promise<ProductionOrder | null> {
    return this.orders.get(id) || null;
  }

  async getByStatus(status: OrderStatus): Promise<ProductionOrder[]> {
    return Array.from(this.orders.values()).filter(
      order => order.status === status
    );
  }

  async getByModelType(modelType: string): Promise<ProductionOrder[]> {
    return Array.from(this.orders.values()).filter(
      order => order.modelType === modelType
    );
  }

  async getPendingOrdersSorted(): Promise<ProductionOrder[]> {
    const pending = await this.getByStatus(OrderStatus.PENDING);

    // Sort by priority (lower is higher priority) then by due date
    return pending.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }

  async save(order: ProductionOrder): Promise<void> {
    this.orders.set(order.id, order);
  }

  async saveMany(orders: ProductionOrder[]): Promise<void> {
    for (const order of orders) {
      this.orders.set(order.id, order);
    }
  }

  async delete(id: string): Promise<void> {
    this.orders.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.orders.has(id);
  }

  async getOrdersDueBefore(date: string): Promise<ProductionOrder[]> {
    const dueDate = new Date(date);
    return Array.from(this.orders.values()).filter(
      order => new Date(order.dueDate) < dueDate
    );
  }

  async getOrdersCreatedBetween(startDate: string, endDate: string): Promise<ProductionOrder[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return Array.from(this.orders.values()).filter(order => {
      const created = new Date(order.createdAt);
      return created >= start && created <= end;
    });
  }
}
