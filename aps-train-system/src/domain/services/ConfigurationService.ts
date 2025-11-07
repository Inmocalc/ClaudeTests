/**
 * ConfigurationService - Domain Service
 * Contains business logic for system configuration
 *
 * Domain Service - Pure validation and configuration logic
 * Principles: SRP - Only responsible for configuration business rules
 */

import { ProductionLine } from '../entities/ProductionLine';
import { OperationType } from '../entities/OperationType';
import { ProcessConfig } from '../entities/ProcessConfig';

export interface ConfigurationValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ConfigurationService {
  /**
   * Validate new operation type
   */
  validateOperation(operation: OperationType, existingOperations: OperationType[]): ConfigurationValidationResult {
    const errors: string[] = [];

    // Check for duplicate name
    const duplicate = existingOperations.find(op => op.name === operation.name);
    if (duplicate) {
      errors.push(`Ya existe una operación con el nombre "${operation.name}"`);
    }

    // Validate defaults are reasonable
    if (operation.defaultDurationDays > 30) {
      errors.push('La duración por defecto no puede exceder 30 días');
    }

    if (operation.defaultWorkersRequired > 10) {
      errors.push('Los trabajadores por defecto no pueden exceder 10');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate operation can be deleted
   */
  canDeleteOperation(
    operationName: string,
    lines: ProductionLine[]
  ): ConfigurationValidationResult {
    const errors: string[] = [];

    // Check if any line uses this operation
    const linesUsingOperation = lines.filter(line => line.operationType === operationName);

    if (linesUsingOperation.length > 0) {
      errors.push(
        `No se puede eliminar la operación "${operationName}" porque está siendo usada por ${linesUsingOperation.length} línea(s) de producción`
      );
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate new production line
   */
  validateLine(
    line: ProductionLine,
    existingLines: ProductionLine[],
    availableOperations: OperationType[]
  ): ConfigurationValidationResult {
    const errors: string[] = [];

    // Check if operation type exists
    const operationExists = availableOperations.some(op => op.name === line.operationType);
    if (!operationExists) {
      errors.push(`El tipo de operación "${line.operationType}" no existe`);
    }

    // Check for duplicate line number for same operation
    const duplicateLine = existingLines.find(
      existing =>
        existing.operationType === line.operationType &&
        existing.lineNumber === line.lineNumber &&
        existing.id !== line.id
    );

    if (duplicateLine) {
      errors.push(
        `Ya existe la línea ${line.lineNumber} para la operación "${line.operationType}"`
      );
    }

    // Validate workers
    if (line.workersRequired > 10) {
      errors.push('Una línea no puede requerir más de 10 trabajadores');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate process configuration for a model
   */
  validateProcessConfig(
    processConfigs: ProcessConfig[],
    availableOperations: OperationType[]
  ): ConfigurationValidationResult {
    const errors: string[] = [];

    // Check if empty
    if (processConfigs.length === 0) {
      errors.push('El modelo debe tener al menos un proceso configurado');
    }

    // Check that all operation types exist
    processConfigs.forEach(config => {
      const operationExists = availableOperations.some(op => op.name === config.operationType);
      if (!operationExists) {
        errors.push(
          `El tipo de operación "${config.operationType}" en el proceso "${config.processName}" no existe`
        );
      }
    });

    // Check for duplicate process names
    const processNames = processConfigs.map(c => c.processName);
    const duplicates = processNames.filter((name, index) => processNames.indexOf(name) !== index);

    if (duplicates.length > 0) {
      errors.push(`Procesos duplicados: ${duplicates.join(', ')}`);
    }

    // Check sequence order is consecutive
    const sequenceOrders = processConfigs.map(c => c.sequenceOrder).sort((a, b) => a - b);
    for (let i = 0; i < sequenceOrders.length; i++) {
      if (sequenceOrders[i] !== i) {
        errors.push('El orden de secuencia debe ser consecutivo desde 0');
        break;
      }
    }

    // Check total duration is reasonable
    const totalDuration = processConfigs.reduce((sum, config) => sum + config.durationDays, 0);
    if (totalDuration > 60) {
      errors.push(`La duración total (${totalDuration} días) es muy alta. Considere reducir las duraciones.`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate default process config from operation type
   */
  createDefaultProcessConfig(
    operationType: OperationType,
    processName: string,
    sequenceOrder: number
  ): ProcessConfig {
    return ProcessConfig.create({
      processName,
      operationType: operationType.name,
      durationDays: operationType.defaultDurationDays,
      workersRequired: operationType.defaultWorkersRequired,
      sequenceOrder
    });
  }

  /**
   * Calculate total production time for a model
   */
  calculateTotalDuration(processConfigs: ProcessConfig[]): number {
    return processConfigs.reduce((sum, config) => sum + config.durationDays, 0);
  }

  /**
   * Get operation types used in process configs
   */
  getUsedOperationTypes(processConfigs: ProcessConfig[]): string[] {
    const operationTypes = new Set<string>();
    processConfigs.forEach(config => operationTypes.add(config.operationType));
    return Array.from(operationTypes);
  }

  /**
   * Suggest default line configuration for an operation
   */
  suggestLineConfiguration(
    operationType: OperationType,
    existingLines: ProductionLine[]
  ): { lineNumber: number; workersRequired: number } {
    // Find highest line number for this operation type
    const linesForOperation = existingLines.filter(line => line.operationType === operationType.name);
    const maxLineNumber = linesForOperation.reduce(
      (max, line) => Math.max(max, line.lineNumber),
      0
    );

    return {
      lineNumber: maxLineNumber + 1,
      workersRequired: operationType.defaultWorkersRequired
    };
  }
}
