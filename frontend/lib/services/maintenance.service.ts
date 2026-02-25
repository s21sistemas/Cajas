import { api } from '../api';
import type { PaginatedResponse } from '../types/api.types';
import type {
  MaintenanceOrder,
  CreateMaintenanceOrderDto,
  UpdateMaintenanceOrderDto,
  MaintenanceOrderFilters
} from '../types/maintenance.types';

export const maintenanceService = {
  // Get all maintenance orders with pagination and filters
  getAll: (filters?: MaintenanceOrderFilters): Promise<PaginatedResponse<MaintenanceOrder>> => {
    return api.get<PaginatedResponse<MaintenanceOrder>>('/maintenance-orders', filters);
  },

  // Get maintenance order by ID
  getById: (id: number): Promise<MaintenanceOrder> => {
    return api.get<MaintenanceOrder>(`/maintenance-orders/${id}`);
  },

  // Create new maintenance order
  create: (data: CreateMaintenanceOrderDto): Promise<MaintenanceOrder> => {
    return api.post<MaintenanceOrder>('/maintenance-orders', data);
  },

  // Update existing maintenance order
  update: (id: number, data: UpdateMaintenanceOrderDto): Promise<MaintenanceOrder> => {
    return api.put<MaintenanceOrder>(`/maintenance-orders/${id}`, data);
  },

  // Delete maintenance order
  delete: (id: number): Promise<void> => {
    return api.delete(`/maintenance-orders/${id}`);
  },

  // Update maintenance order status
  updateStatus: (id: number, status: string): Promise<MaintenanceOrder> => {
    return api.patch<MaintenanceOrder>(`/maintenance-orders/${id}/status`, { status });
  },

  // Start maintenance
  start: (id: number): Promise<MaintenanceOrder> => {
    return api.post<MaintenanceOrder>(`/maintenance-orders/${id}/start`);
  },

  // Complete maintenance
  complete: (id: number, actualHours: number, actualCost?: number): Promise<MaintenanceOrder> => {
    return api.post<MaintenanceOrder>(`/maintenance-orders/${id}/complete`, { actualHours, actualCost });
  },

  // Get maintenance statistics
  getStats: async (): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    totalCost: number;
  }> => {
    const response = await api.get<{ data: {
      total: number;
      pending: number;
      inProgress: number;
      completed: number;
      totalCost: number;
    } }>('/maintenance-orders/stats');
    return response.data;
  },

  // Get upcoming maintenance
  getUpcoming: (days: number = 7): Promise<PaginatedResponse<MaintenanceOrder>> => {
    return api.get<PaginatedResponse<MaintenanceOrder>>('/maintenance-orders/upcoming', { days });
  },

  // Get maintenance history for machine
  getMachineHistory: (machineId: number): Promise<MaintenanceOrder[]> => {
    return api.get<MaintenanceOrder[]>(`/machines/${machineId}/maintenance-history`);
  }
};
