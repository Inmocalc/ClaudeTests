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
import type { DailyResourceUsage } from '../types/interfaces';

interface ResourceChartProps {
  resourceUsage: DailyResourceUsage[];
}

export const ResourceChart: React.FC<ResourceChartProps> = ({ resourceUsage }) => {
  // Prepare data for the chart
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
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">Resource Usage - Workers</h2>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            label={{ value: 'Workers', angle: -90, position: 'insideLeft' }}
            domain={[0, 'auto']}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-300 rounded p-2 shadow-lg">
                    <p className="font-semibold">{data.day} ({data.date})</p>
                    <p className="text-green-600">
                      Available: {data.available} workers
                    </p>
                    <p className="text-blue-600">
                      Assigned: {data.assigned} workers
                    </p>
                    {data.overload > 0 && (
                      <p className="text-red-600 font-bold">
                        Overload: +{data.overload} workers
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />

          {/* Available workers line */}
          <Line
            type="monotone"
            dataKey="available"
            stroke="#00AA00"
            strokeWidth={2}
            name="Available Workers"
            dot={{ r: 4 }}
          />

          {/* Assigned workers line */}
          <Line
            type="monotone"
            dataKey="assigned"
            stroke="#0066CC"
            strokeWidth={2}
            name="Assigned Workers"
            dot={{ r: 4 }}
          />

          {/* Overload area */}
          <Area
            type="monotone"
            dataKey="overload"
            fill="#FF0000"
            fillOpacity={0.3}
            stroke="#FF0000"
            strokeWidth={2}
            name="Overload"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Status indicators */}
      <div className="mt-4 flex gap-4 text-sm">
        {resourceUsage.some((u) => u.isOverloaded) && (
          <div className="flex items-center gap-2 text-red-600">
            <span className="font-bold">⚠</span>
            <span>Resource conflicts detected</span>
          </div>
        )}
        {!resourceUsage.some((u) => u.isOverloaded) && (
          <div className="flex items-center gap-2 text-green-600">
            <span className="font-bold">✓</span>
            <span>All resources within capacity</span>
          </div>
        )}
      </div>
    </div>
  );
};
