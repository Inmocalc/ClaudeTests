import React, { useState } from 'react';
import { useOperations } from '../hooks';
import type { AddOperationInput } from '../../application/dto/ManageOperationsDTO';

export function OperationsManager(): React.ReactElement {
  const { operations, isLoading, error, addOperation, deleteOperation } = useOperations();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<AddOperationInput>({
    name: '',
    description: '',
    defaultDurationDays: 1,
    defaultWorkersRequired: 1,
    color: '#3B82F6'
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormError(null);

    const success = await addOperation(formData);
    if (success) {
      setFormData({
        name: '',
        description: '',
        defaultDurationDays: 1,
        defaultWorkersRequired: 1,
        color: '#3B82F6'
      });
      setShowForm(false);
    } else {
      setFormError('Error al añadir la operación. Verifica que no exista ya.');
    }
  };

  const handleDelete = async (operationName: string): Promise<void> => {
    if (window.confirm(`¿Estás seguro de eliminar la operación "${operationName}"?`)) {
      await deleteOperation(operationName);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <p className="text-gray-600">Cargando operaciones...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#141B4D]">Gestión de Operaciones</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#141B4D] text-white rounded hover:bg-[#1a2359] transition"
        >
          {showForm ? 'Cancelar' : '+ Nueva Operación'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#141B4D]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 px-1 border border-gray-300 rounded"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#141B4D]"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración por defecto (días) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.defaultDurationDays}
                onChange={(e) => setFormData({ ...formData, defaultDurationDays: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#141B4D]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trabajadores requeridos *
              </label>
              <input
                type="number"
                min="1"
                value={formData.defaultWorkersRequired}
                onChange={(e) => setFormData({ ...formData, defaultWorkersRequired: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#141B4D]"
                required
              />
            </div>
          </div>

          {formError && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">
              {formError}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-[#141B4D] text-white rounded hover:bg-[#1a2359] transition"
            >
              Añadir Operación
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Color</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Descripción</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Duración (días)</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Trabajadores</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {operations.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No hay operaciones configuradas. Añade la primera operación.
                </td>
              </tr>
            ) : (
              operations.map((operation) => (
                <tr key={operation.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: operation.color }}
                    />
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{operation.name}</td>
                  <td className="py-3 px-4 text-gray-600">{operation.description}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{operation.defaultDurationDays}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{operation.defaultWorkersRequired}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDelete(operation.name)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
