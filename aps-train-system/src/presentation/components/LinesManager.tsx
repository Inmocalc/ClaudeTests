import React, { useState } from 'react';
import { useLines, useOperations } from '../hooks';
import type { AddLineInput } from '../../application/dto/ConfigureLineDTO';

export function LinesManager(): React.ReactElement {
  const { lines, isLoading, error, addLine, deleteLine } = useLines();
  const { operations } = useOperations();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<AddLineInput>({
    operationType: '',
    lineNumber: 1,
    workersRequired: 1,
    isActive: true
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormError(null);

    if (!formData.operationType) {
      setFormError('Debes seleccionar un tipo de operación');
      return;
    }

    const success = await addLine(formData);
    if (success) {
      setFormData({
        operationType: '',
        lineNumber: 1,
        workersRequired: 1,
        isActive: true
      });
      setShowForm(false);
    } else {
      setFormError('Error al añadir la línea. Verifica que el número de línea no exista ya para esta operación.');
    }
  };

  const handleDelete = async (lineId: string, operationType: string, lineNumber: number): Promise<void> => {
    if (window.confirm(`¿Estás seguro de eliminar la línea ${operationType} #${lineNumber}?`)) {
      await deleteLine(lineId);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <p className="text-gray-600">Cargando líneas de producción...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#141B4D]">Gestión de Líneas de Producción</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#141B4D] text-white rounded hover:bg-[#1a2359] transition"
        >
          {showForm ? 'Cancelar' : '+ Nueva Línea'}
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
                Tipo de Operación *
              </label>
              <select
                value={formData.operationType}
                onChange={(e) => setFormData({ ...formData, operationType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#141B4D]"
                required
              >
                <option value="">Seleccionar operación...</option>
                {operations.map((op) => (
                  <option key={op.name} value={op.name}>
                    {op.name}
                  </option>
                ))}
              </select>
              {operations.length === 0 && (
                <p className="mt-1 text-sm text-amber-600">
                  Primero debes crear operaciones
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Línea *
              </label>
              <input
                type="number"
                min="1"
                value={formData.lineNumber}
                onChange={(e) => setFormData({ ...formData, lineNumber: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#141B4D]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trabajadores Requeridos *
              </label>
              <input
                type="number"
                min="1"
                value={formData.workersRequired}
                onChange={(e) => setFormData({ ...formData, workersRequired: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#141B4D]"
                required
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#141B4D] border-gray-300 rounded focus:ring-[#141B4D]"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Línea activa</span>
              </label>
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
              disabled={operations.length === 0}
            >
              Añadir Línea
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo de Operación</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Número</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Trabajadores</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Estado</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No hay líneas de producción configuradas. Añade la primera línea.
                </td>
              </tr>
            ) : (
              lines.map((line) => (
                <tr key={line.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600 font-mono">{line.id}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{line.operationType}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{line.lineNumber}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{line.workersRequired}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        line.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {line.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDelete(line.id, line.operationType, line.lineNumber)}
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
