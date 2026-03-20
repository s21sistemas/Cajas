import { BaseEntity, BaseFilters, DateRangeFilter } from './api.types';
import type { PaymentType } from './work-order.types';

// Re-export PaymentType para compatibilidad
export type { PaymentType };

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
// export type AccountStatementStatus = 'paid' | 'pending' | 'overdue' | 'partial';

// export interface AccountStatement extends BaseEntity {
//   invoiceNumber: string;
//   clientId: number;
//   clientName: string;
//   date: string;
//   dueDate: string;
//   amount: number;
//   paid: number;
//   balance: number;
//   status: AccountStatementStatus;
//   concept: string;
// }

// export interface CreateAccountStatementDto {
//   clientId: number;
//   invoiceNumber: string;
//   date: string;
//   dueDate?: string;
//   amount: number;
//   paid?: number;
//   status?: AccountStatementStatus;
//   concept: string;
// }

// export interface AccountStatementFilters extends BaseFilters {
//   status?: AccountStatementStatus;
//   clientId?: number;
// }

// Sale types - definido localmente ya que es diferente al de ventas
export type SaleStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

interface SaleItemForm {
  id?: number;
  productId: number | null;
  // Datos del producto para autocompletar
  productName?: string;
  productCode?: string;
  unit: string;
  partNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  subtotal: number;
}

export interface Sale extends BaseEntity {
  code: string;
  clientId: number;
  clientName: string;
  quoteRef: string | null;
  quoteId: number | null;
  items: number;
  saleItems?: SaleItemForm[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  status: SaleStatus;
  paymentType: PaymentType;
  creditDays: string | null;
  dueDate?: string; 
}

export interface CreateSaleDto {
  code: string;
  clientId: number;
  quoteRef?: string;
  quoteId?: number;
  items?: number;
  subtotal: number;
  taxRate?: number;
  tax: number;
  total: number;
  status?: SaleStatus;
  paymentType?: PaymentType;
  creditDays?: string;
}

export interface UpdateSaleDto extends Partial<CreateSaleDto> {}

export interface SaleFilters extends BaseFilters, DateRangeFilter {
  status?: SaleStatus;
  clientId?: number;
}

