/**
 * Scheduling Routes
 * REST API endpoints for executing scheduling algorithm
 */

import { Router } from 'express';
import { ScheduleOrdersUseCase } from '../../application/usecases/ScheduleOrdersUseCase';
import { SchedulingService } from '../../domain/services/SchedulingService';
import { ValidationService } from '../../domain/services/ValidationService';
import { RepositoryFactory } from '../../infrastructure/persistence/RepositoryFactory';

export const schedulingRouter = Router();

// Execute scheduling
schedulingRouter.post('/execute', async (req, res) => {
  try {
    const orderRepo = RepositoryFactory.createOrderRepository();
    const configRepo = RepositoryFactory.createConfigRepository();
    const schedulingService = new SchedulingService();
    const validationService = new ValidationService();

    const useCase = new ScheduleOrdersUseCase(
      orderRepo,
      configRepo,
      schedulingService,
      validationService
    );

    const result = await useCase.execute(req.body || {});

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error, errors: result.errors });
    }
  } catch (error) {
    console.error('Error executing scheduling:', error);
    res.status(500).json({ error: 'Failed to execute scheduling' });
  }
});
