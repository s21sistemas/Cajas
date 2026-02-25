import { api } from '../api';
import type { PaginatedResponse } from '../types/api.types';
import type { Product } from '../types/product.types';
import type { Client } from '../types/client.types';
import type { Supplier } from '../types/supplier.types';
import type {
  WorkOrder,
  WorkOrderItem,
  WorkOrderProcess,
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  WorkOrderFilters
} from '../types/work-order.types';

export const workOrdersService = {
  // Get all work orders with pagination and filters
  getAll: (filters?: WorkOrderFilters): Promise<PaginatedResponse<WorkOrder>> => {
    return api.get<PaginatedResponse<WorkOrder>>('/work-orders', filters);
  },

  // Get work order by ID
  getById: (id: number): Promise<WorkOrder> => {
    return api.get<WorkOrder>(`/work-orders/${id}`);
  },

  // Create new work order
  create: (data: CreateWorkOrderDto): Promise<WorkOrder> => {
    return api.post<WorkOrder>('/work-orders', data);
  },

  // Update existing work order
  update: (id: number, data: UpdateWorkOrderDto): Promise<WorkOrder> => {
    return api.put<WorkOrder>(`/work-orders/${id}`, data);
  },

  // Delete work order
  delete: (id: number): Promise<void> => {
    return api.delete(`/work-orders/${id}`);
  },

  // Update work order status
  updateStatus: (id: number, status: string): Promise<WorkOrder> => {
    return api.patch<WorkOrder>(`/work-orders/${id}/status`, { status });
  },

  // Update work order progress
  updateProgress: (id: number, completed: number): Promise<WorkOrder> => {
    return api.patch<WorkOrder>(`/work-orders/${id}/progress`, { completed });
  },

  // Get work order items
  getItems: (workOrderId: number): Promise<WorkOrderItem[]> => {
    return api.get<WorkOrderItem[]>(`/work-orders/${workOrderId}/items`);
  },

  // Add item to work order
  addItem: (workOrderId: number, item: Partial<WorkOrderItem>): Promise<WorkOrderItem> => {
    return api.post<WorkOrderItem>(`/work-orders/${workOrderId}/items`, item);
  },

  // Get work order processes
  getProcesses: (workOrderId: number): Promise<WorkOrderProcess[]> => {
    return api.get<WorkOrderProcess[]>(`/work-orders/${workOrderId}/processes`);
  },

  // Get work order statistics
  getStats: (): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }> => {
    return api.get('/work-orders/stats');
  },

  // Get assigned work orders (for operators)
  getAssigned: (operator?: string): Promise<PaginatedResponse<WorkOrder>> => {
    const params = operator ? { operator } : {};
    return api.get<PaginatedResponse<WorkOrder>>('/work-orders/assigned', params);
  },

  // Mark work order as complete and transfer to finished goods inventory
  markComplete: (id: number): Promise<{ transferred_quantity: number; new_stock: number }> => {
    return api.post<{ transferred_quantity: number; new_stock: number }>(`/work-orders/${id}/mark-complete`);
  },

  // Get products for work order form (requires workorders.create permission)
  getProducts: (params?: { search?: string; per_page?: number }): Promise<PaginatedResponse<Product>> => {
    return api.get<PaginatedResponse<Product>>('/work-orders/products', params);
  },

  // Get clients for work order form (requires workorders.create permission)
  getClients: (params?: { search?: string; per_page?: number }): Promise<PaginatedResponse<Client>> => {
    return api.get<PaginatedResponse<Client>>('/work-orders/clients', params);
  },

  // Get suppliers for work order form (requires workorders.create permission)
  getSuppliers: (params?: { search?: string; per_page?: number }): Promise<PaginatedResponse<Supplier>> => {
    return api.get<PaginatedResponse<Supplier>>('/work-orders/suppliers', params);
  }
};
