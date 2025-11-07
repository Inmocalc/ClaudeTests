import type { IConfigRepository } from '../../domain/repositories/IConfigRepository';
import { ConfigurationService } from '../../domain/services/ConfigurationService';
import { ProcessConfig } from '../../domain/entities/ProcessConfig';
import type { UpdateProcessConfigInput, UpdateProcessConfigOutput } from '../dto/UpdateProcessConfigDTO';
import { Result } from '../dto/Result';
import type { Result as ResultType } from '../dto/Result';

export class UpdateProcessConfigUseCase {
  readonly configRepository: IConfigRepository;
  readonly configurationService: ConfigurationService;

  constructor(configRepository: IConfigRepository, configurationService: ConfigurationService) {
    this.configRepository = configRepository;
    this.configurationService = configurationService;
  }

  async updateConfig(input: UpdateProcessConfigInput): Promise<ResultType<UpdateProcessConfigOutput>> {
    try {
      const processConfigs = input.processes.map(p => ProcessConfig.create(p));
      const availableOperations = await this.configRepository.getOperations();
      const validation = this.configurationService.validateProcessConfig(processConfigs, availableOperations);

      if (!validation.isValid) {
        return Result.failure('Validación falló', validation.errors);
      }

      await this.configRepository.saveProcessConfig(input.modelId, processConfigs);
      const totalDuration = this.configurationService.calculateTotalDuration(processConfigs);

      return Result.success({
        modelId: input.modelId,
        processes: processConfigs.map(p => p.toJSON()),
        totalDuration,
        message: 'Configuración actualizada'
      });
    } catch (error) {
      return Result.failure('Error al actualizar');
    }
  }
}
