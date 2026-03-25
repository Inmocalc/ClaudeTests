/**
 * useScheduling Hook
 * Connects UI to backend API for scheduling operations
 */

import { useState, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import type { ScheduleOrdersInput, ScheduleOrdersOutput } from '../../application/dto/ScheduleOrdersDTO';

export function useScheduling() {
  const [isScheduling, setIsScheduling] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleOrdersOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeScheduling = useCallback(async (input: ScheduleOrdersInput = {}) => {
    setIsScheduling(true);
    setError(null);

    try {
      const result = await apiClient.executeScheduling(input);
      setSchedule(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al ejecutar planificación');
      setSchedule(null);
    } finally {
      setIsScheduling(false);
    }
  }, []);

  return {
    schedule,
    isScheduling,
    error,
    executeScheduling
  };
}
