/**
 * useProcessConfig Hook
 * Connects UI to backend API for process configuration management
 */

import { useState, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import type { ProcessConfigData } from '../../domain/entities/ProcessConfig';
import type { UpdateProcessConfigInput } from '../../application/dto/UpdateProcessConfigDTO';

export function useProcessConfig() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getConfig = useCallback(async (modelId: string): Promise<ProcessConfigData[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.getProcessConfig(modelId);
      return result.processes;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener configuración');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (input: UpdateProcessConfigInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.updateProcessConfig(input.modelId, input.processes);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar configuración');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, getConfig, updateConfig };
}
