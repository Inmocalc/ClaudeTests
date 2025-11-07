import React, { useState } from 'react';
import type { ProductionOrder, TrainModel } from '../../types/interfaces';
import { formatISO, addDays, parseISO } from 'date-fns';

interface ConfigurationPanelProps {
  trainModels: TrainModel[];
  startDate: string;
  onAddOrder: (order: Omit<ProductionOrder, 'priority' | 'status' | 'createdAt'>) => void;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  trainModels,
  startDate,
  onAddOrder,
}) => {
  const [selectedModel, setSelectedModel] = useState<'A' | 'B' | 'C'>('A');
  const [orderId, setOrderId] = useState('');
  const [dueDate, setDueDate] = useState(
    formatISO(addDays(parseISO(startDate), 7), { representation: 'date' })
  );
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId.trim()) {
      alert('Por favor, ingresa un ID de orden');
      return;
    }

    const newOrder: Omit<ProductionOrder, 'priority' | 'status' | 'createdAt'> = {
      id: orderId.trim(),
      modelType: selectedModel,
      dueDate,
    };

    onAddOrder(newOrder);

    // Reiniciar formulario
    setOrderId('');
    setShowForm(false);
  };

  return (
    <div>
      {/* Botón Añadir Orden */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-gradient-to-r from-metro-blue to-metro-blue-light hover:from-metro-blue-light hover:to-metro-blue text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg mb-4"
        >
          <span className="text-lg">+</span> Añadir Orden de Trabajo
        </button>
      )}

      {/* Formulario de Nueva Orden */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border-2 border-metro-blue rounded-lg bg-blue-50">
          <h3 className="font-bold mb-3 text-metro-blue text-lg">Nueva Orden de Mantenimiento</h3>

          {/* ID de Orden */}
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              ID de Orden
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="ej: A3, B3, C2"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-metro-blue focus:border-metro-blue"
              required
            />
          </div>

          {/* Selección de Modelo */}
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Modelo de Tren
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as 'A' | 'B' | 'C')}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-metro-blue focus:border-metro-blue font-semibold"
            >
              {trainModels.map((model) => (
                <option key={model.id} value={model.id}>
                  Modelo {model.id} - {model.description}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha de Entrega */}
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Fecha de Entrega
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-metro-blue focus:border-metro-blue"
              required
            />
          </div>

          {/* Información del Proceso */}
          <div className="mb-3 p-3 bg-white border-2 border-metro-blue rounded-lg text-xs">
            <strong className="text-metro-blue">Tiempos del Modelo {selectedModel}:</strong>
            <ul className="mt-2 ml-4 list-disc text-gray-700">
              {trainModels
                .find((m) => m.id === selectedModel)
                ?.processes.map((p: { name: string; durationDays: number }) => (
                  <li key={p.name} className="mb-1">
                    <strong>{p.name}:</strong> {p.durationDays} día{p.durationDays > 1 ? 's' : ''}
                  </li>
                ))}
            </ul>
            <div className="mt-2 font-bold text-metro-blue">
              Duración total: {trainModels.find((m) => m.id === selectedModel)?.totalDurationDays} días
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md"
            >
              ✓ Crear Orden
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setOrderId('');
              }}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md"
            >
              ✕ Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Información del Sistema */}
      <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border-2 border-gray-200 text-sm">
        <h3 className="font-bold mb-3 text-metro-blue flex items-center gap-2">
          <span>ℹ️</span> Información del Sistema
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Fecha de Inicio:</span>
            <span className="text-metro-blue font-bold">{new Date(startDate).toLocaleDateString('es-ES')}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Horizonte de Planificación:</span>
            <span className="text-metro-blue font-bold">10 días</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Personal Total:</span>
            <span className="text-metro-blue font-bold">5 trabajadores</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-gray-200">
          <strong className="text-xs font-bold text-metro-blue">Líneas de Producción:</strong>
          <ul className="mt-2 text-xs space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-metro-blue">→</span>
              <span><strong>Preparación:</strong> 2 líneas (2 trabajadores c/u)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-metro-blue">→</span>
              <span><strong>Torneado:</strong> 1 línea (1 trabajador)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-metro-blue">→</span>
              <span><strong>Pintado:</strong> 1 línea (1 trabajador)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Referencia de Modelos */}
      <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border-2 border-gray-200 text-sm">
        <h3 className="font-bold mb-3 text-metro-blue flex items-center gap-2">
          <span>🚊</span> Modelos de Tren
        </h3>
        <div className="space-y-2">
          {trainModels.map((model) => (
            <div key={model.id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border-2 border-white shadow-md"
                  style={{ backgroundColor: model.color }}
                ></div>
                <span className="text-xs font-bold">
                  Modelo {model.id}
                </span>
              </div>
              <span className="text-xs text-gray-600">
                {model.totalDurationDays} días
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
