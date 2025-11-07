import React, { useState, useEffect } from 'react';
import { useProcessConfig, useOperations } from '../hooks';
import type { ProcessConfigData } from '../../application/dto/UpdateProcessConfigDTO';

export function ProcessConfigEditor(): React.ReactElement {
  const { getConfig, updateConfig, isLoading, error } = useProcessConfig();
  const { operations } = useOperations();
  const [selectedModel, setSelectedModel] = useState<string>('A');
  const [processes, setProcesses] = useState<ProcessConfigData[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newProcess, setNewProcess] = useState<ProcessConfigData>({
    processName: '',
    operationType: '',
    durationDays: 1,
    workersRequired: 1,
    sequenceOrder: 1
  });

  useEffect(() => {
    loadConfig();
  }, [selectedModel]);

  const loadConfig = async (): Promise<void> => {
    const config = await getConfig(selectedModel);
    setProcesses(config || []);
  };

  const handleAddProcess = (): void => {
    const nextSequence = processes.length > 0
      ? Math.max(...processes.map(p => p.sequenceOrder)) + 1
      : 1;

    const processToAdd: ProcessConfigData = {
      ...newProcess,
      sequenceOrder: nextSequence
    };

    setProcesses([...processes, processToAdd]);
    setNewProcess({
      processName: '',
      operationType: '',
      durationDays: 1,
      workersRequired: 1,
      sequenceOrder: 1
    });
    setShowAddForm(false);
  };

  const handleRemoveProcess = (index: number): void => {
    const updated = processes.filter((_, i) => i !== index);
    // Recalcular secuencias
    const resequenced = updated.map((p, i) => ({ ...p, sequenceOrder: i + 1 }));
    setProcesses(resequenced);
  };

  const handleMoveUp = (index: number): void => {
    if (index === 0) return;
    const updated = [...processes];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    // Recalcular secuencias
    const resequenced = updated.map((p, i) => ({ ...p, sequenceOrder: i + 1 }));
    setProcesses(resequenced);
  };

  const handleMoveDown = (index: number): void => {
    if (index === processes.length - 1) return;
    const updated = [...processes];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    // Recalcular secuencias
    const resequenced = updated.map((p, i) => ({ ...p, sequenceOrder: i + 1 }));
    setProcesses(resequenced);
  };

  const handleSave = async (): Promise<void> => {
    setSaveSuccess(false);
    const success = await updateConfig({
      modelId: selectedModel,
      processes: processes.map(p => ({
        processName: p.processName,
        operationType: p.operationType,
        durationDays: p.durationDays,
        workersRequired: p.workersRequired,
        sequenceOrder: p.sequenceOrder
      }))
    });
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const getOperationColor = (operationType: string): string => {
    const operation = operations.find(op => op.name === operationType);
    return operation?.color || '#6B7280';
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <p className="text-gray-600">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#141B4D] mb-4">Configuración de Procesos por Modelo</h2>

        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Seleccionar Modelo:
          </label>
          <div className="flex gap-2">
            {['A', 'B', 'C'].map((model) => (
              <button
                key={model}
                onClick={() => setSelectedModel(model)}
                className={`px-6 py-2 rounded transition ${
                  selectedModel === model
                    ? 'bg-[#141B4D] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Modelo {model}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          Configuración guardada correctamente
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            Secuencia de Procesos - Modelo {selectedModel}
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-[#141B4D] text-white rounded hover:bg-[#1a2359] transition text-sm"
          >
            {showAddForm ? 'Cancelar' : '+ Añadir Proceso'}
          </button>
        </div>

        {showAddForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Proceso *
                </label>
                <input
                  type="text"
                  value={newProcess.processName}
                  onChange={(e) => setNewProcess({ ...newProcess, processName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#141B4D]"
                  placeholder="ej: Torneado de ejes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Operación *
                </label>
                <select
                  value={newProcess.operationType}
                  onChange={(e) => setNewProcess({ ...newProcess, operationType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#141B4D]"
                >
                  <option value="">Seleccionar...</option>
                  {operations.map((op) => (
                    <option key={op.name} value={op.name}>
                      {op.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (días) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={newProcess.durationDays}
                  onChange={(e) => setNewProcess({ ...newProcess, durationDays: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#141B4D]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trabajadores Requeridos *
                </label>
                <input
                  type="number"
                  min="1"
                  value={newProcess.workersRequired}
                  onChange={(e) => setNewProcess({ ...newProcess, workersRequired: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#141B4D]"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAddProcess}
                disabled={!newProcess.processName || !newProcess.operationType}
                className="px-6 py-2 bg-[#141B4D] text-white rounded hover:bg-[#1a2359] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Añadir a la Secuencia
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        {processes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            No hay procesos configurados para el Modelo {selectedModel}. Añade el primer proceso.
          </div>
        ) : (
          <div className="space-y-2">
            {processes.map((process, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition"
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="text-gray-600 hover:text-[#141B4D] disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover arriba"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === processes.length - 1}
                    className="text-gray-600 hover:text-[#141B4D] disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover abajo"
                  >
                    ▼
                  </button>
                </div>

                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#141B4D] text-white font-bold text-sm">
                  {process.sequenceOrder}
                </div>

                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getOperationColor(process.operationType) }}
                  title={process.operationType}
                />

                <div className="flex-1">
                  <div className="font-medium text-gray-900">{process.processName}</div>
                  <div className="text-sm text-gray-600">
                    {process.operationType} · {process.durationDays} días · {process.workersRequired} trabajadores
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveProcess(index)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          Guardar Configuración del Modelo {selectedModel}
        </button>
      </div>
    </div>
  );
}
