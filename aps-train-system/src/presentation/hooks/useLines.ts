/**
 * useLines Hook
 * Connects UI to backend API for production lines management
 */

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import type { ProductionLineData } from '../../domain/entities/ProductionLine';
import type { ConfigureLineInput } from '../../application/dto/ConfigureLineDTO';

export function useLines() {
  const [lines, setLines] = useState<ProductionLineData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLines = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.getLines();
      setLines(result.lines);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar líneas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addLine = useCallback(async (input: ConfigureLineInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.addLine(input);
      await loadLines();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al añadir línea');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadLines]);

  const deleteLine = useCallback(async (lineId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.deleteLine(lineId);
      await loadLines();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar línea');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadLines]);

  useEffect(() => {
    loadLines();
  }, [loadLines]);

  return { lines, isLoading, error, addLine, deleteLine, refreshLines: loadLines };
}
