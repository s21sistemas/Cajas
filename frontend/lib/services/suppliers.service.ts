import { api } from '../api';
import type {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierFilters,
  PaginatedResponse
} from '../types';

export const suppliersService = {
  // Get all suppliers with pagination and filters
  getAll: (filters?: SupplierFilters): Promise<PaginatedResponse<Supplier>> => {
    return api.get<PaginatedResponse<Supplier>>('/suppliers', filters);
  },

  // Get supplier by ID
  getById: (id: number): Promise<Supplier> => {
    return api.get<Supplier>(`/suppliers/${id}`);
  },

  // Create new supplier
  create: (data: CreateSupplierDto): Promise<Supplier> => {
    return api.post<Supplier>('/suppliers', data);
  },

  // Update existing supplier
  update: (id: number, data: UpdateSupplierDto): Promise<Supplier> => {
    return api.put<Supplier>(`/suppliers/${id}`, data);
  },

  // Delete supplier
  delete: (id: number): Promise<void> => {
    return api.delete(`/suppliers/${id}`);
  },

  // Get suppliers by status
  getByStatus: (status: Supplier['status'], filters?: Omit<SupplierFilters, 'status'>): Promise<PaginatedResponse<Supplier>> => {
    return api.get<PaginatedResponse<Supplier>>('/suppliers', { ...filters, status });
  },

  // Get supplier statistics
  getStats: async (): Promise<{
    total: number;
    active: number;
    inactive: number;
    pending: number;
    totalBalance: number;
    avgLeadTime: number;
  }> => {
    const response = await api.get<{ data: {
      total: number;
      active: number;
      inactive: number;
      pending: number;
      totalBalance: number;
      avgLeadTime: number;
    } }>('/suppliers/stats');
    return response.data;
  }
};
