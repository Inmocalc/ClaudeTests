import React from 'react';
import { parseISO } from 'date-fns';
import type { ProductionOrder, TrainModel } from '../types/interfaces';

interface OrderListProps {
  orders: ProductionOrder[];
  trainModels: TrainModel[];
  completionDates: Map<string, string>;
  onOrderClick?: (order: ProductionOrder) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  trainModels,
  completionDates,
  onOrderClick,
  onDeleteOrder,
}) => {
  const getModelInfo = (modelType: 'A' | 'B' | 'C') => {
    return trainModels.find((m) => m.id === modelType);
  };

  const isLate = (order: ProductionOrder): boolean => {
    const completionDate = completionDates.get(order.id);
    if (!completionDate) return false;

    const dueDate = parseISO(order.dueDate);
    const actualDate = parseISO(completionDate);
    return actualDate > dueDate;
  };

  const getStatusIcon = (order: ProductionOrder): string => {
    if (order.status === 'completed') return '✓';
    if (isLate(order)) return '⚠';
    return '○';
  };

  const getStatusColor = (order: ProductionOrder): string => {
    if (order.status === 'completed') return 'text-green-600';
    if (isLate(order)) return 'text-metro-red';
    return 'text-metro-blue';
  };

  return (
    <div>
      <div className="space-y-3">
        {orders.map((order) => {
          const model = getModelInfo(order.modelType);
          const completionDate = completionDates.get(order.id);

          return (
            <div
              key={order.id}
              className="border-2 border-gray-200 rounded-lg p-3 hover:bg-gray-50 hover:border-metro-blue cursor-pointer transition-all shadow-sm hover:shadow-md"
              onClick={() => onOrderClick && onOrderClick(order)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Encabezado de orden */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-2xl font-bold ${getStatusColor(order)}`}
                    >
                      {getStatusIcon(order)}
                    </span>
                    <span className="font-bold text-lg text-gray-800">{order.id}</span>
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: model?.color }}
                    ></div>
                  </div>

                  {/* Información del modelo */}
                  <div className="text-sm text-gray-700 mb-2 font-semibold">
                    Modelo {order.modelType} - {model?.description}
                  </div>

                  {/* Fechas */}
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-semibold">Entrega:</span>
                      <span className="text-metro-blue font-bold">
                        {new Date(order.dueDate).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    {completionDate && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold">Finalización:</span>
                        <span className={isLate(order) ? 'text-metro-red font-bold' : 'text-green-600 font-bold'}>
                          {new Date(completionDate).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Badge de estado */}
                  <div className="mt-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        isLate(order)
                          ? 'bg-red-100 text-metro-red'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {isLate(order) ? '⚠ Entrega Tardía' : '✓ A Tiempo'}
                    </span>
                  </div>
                </div>

                {/* Botón eliminar */}
                {onDeleteOrder && (
                  <button
                    className="text-gray-400 hover:text-metro-red transition-colors p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteOrder(order.id);
                    }}
                    title="Eliminar orden"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {orders.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <div className="text-6xl mb-4">📋</div>
          <p className="font-semibold">No hay órdenes todavía</p>
          <p className="text-sm mt-2">Añade una orden para comenzar la programación.</p>
        </div>
      )}
    </div>
  );
};
