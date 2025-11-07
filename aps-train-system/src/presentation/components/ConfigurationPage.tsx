import React, { useState } from 'react';
import { OperationsManager } from './OperationsManager';
import { LinesManager } from './LinesManager';
import { ProcessConfigEditor } from './ProcessConfigEditor';

type TabType = 'operations' | 'lines' | 'processes';

export function ConfigurationPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>('operations');

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#141B4D] mb-2">
            Configuración del Sistema APS
          </h1>
          <p className="text-gray-600">
            Gestiona operaciones, líneas de producción y procesos por modelo
          </p>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('operations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'operations'
                    ? 'border-[#141B4D] text-[#141B4D]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">⚙️</span>
                  Operaciones
                </span>
              </button>

              <button
                onClick={() => setActiveTab('lines')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'lines'
                    ? 'border-[#141B4D] text-[#141B4D]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">🏭</span>
                  Líneas de Producción
                </span>
              </button>

              <button
                onClick={() => setActiveTab('processes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'processes'
                    ? 'border-[#141B4D] text-[#141B4D]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">🔄</span>
                  Procesos por Modelo
                </span>
              </button>
            </nav>
          </div>
        </div>

        <div className="mt-6">
          {activeTab === 'operations' && <OperationsManager />}
          {activeTab === 'lines' && <LinesManager />}
          {activeTab === 'processes' && <ProcessConfigEditor />}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Orden de Configuración Recomendado</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Primero crea las <strong>Operaciones</strong> (Montaje, Pruebas, Inspección, etc.)</li>
            <li>Luego crea las <strong>Líneas de Producción</strong> asignándolas a las operaciones</li>
            <li>Finalmente configura la <strong>Secuencia de Procesos</strong> para cada modelo de tren (A, B, C)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
