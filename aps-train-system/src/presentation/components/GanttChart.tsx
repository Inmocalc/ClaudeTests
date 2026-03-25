import React from 'react';
import { parseISO, addDays, differenceInDays, formatISO } from 'date-fns';
import type { ScheduledProcess, ProductionLine } from '../../types/interfaces';

interface GanttChartProps {
  scheduledProcesses: ScheduledProcess[];
  productionLines: ProductionLine[];
  startDate: string;
  horizonDays: number;
  onProcessClick?: (process: ScheduledProcess) => void;
  onProcessDrag?: (process: ScheduledProcess, newStartDate: string) => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  scheduledProcesses,
  productionLines,
  startDate,
  horizonDays,
  onProcessClick,
  onProcessDrag,
}) => {
  const dayWidth = 80; // píxeles por día
  const rowHeight = 60; // píxeles por fila
  const chartWidth = dayWidth * horizonDays;
  const startDateObj = parseISO(startDate);
  const [draggedProcess, setDraggedProcess] = React.useState<ScheduledProcess | null>(null);
  const [dragOverDay, setDragOverDay] = React.useState<number | null>(null);

  // Handlers para drag & drop
  const handleDragStart = (e: React.DragEvent, process: ScheduledProcess) => {
    setDraggedProcess(process);
    e.dataTransfer.effectAllowed = 'move';
    // Hacer el elemento semitransparente mientras se arrastra
    (e.target as HTMLElement).style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
    setDraggedProcess(null);
    setDragOverDay(null);
  };

  const handleDragOver = (e: React.DragEvent, dayIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDay(dayIndex);
  };

  const handleDrop = (e: React.DragEvent, dayIndex: number) => {
    e.preventDefault();

    if (!draggedProcess || !onProcessDrag) return;

    // Calcular la nueva fecha de inicio
    const newStartDate = formatISO(addDays(startDateObj, dayIndex), { representation: 'date' });

    // Validar que no sea antes del proceso anterior (si existe)
    if (draggedProcess.processIndex > 0) {
      const previousProcess = scheduledProcesses.find(
        (p) => p.orderId === draggedProcess.orderId && p.processIndex === draggedProcess.processIndex - 1
      );

      if (previousProcess) {
        const previousEndDate = parseISO(previousProcess.endDate);
        const newStartDateObj = parseISO(newStartDate);

        if (newStartDateObj < previousEndDate) {
          alert('No se puede mover el proceso antes de que termine el proceso anterior');
          setDraggedProcess(null);
          setDragOverDay(null);
          return;
        }
      }
    }

    onProcessDrag(draggedProcess, newStartDate);
    setDraggedProcess(null);
    setDragOverDay(null);
  };

  // Generar encabezados de fecha
  const dateHeaders = Array.from({ length: horizonDays }, (_, i) => {
    const date = addDays(startDateObj, i);
    return {
      date: formatISO(date, { representation: 'date' }),
      day: i + 1,
      dayOfWeek: date.toLocaleDateString('es-ES', { weekday: 'short' }),
    };
  });

  // Calcular posición y ancho para un bloque de proceso
  const getBlockPosition = (process: ScheduledProcess) => {
    const processStart = parseISO(process.startDate);
    const processEnd = parseISO(process.endDate);

    const startOffset = differenceInDays(processStart, startDateObj);
    const duration = differenceInDays(processEnd, processStart);

    return {
      left: startOffset * dayWidth,
      width: duration * dayWidth - 4, // -4 para padding
    };
  };

  // Agrupar procesos por línea de producción
  const processesByLine = productionLines.map((line) => ({
    line,
    processes: scheduledProcesses.filter((p) => p.productionLineId === line.id),
  }));

  return (
    <div className="overflow-x-auto">
      {/* Nota informativa de drag & drop */}
      {onProcessDrag && (
        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-metro-blue rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-2xl">⇄</span>
            <div>
              <p className="font-semibold text-metro-blue">Reorganización Manual Activada</p>
              <p className="text-xs text-gray-600">
                Arrastra los bloques de procesos horizontalmente para cambiar sus fechas de inicio.
                Los procesos posteriores se ajustarán automáticamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Encabezado de línea temporal */}
      <div className="flex mb-2" style={{ marginLeft: '220px' }}>
        {dateHeaders.map((header, i) => (
          <div
            key={i}
            className="border-r border-metro-blue/20 text-center bg-blue-50"
            style={{ width: `${dayWidth}px` }}
          >
            <div className="text-xs font-bold text-metro-blue">
              Día {header.day}
            </div>
            <div className="text-xs text-gray-600 font-semibold">{header.dayOfWeek}</div>
            <div className="text-[10px] text-gray-500">
              {new Date(header.date).toLocaleDateString('es-ES', {
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Líneas de producción y procesos */}
      {processesByLine.map(({ line, processes }) => (
        <div key={line.id} className="flex mb-2 relative">
          {/* Etiqueta de línea */}
          <div
            className="flex items-center px-4 py-2 bg-gradient-to-r from-metro-blue to-metro-blue-light text-white border border-metro-blue rounded-l-lg shadow-sm"
            style={{ width: '220px', height: `${rowHeight}px` }}
          >
            <div className="w-full">
              <div className="font-bold text-sm">{line.processType}</div>
              <div className="text-xs opacity-90">
                Línea {line.lineNumber}
              </div>
              <div className="text-[10px] opacity-75">
                {line.workersRequired} trabajador{line.workersRequired > 1 ? 'es' : ''}
              </div>
            </div>
          </div>

          {/* Cuadrícula de línea temporal */}
          <div
            className="relative border border-gray-300 rounded-r-lg bg-white"
            style={{ width: `${chartWidth}px`, height: `${rowHeight}px` }}
          >
            {/* Líneas de cuadrícula con drop zones */}
            {Array.from({ length: horizonDays }).map((_, i) => (
              <div
                key={i}
                className={`absolute border-r border-gray-200 transition-colors ${
                  dragOverDay === i ? 'bg-blue-100' : ''
                }`}
                style={{
                  left: `${i * dayWidth}px`,
                  width: `${dayWidth}px`,
                  height: '100%',
                  backgroundColor: dragOverDay === i
                    ? 'rgba(0, 102, 204, 0.1)'
                    : i % 2 === 0
                    ? '#FAFAFA'
                    : '#FFFFFF',
                }}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={(e) => handleDrop(e, i)}
              />
            ))}

            {/* Bloques de proceso */}
            {processes.map((process, i) => {
              const { left, width } = getBlockPosition(process);
              const isDragging = draggedProcess?.orderId === process.orderId &&
                                 draggedProcess?.processIndex === process.processIndex;
              return (
                <div
                  key={`${process.orderId}-${process.processIndex}-${i}`}
                  draggable={!!onProcessDrag}
                  onDragStart={(e) => handleDragStart(e, process)}
                  onDragEnd={handleDragEnd}
                  className={`absolute cursor-move hover:scale-105 transition-all rounded-lg px-2 py-1 text-white text-xs font-bold shadow-lg border-2 ${
                    isDragging ? 'border-yellow-400 ring-2 ring-yellow-300' : 'border-white'
                  }`}
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
                  title={`${process.orderId} - ${process.processName} (Arrastra para mover)`}
                >
                  <div className="font-bold text-base">{process.orderId}</div>
                  <div className="text-[10px] opacity-90">
                    {process.processName}
                  </div>
                  <div className="text-[9px] opacity-80 bg-black/20 px-1 rounded">
                    {differenceInDays(parseISO(process.endDate), parseISO(process.startDate))} día{differenceInDays(parseISO(process.endDate), parseISO(process.startDate)) > 1 ? 's' : ''}
                  </div>
                  {onProcessDrag && (
                    <div className="text-[8px] opacity-60 mt-0.5">
                      ⇄ Arrastra
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Leyenda */}
      <div className="mt-6 flex gap-6 text-sm justify-center bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-white shadow-md" style={{ backgroundColor: '#0066CC' }}></div>
          <span className="font-semibold">Modelo A</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-white shadow-md" style={{ backgroundColor: '#E30613' }}></div>
          <span className="font-semibold">Modelo B</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-white shadow-md" style={{ backgroundColor: '#2ECC71' }}></div>
          <span className="font-semibold">Modelo C</span>
        </div>
      </div>
    </div>
  );
};
