import type { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import type { IConfigRepository } from '../../domain/repositories/IConfigRepository';
import { SchedulingService } from '../../domain/services/SchedulingService';
import { ValidationService } from '../../domain/services/ValidationService';
import { TrainModel } from '../../domain/entities/TrainModel';
import type { ScheduleOrdersInput, ScheduleOrdersOutput } from '../dto/ScheduleOrdersDTO';
import { Result } from '../dto/Result';
import type { Result as ResultType } from '../dto/Result';

export class ScheduleOrdersUseCase {
  readonly orderRepository: IOrderRepository;
  readonly configRepository: IConfigRepository;
  readonly schedulingService: SchedulingService;
  readonly validationService: ValidationService;

  constructor(
    orderRepository: IOrderRepository,
    configRepository: IConfigRepository,
    schedulingService: SchedulingService,
    validationService: ValidationService
  ) {
    this.orderRepository = orderRepository;
    this.configRepository = configRepository;
    this.schedulingService = schedulingService;
    this.validationService = validationService;
  }

  async execute(input: ScheduleOrdersInput): Promise<ResultType<ScheduleOrdersOutput>> {
    const startTime = Date.now();
    try {
      const orders = await this.orderRepository.getPendingOrdersSorted();
      if (orders.length === 0) {
        return Result.failure('No hay órdenes pendientes');
      }

      const lines = await this.configRepository.getLines();
      const activeLines = lines.filter(line => line.isActive);
      if (activeLines.length === 0) {
        return Result.failure('No hay líneas activas');
      }

      const models = await this.buildTrainModels();
      if (models.length === 0) {
        return Result.failure('No hay modelos configurados');
      }

      const startDate = input.startDate || new Date().toISOString().split('T')[0];
      const horizonDays = input.horizonDays || 30;
      const workerAvailability = this.generateWorkerAvailability(startDate, horizonDays);

      const schedulingResult = this.schedulingService.schedule({
        orders,
        lines: activeLines,
        models,
        workerAvailability,
        startDate,
        horizonDays
      });

      const validation = this.validationService.validate(
        schedulingResult.scheduledProcesses,
        orders,
        schedulingResult.completionDates,
        schedulingResult.resourceUsage
      );

      const output: ScheduleOrdersOutput = {
        scheduledProcesses: schedulingResult.scheduledProcesses,
        completionDates: schedulingResult.completionDates,
        resourceUsage: schedulingResult.resourceUsage,
        validation,
        metadata: {
          totalOrders: orders.length,
          scheduledOrders: new Set(schedulingResult.scheduledProcesses.map(p => p.orderId)).size,
          totalProcesses: schedulingResult.scheduledProcesses.length,
          executionTimeMs: Date.now() - startTime
        }
      };

      return Result.success(output);
    } catch (error) {
      return Result.failure('Error al programar órdenes');
    }
  }

  private async buildTrainModels(): Promise<TrainModel[]> {
    const configuredModelIds = await this.configRepository.getConfiguredModels();
    const models: TrainModel[] = [];

    for (const modelId of configuredModelIds) {
      const processConfigs = await this.configRepository.getProcessConfig(modelId);
      if (processConfigs.length > 0) {
        models.push(TrainModel.create({
          id: modelId,
          description: `Modelo ${modelId}`,
          processes: processConfigs
        }));
      }
    }
    return models;
  }

  private generateWorkerAvailability(startDate: string, horizonDays: number) {
    const availability = [];
    const start = new Date(startDate);

    for (let i = 0; i < horizonDays; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      availability.push({
        date: date.toISOString().split('T')[0],
        availableWorkers: 5
      });
    }
    return availability;
  }
}
