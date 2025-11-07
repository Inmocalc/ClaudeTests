/**
 * useProcessConfig Hook
 * Connects UI to UpdateProcessConfigUseCase
 */

import { useState, useCallback, useMemo } from 'react';
import { UpdateProcessConfigUseCase } from '../../application/usecases/UpdateProcessConfigUseCase';
import { ConfigurationService } from '../../domain/services/ConfigurationService';
import { RepositoryFactory } from '../../infrastructure/persistence/RepositoryFactory';
import type { ProcessConfigData } from '../../domain/entities/ProcessConfig';
import type { UpdateProcessConfigInput } from '../../application/dto/UpdateProcessConfigDTO';

export function useProcessConfig() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useCase = useMemo(() => {
    const configRepo = RepositoryFactory.createConfigRepository();
    const configService = new ConfigurationService();
    return new UpdateProcessConfigUseCase(configRepo, configService);
  }, []);

  const getConfig = useCallback(async (modelId: string): Promise<ProcessConfigData[] | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await useCase.getConfig({ modelId });
      if (result.success) {
        return result.data.processes;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener configuración');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [useCase]);

  const updateConfig = useCallback(async (input: UpdateProcessConfigInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await useCase.updateConfig(input);
      if (result.success) {
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar configuración');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [useCase]);

  return { isLoading, error, getConfig, updateConfig };
}
