/**
 * RepositoryFactory
 * Factory for creating repository instances
 *
 * Supports multiple persistence strategies:
 * - memory: In-memory storage (default, for development/testing)
 * - redis: Redis-based storage (future - Fase 5)
 * - postgres: PostgreSQL storage (future - Fase 5)
 */

import type { IConfigRepository } from '../../domain/repositories/IConfigRepository';
import type { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { InMemoryConfigRepository } from './memory/InMemoryConfigRepository';
import { InMemoryOrderRepository } from './memory/InMemoryOrderRepository';

export type PersistenceMode = 'memory' | 'redis' | 'postgres' | 'hybrid';

export class RepositoryFactory {
  private static configRepositoryInstance: IConfigRepository | null = null;
  private static orderRepositoryInstance: IOrderRepository | null = null;

  /**
   * Create or get config repository (singleton pattern)
   */
  static createConfigRepository(mode: PersistenceMode = 'memory'): IConfigRepository {
    if (this.configRepositoryInstance) {
      return this.configRepositoryInstance;
    }

    switch (mode) {
      case 'memory':
        this.configRepositoryInstance = new InMemoryConfigRepository();
        return this.configRepositoryInstance;

      case 'redis':
        // TODO: Implement in Fase 5
        throw new Error('Redis persistence not yet implemented. Use "memory" for now.');

      case 'postgres':
      case 'hybrid':
        // TODO: Implement in Fase 5
        throw new Error('PostgreSQL persistence not yet implemented. Use "memory" for now.');

      default:
        this.configRepositoryInstance = new InMemoryConfigRepository();
        return this.configRepositoryInstance;
    }
  }

  /**
   * Create or get order repository (singleton pattern)
   */
  static createOrderRepository(mode: PersistenceMode = 'memory'): IOrderRepository {
    if (this.orderRepositoryInstance) {
      return this.orderRepositoryInstance;
    }

    switch (mode) {
      case 'memory':
        this.orderRepositoryInstance = new InMemoryOrderRepository();
        return this.orderRepositoryInstance;

      case 'postgres':
      case 'hybrid':
        // TODO: Implement in Fase 5
        throw new Error('PostgreSQL persistence not yet implemented. Use "memory" for now.');

      case 'redis':
        // Orders should be in PostgreSQL, not Redis
        throw new Error('Orders must use PostgreSQL. Use "memory" for now.');

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
    // In the future, this could read from environment variables
    // For now, always use memory
    return 'memory';
  }
}
