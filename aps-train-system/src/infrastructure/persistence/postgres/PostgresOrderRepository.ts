/**
 * PostgreSQL Implementation of Order Repository
 * Uses PostgreSQL as persistent storage for production orders
 */

import { Pool } from 'pg';
import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { ProductionOrder, OrderStatus } from '../../../domain/entities/ProductionOrder';

export class PostgresOrderRepository implements IOrderRepository {
  private pool: Pool;

  constructor(connectionString?: string) {
    this.pool = new Pool({
      connectionString: connectionString || process.env.DATABASE_URL || 'postgresql://localhost:5432/aps_train_system',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected error on PostgreSQL client', err);
    });

    this.pool.on('connect', () => {
      console.log('Connected to PostgreSQL');
    });
  }

  // ==================== Create/Update ====================

  async save(order: ProductionOrder): Promise<void> {
    const data = order.toJSON();

    const query = `
      INSERT INTO production_orders (id, model_type, due_date, priority, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (id)
      DO UPDATE SET
        model_type = EXCLUDED.model_type,
        due_date = EXCLUDED.due_date,
        priority = EXCLUDED.priority,
        status = EXCLUDED.status,
        updated_at = NOW()
    `;

    const values = [
      data.id,
      data.modelType,
      data.dueDate,
      data.priority,
      data.status,
      data.createdAt
    ];

    await this.pool.query(query, values);
  }

  async saveMany(orders: ProductionOrder[]): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      for (const order of orders) {
        const data = order.toJSON();
        const query = `
          INSERT INTO production_orders (id, model_type, due_date, priority, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW())
          ON CONFLICT (id)
          DO UPDATE SET
            model_type = EXCLUDED.model_type,
            due_date = EXCLUDED.due_date,
            priority = EXCLUDED.priority,
            status = EXCLUDED.status,
            updated_at = NOW()
        `;

        const values = [
          data.id,
          data.modelType,
          data.dueDate,
          data.priority,
          data.status,
          data.createdAt
        ];

        await client.query(query, values);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== Read ====================

  async getById(orderId: string): Promise<ProductionOrder | null> {
    const query = 'SELECT * FROM production_orders WHERE id = $1';
    const result = await this.pool.query(query, [orderId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.rowToOrder(result.rows[0]);
  }

  async getAll(): Promise<ProductionOrder[]> {
    const query = 'SELECT * FROM production_orders ORDER BY created_at DESC';
    const result = await this.pool.query(query);

    return result.rows.map(row => this.rowToOrder(row));
  }

  async getPendingOrders(): Promise<ProductionOrder[]> {
    const query = `
      SELECT * FROM production_orders
      WHERE status = $1
      ORDER BY priority ASC, due_date ASC
    `;
    const result = await this.pool.query(query, [OrderStatus.PENDING]);

    return result.rows.map(row => this.rowToOrder(row));
  }

  async getPendingOrdersSorted(): Promise<ProductionOrder[]> {
    return this.getPendingOrders();
  }

  async getByStatus(status: typeof OrderStatus[keyof typeof OrderStatus]): Promise<ProductionOrder[]> {
    const query = `
      SELECT * FROM production_orders
      WHERE status = $1
      ORDER BY priority ASC, due_date ASC
    `;
    const result = await this.pool.query(query, [status]);

    return result.rows.map(row => this.rowToOrder(row));
  }

  async getByModelType(modelType: string): Promise<ProductionOrder[]> {
    const query = `
      SELECT * FROM production_orders
      WHERE model_type = $1
      ORDER BY due_date ASC
    `;
    const result = await this.pool.query(query, [modelType]);

    return result.rows.map(row => this.rowToOrder(row));
  }

  // ==================== Additional Queries ====================

  async exists(id: string): Promise<boolean> {
    const query = 'SELECT EXISTS(SELECT 1 FROM production_orders WHERE id = $1)';
    const result = await this.pool.query(query, [id]);
    return result.rows[0].exists;
  }

  async getOrdersDueBefore(date: string): Promise<ProductionOrder[]> {
    const query = `
      SELECT * FROM production_orders
      WHERE due_date < $1
      ORDER BY due_date ASC
    `;
    const result = await this.pool.query(query, [date]);
    return result.rows.map(row => this.rowToOrder(row));
  }

  async getOrdersCreatedBetween(startDate: string, endDate: string): Promise<ProductionOrder[]> {
    const query = `
      SELECT * FROM production_orders
      WHERE created_at BETWEEN $1 AND $2
      ORDER BY created_at DESC
    `;
    const result = await this.pool.query(query, [startDate, endDate]);
    return result.rows.map(row => this.rowToOrder(row));
  }

  // ==================== Update Status ====================

  async updateStatus(orderId: string, status: typeof OrderStatus[keyof typeof OrderStatus]): Promise<void> {
    const query = `
      UPDATE production_orders
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `;
    await this.pool.query(query, [status, orderId]);
  }

  // ==================== Delete ====================

  async delete(orderId: string): Promise<void> {
    const query = 'DELETE FROM production_orders WHERE id = $1';
    await this.pool.query(query, [orderId]);
  }

  // ==================== Utility ====================

  async clear(): Promise<void> {
    await this.pool.query('DELETE FROM production_orders');
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }

  // ==================== Helper Methods ====================

  private rowToOrder(row: any): ProductionOrder {
    return ProductionOrder.create({
      id: row.id,
      modelType: row.model_type,
      dueDate: row.due_date,
      priority: row.priority,
      status: row.status,
      createdAt: row.created_at
    });
  }

  // ==================== Database Initialization ====================

  async initializeSchema(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS production_orders (
        id VARCHAR(50) PRIMARY KEY,
        model_type VARCHAR(10) NOT NULL,
        due_date DATE NOT NULL,
        priority INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT check_status CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
        CONSTRAINT check_priority CHECK (priority > 0)
      );

      CREATE INDEX IF NOT EXISTS idx_orders_status ON production_orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_due_date ON production_orders(due_date);
      CREATE INDEX IF NOT EXISTS idx_orders_model_type ON production_orders(model_type);
      CREATE INDEX IF NOT EXISTS idx_orders_priority ON production_orders(priority);
    `;

    await this.pool.query(createTableQuery);
  }
}
