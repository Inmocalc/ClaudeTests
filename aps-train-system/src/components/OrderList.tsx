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
    if (isLate(order)) return 'text-red-600';
    return 'text-blue-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-bold mb-4">Production Orders</h2>

      <div className="space-y-2">
        {orders.map((order) => {
          const model = getModelInfo(order.modelType);
          const completionDate = completionDates.get(order.id);

          return (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onOrderClick && onOrderClick(order)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Order header */}
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xl font-bold ${getStatusColor(order)}`}
                    >
                      {getStatusIcon(order)}
                    </span>
                    <span className="font-bold text-lg">{order.id}</span>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: model?.color }}
                    ></div>
                  </div>

                  {/* Model info */}
                  <div className="text-sm text-gray-600 mb-1">
                    Model {order.modelType} - {model?.description}
                  </div>

                  {/* Dates */}
                  <div className="text-xs text-gray-500">
                    <div>
                      Due: {new Date(order.dueDate).toLocaleDateString('es-ES')}
                    </div>
                    {completionDate && (
                      <div className={isLate(order) ? 'text-red-600 font-semibold' : ''}>
                        Est. completion: {new Date(completionDate).toLocaleDateString('es-ES')}
                      </div>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        isLate(order)
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {isLate(order) ? 'Late Delivery' : 'On Time'}
                    </span>
                  </div>
                </div>

                {/* Delete button */}
                {onDeleteOrder && (
                  <button
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteOrder(order.id);
                    }}
                    title="Delete order"
                  >
                    <svg
                      className="w-5 h-5"
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
        <div className="text-center text-gray-500 py-8">
          No orders yet. Add an order to start scheduling.
        </div>
      )}
    </div>
  );
};
