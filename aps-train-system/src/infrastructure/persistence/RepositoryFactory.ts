/**
 * RepositoryFactory
 * Factory for creating repository instances
 *
 * Supports multiple persistence strategies:
 * - memory: In-memory storage (default, for development/testing)
 * - redis: Redis-based storage for configuration
 * - postgres: PostgreSQL storage for orders
 * - hybrid: Redis for config + PostgreSQL for orders (recommended for production)
 */

import type { IConfigRepository } from '../../domain/repositories/IConfigRepository';
import type { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { InMemoryConfigRepository } from './memory/InMemoryConfigRepository';
import { InMemoryOrderRepository } from './memory/InMemoryOrderRepository';
import { RedisConfigRepository } from './redis/RedisConfigRepository';
import { PostgresOrderRepository } from './postgres/PostgresOrderRepository';

export type PersistenceMode = 'memory' | 'redis' | 'postgres' | 'hybrid';

export class RepositoryFactory {
  private static configRepositoryInstance: IConfigRepository | null = null;
  private static orderRepositoryInstance: IOrderRepository | null = null;

  /**
   * Create or get config repository (singleton pattern)
   */
  static createConfigRepository(mode?: PersistenceMode): IConfigRepository {
    if (this.configRepositoryInstance) {
      return this.configRepositoryInstance;
    }

    const effectiveMode = mode || this.getPersistenceMode();

    switch (effectiveMode) {
      case 'memory':
        this.configRepositoryInstance = new InMemoryConfigRepository();
        console.log('📦 Using in-memory configuration storage');
        return this.configRepositoryInstance;

      case 'redis':
      case 'hybrid':
        // Redis for configuration in both redis-only and hybrid modes
        this.configRepositoryInstance = new RedisConfigRepository();
        console.log('🔴 Using Redis configuration storage');
        return this.configRepositoryInstance;

      case 'postgres':
        // Config in memory, orders in postgres
        console.warn('⚠️ PostgreSQL mode: Using memory for config (Redis recommended for production)');
        this.configRepositoryInstance = new InMemoryConfigRepository();
        return this.configRepositoryInstance;

      default:
        this.configRepositoryInstance = new InMemoryConfigRepository();
        return this.configRepositoryInstance;
    }
  }

  /**
   * Create or get order repository (singleton pattern)
   */
  static createOrderRepository(mode?: PersistenceMode): IOrderRepository {
    if (this.orderRepositoryInstance) {
      return this.orderRepositoryInstance;
    }

    const effectiveMode = mode || this.getPersistenceMode();

    switch (effectiveMode) {
      case 'memory':
        this.orderRepositoryInstance = new InMemoryOrderRepository();
        console.log('📦 Using in-memory order storage');
        return this.orderRepositoryInstance;

      case 'postgres':
      case 'hybrid':
        // PostgreSQL for orders in both postgres-only and hybrid modes
        this.orderRepositoryInstance = new PostgresOrderRepository();
        console.log('🐘 Using PostgreSQL order storage');
        return this.orderRepositoryInstance;

      case 'redis':
        // Orders should be in PostgreSQL, not Redis
        console.warn('⚠️ Redis mode not suitable for orders, using in-memory instead');
        this.orderRepositoryInstance = new InMemoryOrderRepository();
        return this.orderRepositoryInstance;

      default:
        this.orderRepositoryInstance = new InMemoryOrderRepository();
        return this.orderRepositoryInstance;
    }
  }

  /**
   * Reset all repository instances (useful for testing)
   */
  static reset(): void {
    this.configRepositoryInstance = null;
    this.orderRepositoryInstance = null;
  }

  /**
   * Get current persistence mode from environment or default
   */
  static getPersistenceMode(): PersistenceMode {
    const mode = (process.env.PERSISTENCE_MODE || 'memory') as PersistenceMode;

    const validModes: PersistenceMode[] = ['memory', 'redis', 'postgres', 'hybrid'];
    if (!validModes.includes(mode)) {
      console.warn(`⚠️ Invalid PERSISTENCE_MODE "${mode}", defaulting to "memory"`);
      return 'memory';
    }

    return mode;
  }

  /**
   * Initialize database schema (for PostgreSQL repositories)
   */
  static async initializeDatabase(): Promise<void> {
    const mode = this.getPersistenceMode();

    if (mode === 'postgres' || mode === 'hybrid') {
      console.log('🔧 Initializing database schema...');
      const orderRepo = this.createOrderRepository(mode) as PostgresOrderRepository;
      await orderRepo.initializeSchema();
      console.log('✅ Database schema initialized');
    }
  }
}
