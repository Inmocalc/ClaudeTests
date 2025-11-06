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

  // Run scheduling whenever orders change
  useEffect(() => {
    const engine = new SchedulingEngine(defaultConfiguration);
    const result = engine.scheduleOrders(orders);
    setSchedule(result);
  }, [orders]);

  const handleAddOrder = (orderData: Omit<ProductionOrder, 'priority' | 'status' | 'createdAt'>) => {
    // Check if order ID already exists
    if (orders.some((o) => o.id === orderData.id)) {
      alert('Order ID already exists. Please use a unique ID.');
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
    if (confirm(`Are you sure you want to delete order ${orderId}?`)) {
      setOrders(orders.filter((o) => o.id !== orderId));
    }
  };

  const handleProcessClick = (process: ScheduledProcess) => {
    setSelectedProcess(process);
  };

  const handleOrderClick = (order: ProductionOrder) => {
    console.log('Order clicked:', order);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white py-4 px-6 shadow-lg">
        <h1 className="text-2xl font-bold">Sistema APS - Fabricación de Trenes</h1>
        <p className="text-sm text-blue-200 mt-1">
          Advanced Planning & Scheduling System
        </p>
      </header>

      {/* Main Content */}
      <div className="flex gap-4 p-4">
        {/* Left Panel - Configuration & Orders */}
        <div className="w-1/4 space-y-4">
          <ConfigurationPanel
            trainModels={trainModels}
            startDate={defaultConfiguration.startDate}
            onAddOrder={handleAddOrder}
          />

          <OrderList
            orders={orders}
            trainModels={trainModels}
            completionDates={schedule?.completionDates || new Map()}
            onOrderClick={handleOrderClick}
            onDeleteOrder={handleDeleteOrder}
          />
        </div>

        {/* Right Panel - Gantt & Resource Charts */}
        <div className="w-3/4 space-y-4">
          {/* Conflicts Alert */}
          {schedule && schedule.validation.conflicts.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg shadow-md">
              <h3 className="font-bold text-red-800 mb-2">⚠ Conflicts Detected</h3>
              <ul className="space-y-1">
                {schedule.validation.conflicts.map((conflict, i) => (
                  <li key={i} className="text-sm text-red-700">
                    • {conflict.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Alert */}
          {schedule && schedule.validation.conflicts.length === 0 && orders.length > 0 && (
            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg shadow-md">
              <h3 className="font-bold text-green-800">✓ Schedule Valid</h3>
              <p className="text-sm text-green-700 mt-1">
                All orders can be completed on time with available resources.
              </p>
            </div>
          )}

          {/* Gantt Chart */}
          {schedule && schedule.scheduledProcesses.length > 0 ? (
            <GanttChart
              scheduledProcesses={schedule.scheduledProcesses}
              productionLines={productionLines}
              startDate={defaultConfiguration.startDate}
              horizonDays={defaultConfiguration.horizonDays}
              onProcessClick={handleProcessClick}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              <p className="text-lg">No orders scheduled yet.</p>
              <p className="text-sm mt-2">Add production orders to see the Gantt chart.</p>
            </div>
          )}

          {/* Resource Chart */}
          {schedule && schedule.resourceUsage.length > 0 && (
            <ResourceChart resourceUsage={schedule.resourceUsage} />
          )}

          {/* Selected Process Details */}
          {selectedProcess && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold text-lg mb-3">Process Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-semibold">Order ID:</span> {selectedProcess.orderId}
                </div>
                <div>
                  <span className="font-semibold">Model:</span> {selectedProcess.modelType}
                </div>
                <div>
                  <span className="font-semibold">Process:</span> {selectedProcess.processName}
                </div>
                <div>
                  <span className="font-semibold">Production Line:</span>{' '}
                  {selectedProcess.productionLineId}
                </div>
                <div>
                  <span className="font-semibold">Start Date:</span>{' '}
                  {new Date(selectedProcess.startDate).toLocaleDateString('es-ES')}
                </div>
                <div>
                  <span className="font-semibold">End Date:</span>{' '}
                  {new Date(selectedProcess.endDate).toLocaleDateString('es-ES')}
                </div>
                <div>
                  <span className="font-semibold">Workers:</span> {selectedProcess.workersAssigned}
                </div>
              </div>
              <button
                onClick={() => setSelectedProcess(null)}
                className="mt-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-3 mt-8">
        <p className="text-sm">
          APS Train Manufacturing System v1.0 | Forward Scheduling with EDD Priority
        </p>
      </footer>
    </div>
  );
}

export default App;
