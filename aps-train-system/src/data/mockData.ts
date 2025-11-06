import type { TrainModel, ProductionLine, WorkerAvailability, ProductionOrder, SystemConfiguration } from '../types/interfaces';

// Train models as per specification
export const trainModels: TrainModel[] = [
  {
    id: 'A',
    color: '#4A90E2',
    description: 'Tren Modelo A - Alta Velocidad',
    processes: [
      { name: 'Preparación', durationDays: 1 },
      { name: 'Torneado', durationDays: 2 },
      { name: 'Pintado', durationDays: 2 },
    ],
    totalDurationDays: 5,
  },
  {
    id: 'B',
    color: '#E74C3C',
    description: 'Tren Modelo B - Regional',
    processes: [
      { name: 'Preparación', durationDays: 2 },
      { name: 'Torneado', durationDays: 2 },
      { name: 'Pintado', durationDays: 1 },
    ],
    totalDurationDays: 5,
  },
  {
    id: 'C',
    color: '#2ECC71',
    description: 'Tren Modelo C - Carga',
    processes: [
      { name: 'Preparación', durationDays: 1 },
      { name: 'Torneado', durationDays: 1 },
      { name: 'Pintado', durationDays: 3 },
    ],
    totalDurationDays: 5,
  },
];

// Production lines configuration
export const productionLines: ProductionLine[] = [
  {
    id: 'PREP-L1',
    processType: 'Preparación',
    lineNumber: 1,
    workersRequired: 2,
  },
  {
    id: 'PREP-L2',
    processType: 'Preparación',
    lineNumber: 2,
    workersRequired: 2,
  },
  {
    id: 'TORN-L1',
    processType: 'Torneado',
    lineNumber: 1,
    workersRequired: 1,
  },
  {
    id: 'PINT-L1',
    processType: 'Pintado',
    lineNumber: 1,
    workersRequired: 1,
  },
];

// Worker availability for demo scenario (10 days, starting 2026-01-10)
// 75% of days have 5 workers available (7 out of 10 days)
export const workerAvailability: WorkerAvailability[] = [
  { date: '2026-01-10', availableWorkers: 5 },
  { date: '2026-01-11', availableWorkers: 5 },
  { date: '2026-01-12', availableWorkers: 4 },
  { date: '2026-01-13', availableWorkers: 5 },
  { date: '2026-01-14', availableWorkers: 5 },
  { date: '2026-01-15', availableWorkers: 3 },
  { date: '2026-01-16', availableWorkers: 5 },
  { date: '2026-01-17', availableWorkers: 5 },
  { date: '2026-01-18', availableWorkers: 5 },
  { date: '2026-01-19', availableWorkers: 4 },
];

// Sample production orders from specification
export const sampleOrders: ProductionOrder[] = [
  {
    id: 'B1',
    modelType: 'B',
    dueDate: '2026-01-15',
    priority: 1,
    status: 'pending',
    createdAt: '2026-01-10',
  },
  {
    id: 'A1',
    modelType: 'A',
    dueDate: '2026-01-16',
    priority: 2,
    status: 'pending',
    createdAt: '2026-01-10',
  },
  {
    id: 'C1',
    modelType: 'C',
    dueDate: '2026-01-17',
    priority: 3,
    status: 'pending',
    createdAt: '2026-01-10',
  },
  {
    id: 'A2',
    modelType: 'A',
    dueDate: '2026-01-18',
    priority: 4,
    status: 'pending',
    createdAt: '2026-01-10',
  },
  {
    id: 'B2',
    modelType: 'B',
    dueDate: '2026-01-19',
    priority: 5,
    status: 'pending',
    createdAt: '2026-01-10',
  },
];

// System configuration
export const defaultConfiguration: SystemConfiguration = {
  startDate: '2026-01-10',
  horizonDays: 10,
  trainModels,
  productionLines,
  workerAvailability,
};
