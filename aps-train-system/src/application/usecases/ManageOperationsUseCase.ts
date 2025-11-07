/**
 * ManageOperationsUseCase
 * Manages operation types (add, update, delete, list)
 */

import type { IConfigRepository } from '../../domain/repositories/IConfigRepository';
import { ConfigurationService } from '../../domain/services/ConfigurationService';
import { OperationType } from '../../domain/entities/OperationType';
import type {
  AddOperationInput,
  AddOperationOutput,
  UpdateOperationInput,
  DeleteOperationInput,
  DeleteOperationOutput,
  ListOperationsOutput
} from '../dto/ManageOperationsDTO';
import { Result } from '../dto/Result';
import type { Result as ResultType } from '../dto/Result';

export class ManageOperationsUseCase {
  readonly configRepository: IConfigRepository;
  readonly configurationService: ConfigurationService;

  constructor(
    configRepository: IConfigRepository,
    configurationService: ConfigurationService
  ) {
    this.configRepository = configRepository;
    this.configurationService = configurationService;
  }

  async addOperation(input: AddOperationInput): Promise<ResultType<AddOperationOutput>> {
    try {
      const operation = OperationType.create({
        name: input.name,
        description: input.description,
        defaultDurationDays: input.defaultDurationDays,
        defaultWorkersRequired: input.defaultWorkersRequired,
        color: input.color
      });

      const existingOperations = await this.configRepository.getOperations();
      const validation = this.configurationService.validateOperation(operation, existingOperations);

      if (!validation.isValid) {
        return Result.failure('Validación falló', validation.errors);
      }

      await this.configRepository.saveOperation(operation);

      return Result.success({
        operation: operation.toJSON(),
        message: `Operación "${operation.name}" añadida exitosamente`
      });
    } catch (error) {
      return Result.failure(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async updateOperation(input: UpdateOperationInput): Promise<ResultType<AddOperationOutput>> {
    try {
      const existing = await this.configRepository.getOperation(input.name);
      if (!existing) {
        return Result.failure(`La operación "${input.name}" no existe`);
      }

      const updated = OperationType.create({
        name: input.name,
        description: input.description ?? existing.description,
        defaultDurationDays: input.defaultDurationDays ?? existing.defaultDurationDays,
        defaultWorkersRequired: input.defaultWorkersRequired ?? existing.defaultWorkersRequired,
        color: input.color ?? existing.color
      });

      await this.configRepository.saveOperation(updated);

      return Result.success({
        operation: updated.toJSON(),
        message: `Operación "${updated.name}" actualizada exitosamente`
      });
    } catch (error) {
      return Result.failure(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async deleteOperation(input: DeleteOperationInput): Promise<ResultType<DeleteOperationOutput>> {
    try {
      const operationExists = await this.configRepository.operationExists(input.operationName);
      if (!operationExists) {
        return Result.failure(`La operación "${input.operationName}" no existe`);
      }

      const lines = await this.configRepository.getLines();
      const validation = this.configurationService.canDeleteOperation(input.operationName, lines);

      if (!validation.isValid) {
        return Result.failure('No se puede eliminar la operación', validation.errors);
      }

      await this.configRepository.deleteOperation(input.operationName);

      return Result.success({
        message: `Operación "${input.operationName}" eliminada exitosamente`,
        affectedLines: 0
      });
    } catch (error) {
      return Result.failure(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async listOperations(): Promise<ResultType<ListOperationsOutput>> {
    try {
      const operations = await this.configRepository.getOperations();
      return Result.success({
        operations: operations.map(op => op.toJSON()),
        total: operations.length
      });
    } catch (error) {
      return Result.failure(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}
