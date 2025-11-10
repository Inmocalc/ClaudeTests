/**
 * useOperations Hook
 * Connects UI to backend API for operations management
 */

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import type { OperationTypeData } from '../../domain/entities/OperationType';
import type { AddOperationInput } from '../../application/dto/ManageOperationsDTO';

export function useOperations() {
  const [operations, setOperations] = useState<OperationTypeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOperations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.getOperations();
      setOperations(result.operations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar operaciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addOperation = useCallback(async (input: AddOperationInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.addOperation(input);
      await loadOperations();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al añadir operación');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadOperations]);

  const deleteOperation = useCallback(async (operationName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.deleteOperation(operationName);
      await loadOperations();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar operación');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadOperations]);

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
