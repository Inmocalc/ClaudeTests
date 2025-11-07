import React from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import type { DailyResourceUsage } from '../../types/interfaces';

interface ResourceChartProps {
  resourceUsage: DailyResourceUsage[];
}

export const ResourceChart: React.FC<ResourceChartProps> = ({ resourceUsage }) => {
  // Preparar datos para el gráfico
  const chartData = resourceUsage.map((usage, index) => ({
    day: `D${index + 1}`,
    date: new Date(usage.date).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    }),
    available: usage.availableWorkers,
    assigned: usage.assignedWorkers,
    overload: usage.isOverloaded ? usage.assignedWorkers - usage.availableWorkers : 0,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="day"
            label={{ value: 'Días', position: 'insideBottom', offset: -5, style: { fontWeight: 'bold' } }}
            stroke="#6B7280"
          />
          <YAxis
            label={{ value: 'Trabajadores', angle: -90, position: 'insideLeft', style: { fontWeight: 'bold' } }}
            domain={[0, 'auto']}
            stroke="#6B7280"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white border-2 border-metro-blue rounded-lg p-3 shadow-metro">
                    <p className="font-bold text-metro-blue mb-2">{data.day} ({data.date})</p>
                    <p className="text-green-600 text-sm font-semibold">
                      ✓ Disponibles: {data.available} trabajadores
                    </p>
                    <p className="text-blue-600 text-sm font-semibold">
                      → Asignados: {data.assigned} trabajadores
                    </p>
                    {data.overload > 0 && (
                      <p className="text-red-600 font-bold text-sm mt-1">
                        ⚠ Sobrecarga: +{data.overload} trabajadores
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              const labels: { [key: string]: string } = {
                available: 'Trabajadores Disponibles',
                assigned: 'Trabajadores Asignados',
                overload: 'Sobrecarga',
              };
              return <span className="font-semibold">{labels[value] || value}</span>;
            }}
          />

          {/* Línea de trabajadores disponibles */}
          <Line
            type="monotone"
            dataKey="available"
            stroke="#10B981"
            strokeWidth={3}
            name="available"
            dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7 }}
          />

          {/* Línea de trabajadores asignados */}
          <Line
            type="monotone"
            dataKey="assigned"
            stroke="#0066CC"
            strokeWidth={3}
            name="assigned"
            dot={{ r: 5, fill: '#0066CC', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7 }}
          />

          {/* Área de sobrecarga */}
          <Area
            type="monotone"
            dataKey="overload"
            fill="#E30613"
            fillOpacity={0.3}
            stroke="#E30613"
            strokeWidth={2}
            name="overload"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Indicadores de estado */}
      <div className="mt-6 flex gap-4 justify-center">
        {resourceUsage.some((u) => u.isOverloaded) ? (
          <div className="flex items-center gap-2 bg-red-50 text-metro-red px-4 py-2 rounded-lg border-2 border-metro-red">
            <span className="font-bold text-xl">⚠</span>
            <span className="font-semibold">Conflictos de recursos detectados</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border-2 border-green-500">
            <span className="font-bold text-xl">✓</span>
            <span className="font-semibold">Todos los recursos dentro de la capacidad</span>
          </div>
        )}
      </div>
    </div>
  );
};
