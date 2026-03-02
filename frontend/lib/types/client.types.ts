import { BaseEntity, BaseFilters } from './api.types';

export interface Client extends BaseEntity {
  code: string;
  name: string;
  rfc: string | null;
  email: string | null;
  phone: string | null;
  contacto: string | null;
  whatsapp: string | null;
  address: string;
  city: string;
  state: string;
  creditLimit: number;
  balance: number;
  status: 'active' | 'inactive' | 'blocked';
}

export interface Branch extends BaseEntity {
  code: string;
  name: string;
  clientId: number;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  contact: string | null;
  status: 'active' | 'inactive';
  client?: Client;
}

export interface Quote extends BaseEntity {
  code: string;
  clientId: number;
  title: string;
  items: any; // JSON structure for quote items
  subtotal: number;
  tax: number;
  taxPercentage: number;
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  validUntil: string;
  createdBy: string;
  client?: Client;
}

export interface Sale extends BaseEntity {
  code: string;
  clientId: number;
  clientName: string;
  quoteRef: string | null;
  quoteId: number | null;
  items: number;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod: string;
  paymentType: 'cash' | 'credit';
  creditDays: string | null;
  dueDate: string;
  client?: Client;
  quote?: Quote;
}

export interface AccountStatement extends BaseEntity {
  clientId: number;
  clientName: string;
  invoiceNumber: string;
  invoice_number?: string;
  date: string;
  dueDate: string | null;
  due_date?: string | null;
  amount: number;
  paid: number;
  balance: number;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  concept: string;
  client?: Client;
}

// DTOs for creating/updating
export interface CreateClientDto {
  code: string;
  name: string;
  rfc?: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  creditLimit?: number;
  balance?: number;
  status?: Client['status'];
}

export interface CreateBranchDto {
  code: string;
  name: string;
  clientId: number;
  address: string;
  city: string;
  state: string;
  phone?: string;
  contact?: string;
  status?: Branch['status'];
}

export interface CreateQuoteDto {
  code: string;
  clientId: number;
  title: string;
  items?: any;
  subtotal?: number;
  tax?: number;
  total?: number;
  status?: Quote['status'];
  validUntil: string;
  createdBy: string;
}

export interface CreateSaleDto {
  code: string;
  clientId: number;
  quoteRef?: string;
  items?: any;
  subtotal: number;
  tax: number;
  total: number;
  paid?: number;
  status?: Sale['status'];
  paymentMethod: string;
  dueDate: string;
}

export interface CreateAccountStatementDto {
  clientId: number;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  amount: number;
  paid?: number;
  balance: number;
  status: AccountStatement['status'];
  concept: string;
}

// Update DTOs
export type UpdateClientDto = Partial<CreateClientDto>;
export type UpdateBranchDto = Partial<CreateBranchDto>;
export type UpdateQuoteDto = Partial<CreateQuoteDto>;
export type UpdateSaleDto = Partial<CreateSaleDto>;
export type UpdateAccountStatementDto = Partial<CreateAccountStatementDto>;

// Filters
export interface ClientFilters extends BaseFilters {
  status?: Client['status'];
  city?: string;
  state?: string;
}

export interface BranchFilters extends BaseFilters {
  status?: Branch['status'];
  clientId?: number;
}

export interface QuoteFilters extends BaseFilters {
  status?: Quote['status'];
  clientId?: number;
  validUntil?: string;
}

export interface SaleFilters extends BaseFilters {
  status?: Sale['status'];
  clientId?: number;
  paymentMethod?: string;
  dueDate?: string;
}

export interface AccountStatementFilters extends BaseFilters {
  status?: AccountStatement['status'];
  clientId?: number;
  date?: string;
  dueDate?: string;
}