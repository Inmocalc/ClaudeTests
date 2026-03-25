import React, { useState, useEffect } from 'react';
import { GanttChart } from './GanttChart';
import { ResourceChart } from './ResourceChart';
import { ConfigurationPanel } from './ConfigurationPanel';
import { OrderList } from './OrderList';
import { SchedulingEngine } from '../../engine/SchedulingEngine';
import type { ProductionOrder, ScheduleResult, ScheduledProcess } from '../../types/interfaces';
import {
  defaultConfiguration,
  sampleOrders,
  trainModels,
  productionLines,
} from '../../data/mockData';

export function Dashboard(): React.ReactElement {
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

  const handleProcessDrag = (process: ScheduledProcess, newStartDate: string) => {
    if (!schedule) return;

    // Crear copia del schedule actual
    let updatedProcesses: ScheduledProcess[] = [...schedule.scheduledProcesses];

    // Primera pasada: actualizar el proceso arrastrado
    updatedProcesses = updatedProcesses.map((p): ScheduledProcess => {
      if (p.orderId === process.orderId && p.processIndex === process.processIndex) {
        const model = trainModels.find((m) => m.id === process.modelType);
        if (!model) return p;

        const processDef = model.processes[process.processIndex];
        const endDate = new Date(newStartDate);
        endDate.setDate(endDate.getDate() + processDef.durationDays);

        return {
          ...p,
          startDate: newStartDate,
          endDate: endDate.toISOString().split('T')[0],
        };
      }
      return p;
    });

    // Segunda pasada: recalcular procesos posteriores
    updatedProcesses = updatedProcesses.map((p): ScheduledProcess => {
      if (p.orderId === process.orderId && p.processIndex > process.processIndex) {
        const model = trainModels.find((m) => m.id === p.modelType);
        if (!model) return p;

        // Encontrar el proceso anterior
        const previousProcess = updatedProcesses.find(
          (prev: ScheduledProcess) =>
            prev.orderId === p.orderId && prev.processIndex === p.processIndex - 1
        );

        if (previousProcess) {
          const processDef = model.processes[p.processIndex];
          const startDateStr: string = previousProcess.endDate;
          const endDate = new Date(startDateStr);
          endDate.setDate(endDate.getDate() + processDef.durationDays);

          return {
            ...p,
            startDate: startDateStr,
            endDate: endDate.toISOString().split('T')[0],
          };
        }
      }
      return p;
    });

    // Actualizar el schedule con los procesos modificados
    setSchedule({
      ...schedule,
      scheduledProcesses: updatedProcesses,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Panel Izquierdo - Configuración y Órdenes */}
          <div className="w-1/4 space-y-6">
            {/* Caja de Configuración */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-[#141B4D]">
              <div className="bg-gradient-to-r from-[#141B4D] to-[#1a2359] text-white px-4 py-3 rounded-t-xl">
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
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-red-500">
              <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-3 rounded-t-xl">
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
              <div className="bg-red-50 border-l-4 border-red-500 rounded-xl shadow-lg p-5">
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
              <div className="bg-green-50 border-l-4 border-green-600 rounded-xl shadow-lg p-5">
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
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-[#141B4D]">
              <div className="bg-gradient-to-r from-[#141B4D] to-[#1a2359] text-white px-6 py-4 rounded-t-xl">
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
                    onProcessDrag={handleProcessDrag}
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
              <div className="bg-white rounded-xl shadow-lg border-l-4 border-red-500">
                <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-4 rounded-t-xl">
                  <h2 className="text-xl font-bold">👥 Uso de Recursos - Personal de Mantenimiento</h2>
                </div>
                <div className="p-6">
                  <ResourceChart resourceUsage={schedule.resourceUsage} />
                </div>
              </div>
            )}

            {/* Detalles del Proceso Seleccionado */}
            {selectedProcess && (
              <div className="bg-white rounded-xl shadow-lg border-l-4 border-green-500">
                <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 rounded-t-xl">
                  <h3 className="text-xl font-bold">🔍 Detalles del Proceso</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-600 block mb-1">ID de Orden</span>
                      <span className="font-bold text-lg text-[#141B4D]">{selectedProcess.orderId}</span>
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
                    className="mt-4 w-full bg-[#141B4D] hover:bg-[#1a2359] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
