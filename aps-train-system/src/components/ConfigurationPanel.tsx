import React, { useState } from 'react';
import type { ProductionOrder, TrainModel } from '../types/interfaces';
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
      alert('Please enter an Order ID');
      return;
    }

    const newOrder: Omit<ProductionOrder, 'priority' | 'status' | 'createdAt'> = {
      id: orderId.trim(),
      modelType: selectedModel,
      dueDate,
    };

    onAddOrder(newOrder);

    // Reset form
    setOrderId('');
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-bold mb-4">Configuration</h2>

      {/* Add Order Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors mb-4"
        >
          + Add Order
        </button>
      )}

      {/* Add Order Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3">New Production Order</h3>

          {/* Order ID */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g., A3, B3, C2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Model Selection */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Train Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as 'A' | 'B' | 'C')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {trainModels.map((model) => (
                <option key={model.id} value={model.id}>
                  Model {model.id} - {model.description}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Process Info */}
          <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
            <strong>Model {selectedModel} process times:</strong>
            <ul className="mt-1 ml-4 list-disc">
              {trainModels
                .find((m) => m.id === selectedModel)
                ?.processes.map((p) => (
                  <li key={p.name}>
                    {p.name}: {p.durationDays} day(s)
                  </li>
                ))}
            </ul>
            <div className="mt-1 font-semibold">
              Total duration: {trainModels.find((m) => m.id === selectedModel)?.totalDurationDays} days
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              Add Order
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setOrderId('');
              }}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* System Info */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg text-sm">
        <h3 className="font-semibold mb-2">System Information</h3>

        <div className="space-y-1 text-xs text-gray-600">
          <div>
            <strong>Start Date:</strong> {new Date(startDate).toLocaleDateString('es-ES')}
          </div>
          <div>
            <strong>Planning Horizon:</strong> 10 days
          </div>
          <div>
            <strong>Total Workers:</strong> 5 (variable availability)
          </div>
        </div>

        <div className="mt-3">
          <strong className="text-xs">Production Lines:</strong>
          <ul className="mt-1 text-xs text-gray-600 space-y-1">
            <li>• Preparación: 2 lines (2 workers each)</li>
            <li>• Torneado: 1 line (1 worker)</li>
            <li>• Pintado: 1 line (1 worker)</li>
          </ul>
        </div>
      </div>

      {/* Model Reference */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
        <h3 className="font-semibold mb-2">Train Models</h3>
        <div className="space-y-2">
          {trainModels.map((model) => (
            <div key={model.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: model.color }}
              ></div>
              <span className="text-xs">
                <strong>Model {model.id}:</strong> {model.totalDurationDays} days total
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
