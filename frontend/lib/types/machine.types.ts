import { BaseEntity, MachineStatus, BaseFilters } from './api.types';

export interface Machine extends BaseEntity {
  code: string;
  name: string;
  type: string;
  axes: number | null;
  brand: string | null;
  model: string | null;
  location: string | null;
  status: MachineStatus;
  notes: string | null;
  utilization?: {
    utilization: number;
    activeHours: number;
    totalHours: number;
    startOfWeek: string;
    endOfWeek: string;
  };
}

export interface CreateMachineDto {
  code: string;
  name: string;
  type: string;
  axes?: number;
  brand?: string;
  model?: string;
  location?: string;
  status?: MachineStatus;
  notes?: string;
}

export interface UpdateMachineDto extends Partial<CreateMachineDto> {}

export interface MachineFilters extends BaseFilters {
  status?: MachineStatus;
  type?: string;
  location?: string;
}

export interface MachineUtilization {
  machineId: number;
  machineName: string;
  utilization: number;
  uptime: number;
  downtime: number;
}