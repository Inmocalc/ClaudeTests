/**
 * Process Configuration Routes
 * REST API endpoints for managing process configurations per model
 */

import { Router } from 'express';
import { UpdateProcessConfigUseCase } from '../../application/usecases/UpdateProcessConfigUseCase';
import { ConfigurationService } from '../../domain/services/ConfigurationService';
import { RepositoryFactory } from '../../infrastructure/persistence/RepositoryFactory';

export const processConfigRouter = Router();

// Get process configuration for a model
processConfigRouter.get('/:modelId', async (req, res) => {
  try {
    const configRepo = RepositoryFactory.createConfigRepository();
    const useCase = new UpdateProcessConfigUseCase(configRepo, new ConfigurationService());

    const result = await useCase.getConfig({ modelId: req.params.modelId });

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error getting process config:', error);
    res.status(500).json({ error: 'Failed to get process configuration' });
  }
});

// Update process configuration for a model
processConfigRouter.put('/:modelId', async (req, res) => {
  try {
    const configRepo = RepositoryFactory.createConfigRepository();
    const useCase = new UpdateProcessConfigUseCase(configRepo, new ConfigurationService());

    const result = await useCase.updateConfig({
      modelId: req.params.modelId,
      processes: req.body.processes
    });

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error, errors: result.errors });
    }
  } catch (error) {
    console.error('Error updating process config:', error);
    res.status(500).json({ error: 'Failed to update process configuration' });
  }
});
