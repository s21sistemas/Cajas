import { BaseEntity, BaseFilters, DateRangeFilter } from './api.types';

// Maintenance Order types
export type MaintenanceOrderStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
export type MaintenanceOrderType = 'preventive' | 'corrective' | 'emergency';
export type MaintenanceOrderPriority = 'low' | 'medium' | 'high' | 'critical';

export interface MaintenanceOrder extends BaseEntity {
  code: string;
  machineId: number;
  machineName: string;
  type: MaintenanceOrderType;
  priority: MaintenanceOrderPriority;
  status: MaintenanceOrderStatus;
  description: string;
  scheduledDate: string | null;
  startDate: string | null;
  endDate: string | null;
  technician: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  estimatedCost: number | null;
  actualCost: number | null;
  notes: string | null;
}

export interface CreateMaintenanceOrderDto {
  code?: string; // Optional - backend generates if not provided
  machineId: number;
  type: MaintenanceOrderType;
  priority?: MaintenanceOrderPriority;
  description: string;
  scheduledDate?: string;
  technician?: string;
  estimatedHours?: number;
  estimatedCost?: number;
}

export interface UpdateMaintenanceOrderDto extends Partial<CreateMaintenanceOrderDto> {
  status?: MaintenanceOrderStatus;
  startDate?: string;
  endDate?: string;
  actualHours?: number;
  actualCost?: number;
}

export interface MaintenanceOrderFilters extends BaseFilters, DateRangeFilter {
  status?: MaintenanceOrderStatus;
  type?: MaintenanceOrderType;
  priority?: MaintenanceOrderPriority;
  machineId?: number;
}
