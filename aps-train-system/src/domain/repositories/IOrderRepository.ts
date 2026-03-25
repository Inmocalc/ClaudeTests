/**
 * IOrderRepository Interface (Port)
 * Defines the contract for production order persistence
 *
 * Domain Port - No implementation details
 * Principles: DIP - High-level policy doesn't depend on low-level details
 */

import { ProductionOrder, OrderStatus } from '../entities/ProductionOrder';

export interface IOrderRepository {
  /**
   * Get all production orders
   */
  getAll(): Promise<ProductionOrder[]>;

  /**
   * Get production order by ID
   */
  getById(id: string): Promise<ProductionOrder | null>;

  /**
   * Get orders by status
   */
  getByStatus(status: OrderStatus): Promise<ProductionOrder[]>;

  /**
   * Get orders by model type
   */
  getByModelType(modelType: string): Promise<ProductionOrder[]>;

  /**
   * Get pending orders sorted by priority and due date
   */
  getPendingOrdersSorted(): Promise<ProductionOrder[]>;

  /**
   * Save or update a production order
   */
  save(order: ProductionOrder): Promise<void>;

  /**
   * Save multiple orders
   */
  saveMany(orders: ProductionOrder[]): Promise<void>;

  /**
   * Delete a production order
   */
  delete(id: string): Promise<void>;

  /**
   * Check if order exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Get orders due before a specific date
   */
  getOrdersDueBefore(date: string): Promise<ProductionOrder[]>;

  /**
   * Get orders created within date range
   */
  getOrdersCreatedBetween(startDate: string, endDate: string): Promise<ProductionOrder[]>;
}
