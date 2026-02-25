import { api } from '../api';
import type { PaginatedResponse } from '../types/api.types';
import type {
  ServiceOrder,
  CreateServiceOrderDto,
  UpdateServiceOrderDto,
  ServiceOrderFilters,
  Quote,
  CreateQuoteDto,
  UpdateQuoteDto,
  Sale,
  CreateSaleDto,
  UpdateSaleDto,
  AccountStatement,
  CreateAccountStatementDto
} from '../types/service-order.types';
import type { Client, Branch } from '../types/client.types';

export const serviceOrdersService = {
  // Service Orders
  getAll: (filters?: ServiceOrderFilters): Promise<PaginatedResponse<ServiceOrder>> => {
    return api.get<PaginatedResponse<ServiceOrder>>('/service-orders', filters);
  },

  getById: (id: number): Promise<ServiceOrder> => {
    return api.get<ServiceOrder>(`/service-orders/${id}`);
  },

  create: (data: CreateServiceOrderDto): Promise<ServiceOrder> => {
    return api.post<ServiceOrder>('/service-orders', data);
  },

  update: (id: number, data: UpdateServiceOrderDto): Promise<ServiceOrder> => {
    return api.put<ServiceOrder>(`/service-orders/${id}`, data);
  },

  delete: (id: number): Promise<void> => {
    return api.delete(`/service-orders/${id}`);
  },

  updateStatus: (id: number, status: string): Promise<ServiceOrder> => {
    return api.patch<ServiceOrder>(`/service-orders/${id}/status`, { status });
  },

  // Quotes
  getQuotes: (filters?: ServiceOrderFilters): Promise<PaginatedResponse<Quote>> => {
    return api.get<PaginatedResponse<Quote>>('/quotes', filters);
  },

  getQuoteById: (id: number): Promise<Quote> => {
    return api.get<Quote>(`/quotes/${id}`);
  },

  createQuote: (data: CreateQuoteDto): Promise<Quote> => {
    return api.post<Quote>('/quotes', data);
  },

  updateQuote: (id: number, data: UpdateQuoteDto): Promise<Quote> => {
    return api.put<Quote>(`/quotes/${id}`, data);
  },

  // Sales
  getSales: (filters?: ServiceOrderFilters): Promise<PaginatedResponse<Sale>> => {
    return api.get<PaginatedResponse<Sale>>('/sales', filters);
  },

  getSaleById: (id: number): Promise<Sale> => {
    return api.get<Sale>(`/sales/${id}`);
  },

  createSale: (data: CreateSaleDto): Promise<Sale> => {
    return api.post<Sale>('/sales', data);
  },

  updateSale: (id: number, data: UpdateSaleDto): Promise<Sale> => {
    return api.put<Sale>(`/sales/${id}`, data);
  },

  // Account Statements
  getAccountStatements: (clientId?: number): Promise<PaginatedResponse<AccountStatement>> => {
    return api.get<PaginatedResponse<AccountStatement>>('/account-statements', { clientId });
  },

  createAccountStatement: (data: CreateAccountStatementDto): Promise<AccountStatement> => {
    return api.post<AccountStatement>('/account-statements', data);
  },

  // Statistics
  getServiceStats: (): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  }> => {
    return api.get('/service-orders/stats');
  },

  getQuoteStats: (): Promise<{
    total: number;
    draft: number;
    sent: number;
    approved: number;
    totalValue: number;
  }> => {
    return api.get('/quotes/stats');
  },

  getSaleStats: (): Promise<{
    total: number;
    pending: number;
    paid: number;
    totalAmount: number;
    totalPaid: number;
  }> => {
    return api.get('/sales/stats');
  }
};
