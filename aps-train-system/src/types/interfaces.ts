// Core data model interfaces for APS Train Manufacturing System

export interface ProcessDefinition {
  name: string;
  durationDays: number;
}

export interface TrainModel {
  id: 'A' | 'B' | 'C';
  color: string;
  description: string;
  processes: ProcessDefinition[];
  totalDurationDays: number;
}

export interface ProductionLine {
  id: string;
  processType: 'Preparación' | 'Torneado' | 'Pintado';
  lineNumber: number;
  workersRequired: number;
}

export interface WorkerAvailability {
  date: string; // ISO date format
  availableWorkers: number;
}

export interface ProductionOrder {
  id: string;
  modelType: 'A' | 'B' | 'C';
  dueDate: string; // ISO date format
  priority: number;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface ScheduledProcess {
  orderId: string;
  modelType: 'A' | 'B' | 'C';
  processName: string;
  processIndex: number;
  productionLineId: string;
  startDate: string; // ISO date format
  endDate: string; // ISO date format
  workersAssigned: number;
  color: string;
}

export interface ScheduleValidation {
  isValid: boolean;
  conflicts: Conflict[];
  warnings: Warning[];
}

export interface Conflict {
  type: 'late_delivery' | 'resource_overload' | 'worker_shortage' | 'sequential_violation';
  orderId?: string;
  date?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface Warning {
  type: 'tight_schedule' | 'worker_utilization';
  message: string;
  date?: string;
}

export interface DailyResourceUsage {
  date: string;
  availableWorkers: number;
  assignedWorkers: number;
  isOverloaded: boolean;
}

export interface ScheduleResult {
  scheduledProcesses: ScheduledProcess[];
  validation: ScheduleValidation;
  resourceUsage: DailyResourceUsage[];
  completionDates: Map<string, string>; // orderId -> completion date
}

export interface SystemConfiguration {
  startDate: string; // ISO date format
  horizonDays: number;
  trainModels: TrainModel[];
  productionLines: ProductionLine[];
  workerAvailability: WorkerAvailability[];
}

export interface SchedulingState {
  configuration: SystemConfiguration;
  orders: ProductionOrder[];
  schedule: ScheduleResult | null;
  selectedOrder: string | null;
}
