/**
 * useOperations Hook
 * Connects UI to ManageOperationsUseCase
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { ManageOperationsUseCase } from '../../application/usecases/ManageOperationsUseCase';
import { ConfigurationService } from '../../domain/services/ConfigurationService';
import { RepositoryFactory } from '../../infrastructure/persistence/RepositoryFactory';
import type { OperationTypeData } from '../../domain/entities/OperationType';
import type { AddOperationInput } from '../../application/dto/ManageOperationsDTO';

export function useOperations() {
  const [operations, setOperations] = useState<OperationTypeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useCase = useMemo(() => {
    const configRepo = RepositoryFactory.createConfigRepository();
    const configService = new ConfigurationService();
    return new ManageOperationsUseCase(configRepo, configService);
  }, []);

  const loadOperations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await useCase.listOperations();
      if (result.success) {
        setOperations(result.data.operations);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar operaciones');
    } finally {
      setIsLoading(false);
    }
  }, [useCase]);

  const addOperation = useCallback(async (input: AddOperationInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await useCase.addOperation(input);
      if (result.success) {
        await loadOperations();
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al añadir operación');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [useCase, loadOperations]);

  const deleteOperation = useCallback(async (operationName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await useCase.deleteOperation({ operationName });
      if (result.success) {
        await loadOperations();
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar operación');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [useCase, loadOperations]);

  useEffect(() => {
    loadOperations();
  }, [loadOperations]);

  return {
    operations,
    isLoading,
    error,
    addOperation,
    deleteOperation,
    refreshOperations: loadOperations
  };
}
