import { BaseEntity, BaseFilters, DateRangeFilter } from './api.types';

// Service Order types
export type ServiceOrderStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type ServiceOrderType = 'repair' | 'maintenance' | 'installation' | 'consultation';
export type ServiceOrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ServiceOrder extends BaseEntity {
  code: string;
  clientId: number;
  clientName: string;
  title: string;
  description: string;
  type: ServiceOrderType;
  priority: ServiceOrderPriority;
  status: ServiceOrderStatus;
  assignedTo: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  scheduledDate: string | null;
  completedDate: string | null;
  cost: number | null;
}

export interface CreateServiceOrderDto {
  clientId: number;
  title: string;
  description: string;
  type: ServiceOrderType;
  priority?: ServiceOrderPriority;
  assignedTo?: string;
  estimatedHours?: number;
  scheduledDate?: string;
  cost?: number;
}

export interface UpdateServiceOrderDto extends Partial<CreateServiceOrderDto> {
  status?: ServiceOrderStatus;
  actualHours?: number;
  completedDate?: string;
}

export interface ServiceOrderFilters extends BaseFilters, DateRangeFilter {
  status?: ServiceOrderStatus;
  type?: ServiceOrderType;
  priority?: ServiceOrderPriority;
  clientId?: number;
}

// Account Statement types (client account balances)
export type AccountStatementStatus = 'paid' | 'pending' | 'overdue' | 'partial';

export interface AccountStatement extends BaseEntity {
  invoiceNumber: string;
  clientId: number;
  clientName: string;
  date: string;
  dueDate: string;
  amount: number;
  paid: number;
  balance: number;
  status: AccountStatementStatus;
  concept: string;
}

export interface CreateAccountStatementDto {
  clientId: number;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  amount: number;
  paid?: number;
  status?: AccountStatementStatus;
  concept: string;
}

export interface AccountStatementFilters extends BaseFilters {
  status?: AccountStatementStatus;
  clientId?: number;
}

// Quote types
export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

export interface Quote extends BaseEntity {
  code: string;
  clientId: number;
  clientName: string;
  title: string;
  items: string | null;
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  status: QuoteStatus;
  validUntil: string | null;
  createdBy: string | null;
}

export interface CreateQuoteDto {
  clientId: number;
  title: string;
  items?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  status?: QuoteStatus;
  validUntil?: string;
  createdBy?: string;
}

export interface UpdateQuoteDto extends Partial<CreateQuoteDto> {
  code?: string;
}

export interface QuoteFilters extends BaseFilters, DateRangeFilter {
  status?: QuoteStatus;
  clientId?: number;
}

// Sale types
export type SaleStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';

export interface Sale extends BaseEntity {
  invoice: string;
  clientId: number;
  clientName: string;
  quoteRef: string | null;
  quoteId: number | null;
  items: string | null;
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  paid: number | null;
  status: SaleStatus;
  paymentMethod: string | null;
  dueDate: string | null;
}

export interface CreateSaleDto {
  invoice: string;
  clientId: number;
  quoteRef?: string;
  quoteId?: number;
  items?: string;
  subtotal: number;
  tax: number;
  total: number;
  paid?: number;
  status?: SaleStatus;
  paymentMethod: string;
  dueDate?: string;
}

export interface UpdateSaleDto extends Partial<CreateSaleDto> {}

export interface SaleFilters extends BaseFilters, DateRangeFilter {
  status?: SaleStatus;
  clientId?: number;
}

// Branch types
export type BranchStatus = 'active' | 'inactive';

export interface Branch extends BaseEntity {
  code: string;
  name: string;
  clientId: number;
  clientName: string;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  contact: string | null;
  status: BranchStatus;
}

export interface CreateBranchDto {
  code?: string;
  name: string;
  clientId: number;
  address: string;
  city: string;
  state: string;
  phone?: string;
  contact?: string;
  status?: BranchStatus;
}

export interface BranchFilters extends BaseFilters {
  status?: BranchStatus;
  clientId?: number;
}

