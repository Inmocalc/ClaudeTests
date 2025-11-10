/**
 * Production Lines Routes
 * REST API endpoints for managing production lines
 */

import { Router } from 'express';
import { ConfigureLineUseCase } from '../../application/usecases/ConfigureLineUseCase';
import { ConfigurationService } from '../../domain/services/ConfigurationService';
import { RepositoryFactory } from '../../infrastructure/persistence/RepositoryFactory';

export const linesRouter = Router();

// Get all lines
linesRouter.get('/', async (req, res) => {
  try {
    const configRepo = RepositoryFactory.createConfigRepository();
    const useCase = new ConfigureLineUseCase(configRepo, new ConfigurationService());

    const result = await useCase.listLines({});

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error getting lines:', error);
    res.status(500).json({ error: 'Failed to get lines' });
  }
});

// Add new line
linesRouter.post('/', async (req, res) => {
  try {
    const configRepo = RepositoryFactory.createConfigRepository();
    const useCase = new ConfigureLineUseCase(configRepo, new ConfigurationService());

    const result = await useCase.configureLine(req.body);

    if (result.success) {
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error, errors: result.errors });
    }
  } catch (error) {
    console.error('Error adding line:', error);
    res.status(500).json({ error: 'Failed to add line' });
  }
});

// Delete line
linesRouter.delete('/:id', async (req, res) => {
  try {
    const configRepo = RepositoryFactory.createConfigRepository();
    const useCase = new ConfigureLineUseCase(configRepo, new ConfigurationService());

    const result = await useCase.deleteLine({ lineId: req.params.id });

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error deleting line:', error);
    res.status(500).json({ error: 'Failed to delete line' });
  }
});
