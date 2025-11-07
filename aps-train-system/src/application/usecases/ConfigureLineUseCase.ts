/**
 * ConfigureLineUseCase
 * Manages production lines (add, update, delete, list)
 */

import type { IConfigRepository } from '../../domain/repositories/IConfigRepository';
import { ConfigurationService } from '../../domain/services/ConfigurationService';
import { ProductionLine } from '../../domain/entities/ProductionLine';
import type {
  ConfigureLineInput,
  ConfigureLineOutput,
  DeleteLineInput,
  ListLinesInput,
  ListLinesOutput
} from '../dto/ConfigureLineDTO';
import { Result } from '../dto/Result';
import type { Result as ResultType } from '../dto/Result';

export class ConfigureLineUseCase {
  readonly configRepository: IConfigRepository;
  readonly configurationService: ConfigurationService;

  constructor(
    configRepository: IConfigRepository,
    configurationService: ConfigurationService
  ) {
    this.configRepository = configRepository;
    this.configurationService = configurationService;
  }

  async configureLine(input: ConfigureLineInput): Promise<ResultType<ConfigureLineOutput>> {
    try {
      const lineId = input.id || `${input.operationType.toLowerCase()}-line-${input.lineNumber}`;
      const line = ProductionLine.create({
        id: lineId,
        operationType: input.operationType,
        lineNumber: input.lineNumber,
        workersRequired: input.workersRequired,
        isActive: input.isActive ?? true
      });

      const existingLines = await this.configRepository.getLines();
      const availableOperations = await this.configRepository.getOperations();
      const validation = this.configurationService.validateLine(line, existingLines, availableOperations);

      if (!validation.isValid) {
        return Result.failure('Validación falló', validation.errors);
      }

      await this.configRepository.saveLine(line);
      const isUpdate = existingLines.some(l => l.id === lineId);

      return Result.success({
        line: line.toJSON(),
        message: isUpdate ? `Línea actualizada` : `Línea añadida`
      });
    } catch (error) {
      return Result.failure(`Error: ${error instanceof Error ? error.message : 'Error'}`);
    }
  }

  async deleteLine(input: DeleteLineInput): Promise<ResultType<{ message: string }>> {
    try {
      const lines = await this.configRepository.getLines();
      const lineExists = lines.some(l => l.id === input.lineId);
      if (!lineExists) {
        return Result.failure(`Línea no existe`);
      }

      await this.configRepository.deleteLine(input.lineId);
      return Result.success({ message: `Línea eliminada` });
    } catch (error) {
      return Result.failure(`Error: ${error instanceof Error ? error.message : 'Error'}`);
    }
  }

  async listLines(input?: ListLinesInput): Promise<ResultType<ListLinesOutput>> {
    try {
      let lines = await this.configRepository.getLines();
      if (input?.operationType) {
        lines = lines.filter(line => line.operationType === input.operationType);
      }
      if (input?.activeOnly) {
        lines = lines.filter(line => line.isActive);
      }
      return Result.success({ lines: lines.map(line => line.toJSON()), total: lines.length });
    } catch (error) {
      return Result.failure(`Error: ${error instanceof Error ? error.message : 'Error'}`);
    }
  }
}
