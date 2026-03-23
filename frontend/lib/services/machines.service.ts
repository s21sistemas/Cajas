import { api } from '../api';
import type {
  Machine,
  CreateMachineDto,
  UpdateMachineDto,
  MachineFilters,
  MachineUtilization,
  PaginatedResponse
} from '../types';

export const machinesService = {
  // Get all machines with pagination and filters
  getAll: (filters?: MachineFilters): Promise<PaginatedResponse<Machine>> => {
    return api.get<PaginatedResponse<Machine>>('/machines', filters);
  },

  // Get machine by ID
  getById: (id: number): Promise<Machine> => {
    return api.get<Machine>(`/machines/${id}`);
  },

  // Create new machine
  create: (data: CreateMachineDto): Promise<Machine> => {
    return api.post<Machine>('/machines', data);
  },

  // Update existing machine
  update: (id: number, data: UpdateMachineDto): Promise<Machine> => {
    return api.put<Machine>(`/machines/${id}`, data);
  },

  // Delete machine
  delete: (id: number, pin?: string): Promise<void> => {
    return api.delete(`/machines/${id}`, pin ? { data: { pin } } : undefined);
  },

  // Get machines by status
  getByStatus: (status: Machine['status'], filters?: Omit<MachineFilters, 'status'>): Promise<PaginatedResponse<Machine>> => {
    return api.get<PaginatedResponse<Machine>>('/machines', { ...filters, status });
  },

  // Get machines by type
  getByType: (type: string, filters?: Omit<MachineFilters, 'type'>): Promise<PaginatedResponse<Machine>> => {
    return api.get<PaginatedResponse<Machine>>('/machines', { ...filters, type });
  },

  // Update machine status
  updateStatus: (id: number, status: Machine['status']): Promise<Machine> => {
    return api.patch<Machine>(`/machines/${id}/status`, { status });
  },

  // Start machine operation
  startOperation: (id: number): Promise<Machine> => {
    return api.post<Machine>(`/machines/${id}/start`);
  },

  // Stop machine operation
  stopOperation: (id: number): Promise<Machine> => {
    return api.post<Machine>(`/machines/${id}/stop`);
  },

  // Schedule maintenance
  scheduleMaintenance: (id: number, data: {
    type: string;
    notes?: string;
    scheduledDate: string;
  }): Promise<Machine> => {
    return api.post<Machine>(`/machines/${id}/maintenance`, data);
  },

  // Complete maintenance
  completeMaintenance: (id: number): Promise<Machine> => {
    return api.post<Machine>(`/machines/${id}/maintenance/complete`);
  },

  // Get machine utilization data
  getUtilization: (): Promise<MachineUtilization[]> => {
    return api.get<MachineUtilization[]>('/machines/utilization');
  },

  // Get machine statistics
  getStats: (): Promise<{
    total: number;
    running: number;
    available: number;
    maintenance: number;
    offline: number;
    averageUtilization: number;
  }> => {
    return api.get('/machines/stats');
  },

  // Get recent activities from all sources
  getActivities: (): Promise<{
    id: string;
    type: 'production' | 'maintenance' | 'inventory' | 'machine' | 'alert' | 'completed';
    title: string;
    description: string;
    time: string;
    timestamp: string;
  }[]> => {
    return api.get('/machines/activities');
  }
};