import React from 'react';
import { parseISO, addDays, differenceInDays, formatISO } from 'date-fns';
import type { ScheduledProcess, ProductionLine } from '../types/interfaces';

interface GanttChartProps {
  scheduledProcesses: ScheduledProcess[];
  productionLines: ProductionLine[];
  startDate: string;
  horizonDays: number;
  onProcessClick?: (process: ScheduledProcess) => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  scheduledProcesses,
  productionLines,
  startDate,
  horizonDays,
  onProcessClick,
}) => {
  const dayWidth = 80; // pixels per day
  const rowHeight = 60; // pixels per row
  const chartWidth = dayWidth * horizonDays;
  const startDateObj = parseISO(startDate);

  // Generate date headers
  const dateHeaders = Array.from({ length: horizonDays }, (_, i) => {
    const date = addDays(startDateObj, i);
    return {
      date: formatISO(date, { representation: 'date' }),
      day: i + 1,
      dayOfWeek: date.toLocaleDateString('es-ES', { weekday: 'short' }),
    };
  });

  // Calculate position and width for a process block
  const getBlockPosition = (process: ScheduledProcess) => {
    const processStart = parseISO(process.startDate);
    const processEnd = parseISO(process.endDate);

    const startOffset = differenceInDays(processStart, startDateObj);
    const duration = differenceInDays(processEnd, processStart);

    return {
      left: startOffset * dayWidth,
      width: duration * dayWidth - 4, // -4 for padding
    };
  };

  // Group processes by production line
  const processesByLine = productionLines.map((line) => ({
    line,
    processes: scheduledProcesses.filter((p) => p.productionLineId === line.id),
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">Gantt Chart - Production Schedule</h2>

      <div className="overflow-x-auto">
        {/* Timeline header */}
        <div className="flex mb-2" style={{ marginLeft: '200px' }}>
          {dateHeaders.map((header, i) => (
            <div
              key={i}
              className="border-r border-gray-300 text-center"
              style={{ width: `${dayWidth}px` }}
            >
              <div className="text-xs font-semibold text-gray-700">
                Day {header.day}
              </div>
              <div className="text-xs text-gray-500">{header.dayOfWeek}</div>
              <div className="text-xs text-gray-400">
                {new Date(header.date).toLocaleDateString('es-ES', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Production lines and processes */}
        {processesByLine.map(({ line, processes }) => (
          <div key={line.id} className="flex mb-1 relative">
            {/* Line label */}
            <div
              className="flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-l"
              style={{ width: '200px', height: `${rowHeight}px` }}
            >
              <div>
                <div className="font-semibold text-sm">{line.processType}</div>
                <div className="text-xs text-gray-600">
                  Línea {line.lineNumber} ({line.workersRequired} workers)
                </div>
              </div>
            </div>

            {/* Timeline grid */}
            <div
              className="relative border border-gray-300 rounded-r"
              style={{ width: `${chartWidth}px`, height: `${rowHeight}px` }}
            >
              {/* Grid lines */}
              {Array.from({ length: horizonDays }).map((_, i) => (
                <div
                  key={i}
                  className="absolute border-r border-gray-200"
                  style={{
                    left: `${i * dayWidth}px`,
                    height: '100%',
                  }}
                />
              ))}

              {/* Process blocks */}
              {processes.map((process, i) => {
                const { left, width } = getBlockPosition(process);
                return (
                  <div
                    key={`${process.orderId}-${process.processIndex}-${i}`}
                    className="absolute cursor-pointer hover:opacity-90 transition-opacity rounded px-2 py-1 text-white text-xs font-semibold shadow-md"
                    style={{
                      left: `${left + 2}px`,
                      top: '8px',
                      width: `${width}px`,
                      height: `${rowHeight - 16}px`,
                      backgroundColor: process.color,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onClick={() => onProcessClick && onProcessClick(process)}
                    title={`${process.orderId} - ${process.processName}`}
                  >
                    <div className="font-bold">{process.orderId}</div>
                    <div className="text-[10px] opacity-90">
                      {process.processName}
                    </div>
                    <div className="text-[10px] opacity-75">
                      {differenceInDays(parseISO(process.endDate), parseISO(process.startDate))}d
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4A90E2' }}></div>
          <span>Model A</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#E74C3C' }}></div>
          <span>Model B</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2ECC71' }}></div>
          <span>Model C</span>
        </div>
      </div>
    </div>
  );
};
