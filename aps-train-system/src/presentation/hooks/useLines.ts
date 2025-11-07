/**
 * useLines Hook
 * Connects UI to ConfigureLineUseCase
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { ConfigureLineUseCase } from '../../application/usecases/ConfigureLineUseCase';
import { ConfigurationService } from '../../domain/services/ConfigurationService';
import { RepositoryFactory } from '../../infrastructure/persistence/RepositoryFactory';
import type { ProductionLineData } from '../../domain/entities/ProductionLine';
import type { ConfigureLineInput } from '../../application/dto/ConfigureLineDTO';

export function useLines() {
  const [lines, setLines] = useState<ProductionLineData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useCase = useMemo(() => {
    const configRepo = RepositoryFactory.createConfigRepository();
    const configService = new ConfigurationService();
    return new ConfigureLineUseCase(configRepo, configService);
  }, []);

  const loadLines = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await useCase.listLines();
      if (result.success) {
        setLines(result.data.lines);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar líneas');
    } finally {
      setIsLoading(false);
    }
  }, [useCase]);

  const addLine = useCallback(async (input: ConfigureLineInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await useCase.configureLine(input);
      if (result.success) {
        await loadLines();
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al añadir línea');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [useCase, loadLines]);

  const deleteLine = useCallback(async (lineId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await useCase.deleteLine({ lineId });
      if (result.success) {
        await loadLines();
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar línea');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [useCase, loadLines]);

  useEffect(() => {
    loadLines();
  }, [loadLines]);

  return { lines, isLoading, error, addLine, deleteLine, refreshLines: loadLines };
}
