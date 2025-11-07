/**
 * InMemoryConfigRepository
 * In-memory implementation of IConfigRepository
 *
 * Stores configuration in Maps for fast access
 * Initializes with default data (Preparación, Torneado, Pintado)
 */

import type { IConfigRepository } from '../../../domain/repositories/IConfigRepository';
import { ProductionLine } from '../../../domain/entities/ProductionLine';
import { OperationType } from '../../../domain/entities/OperationType';
import { ProcessConfig } from '../../../domain/entities/ProcessConfig';

export class InMemoryConfigRepository implements IConfigRepository {
  private lines: Map<string, ProductionLine>;
  private operations: Map<string, OperationType>;
  private processConfigs: Map<string, ProcessConfig[]>;

  constructor() {
    this.lines = new Map();
    this.operations = new Map();
    this.processConfigs = new Map();
    this.initializeDefaults();
  }

  private initializeDefaults(): void {
    // Initialize default operations
    const preparacion = OperationType.create({
      name: 'Preparación',
      description: 'Preparación inicial del material',
      defaultDurationDays: 1,
      defaultWorkersRequired: 1,
      color: '#3B82F6'
    });

    const torneado = OperationType.create({
      name: 'Torneado',
      description: 'Proceso de torneado de piezas',
      defaultDurationDays: 2,
      defaultWorkersRequired: 2,
      color: '#EF4444'
    });

    const pintado = OperationType.create({
      name: 'Pintado',
      description: 'Pintado y acabado final',
      defaultDurationDays: 2,
      defaultWorkersRequired: 2,
      color: '#10B981'
    });

    this.operations.set('Preparación', preparacion);
    this.operations.set('Torneado', torneado);
    this.operations.set('Pintado', pintado);

    // Initialize default production lines
    const prep1 = ProductionLine.create({
      id: 'preparacion-line-1',
      operationType: 'Preparación',
      lineNumber: 1,
      workersRequired: 1,
      isActive: true
    });

    const prep2 = ProductionLine.create({
      id: 'preparacion-line-2',
      operationType: 'Preparación',
      lineNumber: 2,
      workersRequired: 1,
      isActive: true
    });

    const torn1 = ProductionLine.create({
      id: 'torneado-line-1',
      operationType: 'Torneado',
      lineNumber: 1,
      workersRequired: 2,
      isActive: true
    });

    const pint1 = ProductionLine.create({
      id: 'pintado-line-1',
      operationType: 'Pintado',
      lineNumber: 1,
      workersRequired: 2,
      isActive: true
    });

    this.lines.set(prep1.id, prep1);
    this.lines.set(prep2.id, prep2);
    this.lines.set(torn1.id, torn1);
    this.lines.set(pint1.id, pint1);

    // Initialize default process configurations for models
    // Model A: Preparación -> Torneado -> Pintado
    const modelAProcesses = [
      ProcessConfig.create({
        processName: 'Preparación',
        operationType: 'Preparación',
        durationDays: 1,
        workersRequired: 1,
        sequenceOrder: 0
      }),
      ProcessConfig.create({
        processName: 'Torneado',
        operationType: 'Torneado',
        durationDays: 2,
        workersRequired: 2,
        sequenceOrder: 1
      }),
      ProcessConfig.create({
        processName: 'Pintado',
        operationType: 'Pintado',
        durationDays: 2,
        workersRequired: 2,
        sequenceOrder: 2
      })
    ];

    // Model B: Preparación -> Torneado -> Pintado (same as A)
    const modelBProcesses = [
      ProcessConfig.create({
        processName: 'Preparación',
        operationType: 'Preparación',
        durationDays: 1,
        workersRequired: 1,
        sequenceOrder: 0
      }),
      ProcessConfig.create({
        processName: 'Torneado',
        operationType: 'Torneado',
        durationDays: 3,
        workersRequired: 2,
        sequenceOrder: 1
      }),
      ProcessConfig.create({
        processName: 'Pintado',
        operationType: 'Pintado',
        durationDays: 1,
        workersRequired: 2,
        sequenceOrder: 2
      })
    ];

    // Model C: Preparación -> Pintado (shorter process)
    const modelCProcesses = [
      ProcessConfig.create({
        processName: 'Preparación',
        operationType: 'Preparación',
        durationDays: 1,
        workersRequired: 1,
        sequenceOrder: 0
      }),
      ProcessConfig.create({
        processName: 'Pintado',
        operationType: 'Pintado',
        durationDays: 2,
        workersRequired: 2,
        sequenceOrder: 1
      })
    ];

    this.processConfigs.set('A', modelAProcesses);
    this.processConfigs.set('B', modelBProcesses);
    this.processConfigs.set('C', modelCProcesses);
  }

  // ========== Production Lines ==========

  async getLines(): Promise<ProductionLine[]> {
    return Array.from(this.lines.values());
  }

  async getLinesByOperation(operationType: string): Promise<ProductionLine[]> {
    return Array.from(this.lines.values()).filter(
      line => line.operationType === operationType
    );
  }

  async saveLine(line: ProductionLine): Promise<void> {
    this.lines.set(line.id, line);
  }

  async deleteLine(lineId: string): Promise<void> {
    this.lines.delete(lineId);
  }

  // ========== Operation Types ==========

  async getOperations(): Promise<OperationType[]> {
    return Array.from(this.operations.values());
  }

  async getOperation(name: string): Promise<OperationType | null> {
    return this.operations.get(name) || null;
  }

  async saveOperation(operation: OperationType): Promise<void> {
    this.operations.set(operation.name, operation);
  }

  async deleteOperation(operationName: string): Promise<void> {
    this.operations.delete(operationName);
  }

  async operationExists(operationName: string): Promise<boolean> {
    return this.operations.has(operationName);
  }

  // ========== Process Configurations ==========

  async getProcessConfig(modelId: string): Promise<ProcessConfig[]> {
    return this.processConfigs.get(modelId) || [];
  }

  async saveProcessConfig(modelId: string, config: ProcessConfig[]): Promise<void> {
    this.processConfigs.set(modelId, config);
  }

  async getConfiguredModels(): Promise<string[]> {
    return Array.from(this.processConfigs.keys());
  }
}
