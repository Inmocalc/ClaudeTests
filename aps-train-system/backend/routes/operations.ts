/**
 * Operations Routes
 * REST API endpoints for managing operation types
 */

import { Router } from 'express';
import { ManageOperationsUseCase } from '../../application/usecases/ManageOperationsUseCase';
import { ConfigurationService } from '../../domain/services/ConfigurationService';
import { RepositoryFactory } from '../../infrastructure/persistence/RepositoryFactory';

export const operationsRouter = Router();

// Get all operations
operationsRouter.get('/', async (req, res) => {
  try {
    const configRepo = RepositoryFactory.createConfigRepository();
    const useCase = new ManageOperationsUseCase(configRepo, new ConfigurationService());

    const result = await useCase.listOperations({});

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error getting operations:', error);
    res.status(500).json({ error: 'Failed to get operations' });
  }
});

// Add new operation
operationsRouter.post('/', async (req, res) => {
  try {
    const configRepo = RepositoryFactory.createConfigRepository();
    const useCase = new ManageOperationsUseCase(configRepo, new ConfigurationService());

    const result = await useCase.addOperation(req.body);

    if (result.success) {
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error, errors: result.errors });
    }
  } catch (error) {
    console.error('Error adding operation:', error);
    res.status(500).json({ error: 'Failed to add operation' });
  }
});

// Delete operation
operationsRouter.delete('/:name', async (req, res) => {
  try {
    const configRepo = RepositoryFactory.createConfigRepository();
    const useCase = new ManageOperationsUseCase(configRepo, new ConfigurationService());

    const result = await useCase.deleteOperation({ operationName: req.params.name });

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error deleting operation:', error);
    res.status(500).json({ error: 'Failed to delete operation' });
  }
});
