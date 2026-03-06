import { api } from '../api';
import type {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierFilters,
  PaginatedResponse
} from '../types';

// Tipos para estados de cuenta de proveedores
export interface SupplierStatement {
  id: number;
  invoiceNumber: string;
  supplierId: number;
  supplierName: string;
  date: string;
  dueDate: string;
  amount: number;
  paid: number;
  balance: number;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  concept: string;
  payments?: Array<{
    id: number;
    code?: string;
    amount: number;
    payment_method: string;
    reference?: string;
    payment_date: string;
    status: string;
  }>;
}

export interface CreateSupplierStatementDto {
  supplier_id: number;
  invoice_number: string;
  date: string;
  due_date: string;
  amount: number;
  paid?: number;
  balance: number;
  status?: 'paid' | 'pending' | 'overdue' | 'partial';
  concept: string;
}

export const suppliersService = {
  // Get all suppliers with pagination and filters
  getAll: (filters?: SupplierFilters): Promise<PaginatedResponse<Supplier>> => {
    return api.get<PaginatedResponse<Supplier>>('/suppliers', filters);
  },

  // Get suppliers for select list
  selectList: (): Promise<Supplier[]> => {
    return api.get<Supplier[]>('/suppliers/select-list');
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
    const response = await api.get<{
      total: number;
      active: number;
      inactive: number;
      pending: number;
      totalBalance: number;
      avgLeadTime: number;
    }>('/suppliers/stats');
    return response;
  },

  // Get supplier statements (estado de cuenta)
  getStatements: (filters?: { supplier_id?: number; status?: string; per_page?: number }): Promise<PaginatedResponse<SupplierStatement>> => {
    return api.get<PaginatedResponse<SupplierStatement>>('/supplier-statements', filters);
  },

  // Get supplier statement by ID
  getStatementById: (id: number): Promise<SupplierStatement> => {
    return api.get<SupplierStatement>(`/supplier-statements/${id}`);
  },

  // Create supplier statement
  createStatement: (data: CreateSupplierStatementDto): Promise<SupplierStatement> => {
    return api.post<SupplierStatement>('/supplier-statements', data);
  },

  // Update supplier statement
  updateStatement: (id: number, data: Partial<CreateSupplierStatementDto>): Promise<SupplierStatement> => {
    return api.put<SupplierStatement>(`/supplier-statements/${id}`, data);
  },

  // Delete supplier statement
  deleteStatement: (id: number): Promise<void> => {
    return api.delete(`/supplier-statements/${id}`);
  },
};
