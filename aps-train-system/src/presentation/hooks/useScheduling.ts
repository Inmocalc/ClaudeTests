/**
 * useScheduling Hook
 * Connects UI to ScheduleOrdersUseCase
 */

import { useState, useCallback, useMemo } from 'react';
import { ScheduleOrdersUseCase } from '../../application/usecases/ScheduleOrdersUseCase';
import { SchedulingService } from '../../domain/services/SchedulingService';
import { ValidationService } from '../../domain/services/ValidationService';
import { RepositoryFactory } from '../../infrastructure/persistence/RepositoryFactory';
import type { ScheduleOrdersInput, ScheduleOrdersOutput } from '../../application/dto/ScheduleOrdersDTO';

export function useScheduling() {
  const [isScheduling, setIsScheduling] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleOrdersOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const useCase = useMemo(() => {
    const orderRepo = RepositoryFactory.createOrderRepository();
    const configRepo = RepositoryFactory.createConfigRepository();
    const schedulingService = new SchedulingService();
    const validationService = new ValidationService();

    return new ScheduleOrdersUseCase(
      orderRepo,
      configRepo,
      schedulingService,
      validationService
    );
  }, []);

  const executeScheduling = useCallback(async (input: ScheduleOrdersInput = {}) => {
    setIsScheduling(true);
    setError(null);

    try {
      const result = await useCase.execute(input);

      if (result.success) {
        setSchedule(result.data);
      } else {
        setError(result.error);
        setSchedule(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setSchedule(null);
    } finally {
      setIsScheduling(false);
    }
  }, [useCase]);

  return {
    schedule,
    isScheduling,
    error,
    executeScheduling
  };
}
