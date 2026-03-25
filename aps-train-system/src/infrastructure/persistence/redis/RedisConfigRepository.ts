/**
 * Redis Implementation of Configuration Repository
 * Uses Redis as persistent storage for configuration data
 */

import Redis from 'ioredis';
import type { IConfigRepository } from '../../../domain/repositories/IConfigRepository';
import { OperationType } from '../../../domain/entities/OperationType';
import { ProductionLine } from '../../../domain/entities/ProductionLine';
import { ProcessConfig } from '../../../domain/entities/ProcessConfig';

export class RedisConfigRepository implements IConfigRepository {
  private redis: Redis;

  constructor(redisUrl?: string) {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379');

    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    this.redis.on('connect', () => {
      console.log('Connected to Redis');
    });
  }

  // ==================== Operations ====================

  async getOperations(): Promise<OperationType[]> {
    const operationNames = await this.redis.smembers('operations:list');
    const operations: OperationType[] = [];

    for (const name of operationNames) {
      const data = await this.redis.hgetall(`operations:${name}`);
      if (data && data.name) {
        operations.push(OperationType.create({
          name: data.name,
          description: data.description || '',
          defaultDurationDays: parseInt(data.defaultDurationDays) || 1,
          defaultWorkersRequired: parseInt(data.defaultWorkersRequired) || 1,
          color: data.color || '#3B82F6'
        }));
      }
    }

    return operations;
  }

  async saveOperation(operation: OperationType): Promise<void> {
    const data = operation.toJSON();
    const key = `operations:${operation.name}`;

    await this.redis.hmset(key, {
      name: data.name,
      description: data.description,
      defaultDurationDays: data.defaultDurationDays.toString(),
      defaultWorkersRequired: data.defaultWorkersRequired.toString(),
      color: data.color
    });

    await this.redis.sadd('operations:list', operation.name);
  }

  async deleteOperation(operationName: string): Promise<void> {
    await this.redis.del(`operations:${operationName}`);
    await this.redis.srem('operations:list', operationName);
  }

  async getOperation(operationName: string): Promise<OperationType | null> {
    const data = await this.redis.hgetall(`operations:${operationName}`);
    if (!data || !data.name) {
      return null;
    }

    return OperationType.create({
      name: data.name,
      description: data.description || '',
      defaultDurationDays: parseInt(data.defaultDurationDays) || 1,
      defaultWorkersRequired: parseInt(data.defaultWorkersRequired) || 1,
      color: data.color || '#3B82F6'
    });
  }

  async operationExists(operationName: string): Promise<boolean> {
    const exists = await this.redis.exists(`operations:${operationName}`);
    return exists === 1;
  }

  // ==================== Production Lines ====================

  async getLines(): Promise<ProductionLine[]> {
    const lineIds = await this.redis.smembers('lines:list');
    const lines: ProductionLine[] = [];

    for (const id of lineIds) {
      const data = await this.redis.hgetall(`lines:${id}`);
      if (data && data.id) {
        lines.push(ProductionLine.create({
          id: data.id,
          operationType: data.operationType,
          lineNumber: parseInt(data.lineNumber),
          workersRequired: parseInt(data.workersRequired),
          isActive: data.isActive === 'true'
        }));
      }
    }

    return lines;
  }

  async getLinesByOperation(operationType: string): Promise<ProductionLine[]> {
    const allLines = await this.getLines();
    return allLines.filter(line => line.operationType === operationType);
  }

  async saveLine(line: ProductionLine): Promise<void> {
    const data = line.toJSON();
    const key = `lines:${line.id}`;

    await this.redis.hmset(key, {
      id: data.id,
      operationType: data.operationType,
      lineNumber: data.lineNumber.toString(),
      workersRequired: data.workersRequired.toString(),
      isActive: data.isActive.toString()
    });

    await this.redis.sadd('lines:list', line.id);
  }

  async deleteLine(lineId: string): Promise<void> {
    await this.redis.del(`lines:${lineId}`);
    await this.redis.srem('lines:list', lineId);
  }

  async getLine(lineId: string): Promise<ProductionLine | null> {
    const data = await this.redis.hgetall(`lines:${lineId}`);
    if (!data || !data.id) {
      return null;
    }

    return ProductionLine.create({
      id: data.id,
      operationType: data.operationType,
      lineNumber: parseInt(data.lineNumber),
      workersRequired: parseInt(data.workersRequired),
      isActive: data.isActive === 'true'
    });
  }

  // ==================== Process Configuration ====================

  async getProcessConfig(modelId: string): Promise<ProcessConfig[]> {
    const processesJson = await this.redis.get(`models:${modelId}:processes`);
    if (!processesJson) {
      return [];
    }

    const processesData = JSON.parse(processesJson);
    return processesData.map((data: any) => ProcessConfig.create(data));
  }

  async saveProcessConfig(modelId: string, processes: ProcessConfig[]): Promise<void> {
    const processesData = processes.map(p => p.toJSON());
    await this.redis.set(`models:${modelId}:processes`, JSON.stringify(processesData));
    await this.redis.sadd('models:list', modelId);
  }

  async getConfiguredModels(): Promise<string[]> {
    return await this.redis.smembers('models:list');
  }

  // ==================== Utility ====================

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }

  async clear(): Promise<void> {
    const operations = await this.redis.smembers('operations:list');
    for (const name of operations) {
      await this.redis.del(`operations:${name}`);
    }
    await this.redis.del('operations:list');

    const lines = await this.redis.smembers('lines:list');
    for (const id of lines) {
      await this.redis.del(`lines:${id}`);
    }
    await this.redis.del('lines:list');

    const models = await this.redis.smembers('models:list');
    for (const modelId of models) {
      await this.redis.del(`models:${modelId}:processes`);
    }
    await this.redis.del('models:list');
  }
}
