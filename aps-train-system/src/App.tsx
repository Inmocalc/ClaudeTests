import { useState, useEffect } from 'react';
import { GanttChart } from './components/GanttChart';
import { ResourceChart } from './components/ResourceChart';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { OrderList } from './components/OrderList';
import { SchedulingEngine } from './engine/SchedulingEngine';
import type { ProductionOrder, ScheduleResult, ScheduledProcess } from './types/interfaces';
import {
  defaultConfiguration,
  sampleOrders,
  trainModels,
  productionLines,
} from './data/mockData';

function App() {
  const [orders, setOrders] = useState<ProductionOrder[]>(sampleOrders);
  const [schedule, setSchedule] = useState<ScheduleResult | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<ScheduledProcess | null>(null);

  // Ejecutar programación cuando cambien las órdenes
  useEffect(() => {
    const engine = new SchedulingEngine(defaultConfiguration);
    const result = engine.scheduleOrders(orders);
    setSchedule(result);
  }, [orders]);

  const handleAddOrder = (orderData: Omit<ProductionOrder, 'priority' | 'status' | 'createdAt'>) => {
    // Verificar si el ID de orden ya existe
    if (orders.some((o) => o.id === orderData.id)) {
      alert('El ID de orden ya existe. Por favor, usa un ID único.');
      return;
    }

    const newOrder: ProductionOrder = {
      ...orderData,
      priority: orders.length + 1,
      status: 'pending',
      createdAt: defaultConfiguration.startDate,
    };

    setOrders([...orders, newOrder]);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la orden ${orderId}?`)) {
      setOrders(orders.filter((o) => o.id !== orderId));
    }
  };

  const handleProcessClick = (process: ScheduledProcess) => {
    setSelectedProcess(process);
  };

  const handleOrderClick = (order: ProductionOrder) => {
    console.log('Orden seleccionada:', order);
  };

  return (
    <div className="min-h-screen bg-metro-gray-light">
      {/* Cabecera */}
      <header className="bg-gradient-to-r from-metro-blue to-metro-blue-light text-white py-6 px-8 shadow-metro-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Espacio para logo Metro de Madrid */}
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
              <div className="text-metro-blue font-bold text-2xl">M</div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Metro de Madrid</h1>
              <p className="text-sm text-blue-100 mt-1">
                Sistema Avanzado de Planificación
              </p>
              <p className="text-xs text-blue-200">
                Área de Mantenimiento de Material Móvil
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">Sistema APS v1.0</div>
            <div className="text-xs text-blue-200">Planificación Avanzada</div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Panel Izquierdo - Configuración y Órdenes */}
          <div className="w-1/4 space-y-6">
            {/* Caja de Configuración */}
            <div className="bg-white rounded-xl shadow-metro border-l-4 border-metro-blue">
              <div className="bg-gradient-to-r from-metro-blue to-metro-blue-light text-white px-4 py-3 rounded-t-xl">
                <h2 className="text-lg font-bold">⚙️ Configuración</h2>
              </div>
              <div className="p-4">
                <ConfigurationPanel
                  trainModels={trainModels}
                  startDate={defaultConfiguration.startDate}
                  onAddOrder={handleAddOrder}
                />
              </div>
            </div>

            {/* Caja de Órdenes */}
            <div className="bg-white rounded-xl shadow-metro border-l-4 border-metro-red">
              <div className="bg-gradient-to-r from-metro-red to-red-600 text-white px-4 py-3 rounded-t-xl">
                <h2 className="text-lg font-bold">📋 Órdenes de Trabajo</h2>
              </div>
              <div className="p-4">
                <OrderList
                  orders={orders}
                  trainModels={trainModels}
                  completionDates={schedule?.completionDates || new Map()}
                  onOrderClick={handleOrderClick}
                  onDeleteOrder={handleDeleteOrder}
                />
              </div>
            </div>
          </div>

          {/* Panel Derecho - Gráficos y Visualización */}
          <div className="w-3/4 space-y-6">
            {/* Alertas de Conflictos */}
            {schedule && schedule.validation.conflicts.length > 0 && (
              <div className="bg-red-50 border-l-4 border-metro-red rounded-xl shadow-metro p-5">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="font-bold text-red-800 text-lg mb-2">
                      Conflictos Detectados
                    </h3>
                    <ul className="space-y-1">
                      {schedule.validation.conflicts.map((conflict, i) => (
                        <li key={i} className="text-sm text-red-700 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{conflict.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Alerta de Éxito */}
            {schedule && schedule.validation.conflicts.length === 0 && orders.length > 0 && (
              <div className="bg-green-50 border-l-4 border-green-600 rounded-xl shadow-metro p-5">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">✓</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-bold text-green-800 text-lg">
                      Programación Válida
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      Todas las órdenes pueden completarse a tiempo con los recursos disponibles.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Diagrama de Gantt */}
            <div className="bg-white rounded-xl shadow-metro-lg border-l-4 border-metro-blue">
              <div className="bg-gradient-to-r from-metro-blue to-metro-blue-light text-white px-6 py-4 rounded-t-xl">
                <h2 className="text-xl font-bold">📊 Diagrama de Gantt - Programación de Mantenimiento</h2>
              </div>
              <div className="p-6">
                {schedule && schedule.scheduledProcesses.length > 0 ? (
                  <GanttChart
                    scheduledProcesses={schedule.scheduledProcesses}
                    productionLines={productionLines}
                    startDate={defaultConfiguration.startDate}
                    horizonDays={defaultConfiguration.horizonDays}
                    onProcessClick={handleProcessClick}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <p className="text-lg font-semibold">No hay órdenes programadas</p>
                    <p className="text-sm mt-2">Añade órdenes de trabajo para ver el diagrama de Gantt.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Gráfico de Recursos */}
            {schedule && schedule.resourceUsage.length > 0 && (
              <div className="bg-white rounded-xl shadow-metro-lg border-l-4 border-metro-red">
                <div className="bg-gradient-to-r from-metro-red to-red-600 text-white px-6 py-4 rounded-t-xl">
                  <h2 className="text-xl font-bold">👥 Uso de Recursos - Personal de Mantenimiento</h2>
                </div>
                <div className="p-6">
                  <ResourceChart resourceUsage={schedule.resourceUsage} />
                </div>
              </div>
            )}

            {/* Detalles del Proceso Seleccionado */}
            {selectedProcess && (
              <div className="bg-white rounded-xl shadow-metro-lg border-l-4 border-green-500">
                <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 rounded-t-xl">
                  <h3 className="text-xl font-bold">🔍 Detalles del Proceso</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-600 block mb-1">ID de Orden</span>
                      <span className="font-bold text-lg text-metro-blue">{selectedProcess.orderId}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-600 block mb-1">Modelo</span>
                      <span className="font-bold text-lg">{selectedProcess.modelType}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-600 block mb-1">Proceso</span>
                      <span className="font-bold text-lg">{selectedProcess.processName}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-600 block mb-1">Línea de Producción</span>
                      <span className="font-bold text-lg">{selectedProcess.productionLineId}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-600 block mb-1">Fecha de Inicio</span>
                      <span className="font-bold">{new Date(selectedProcess.startDate).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-600 block mb-1">Fecha de Fin</span>
                      <span className="font-bold">{new Date(selectedProcess.endDate).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                      <span className="text-xs text-gray-600 block mb-1">Trabajadores Asignados</span>
                      <span className="font-bold text-lg">{selectedProcess.workersAssigned} personas</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProcess(null)}
                    className="mt-4 w-full bg-metro-blue hover:bg-metro-blue-light text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pie de Página */}
      <footer className="bg-gradient-to-r from-metro-blue to-metro-blue-light text-white text-center py-4 mt-8">
        <div className="container mx-auto">
          <p className="text-sm font-semibold">
            Metro de Madrid - Sistema APS de Mantenimiento v1.0
          </p>
          <p className="text-xs text-blue-200 mt-1">
            Planificación Avanzada con Prioridad EDD | Área de Mantenimiento de Material Móvil
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
