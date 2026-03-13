import { BaseEntity, BaseFilters, DateRangeFilter } from './api.types';
import { Material } from './material.types';
import { Supplier } from './supplier.types';

// Purchase Order types
export type PurchaseOrderStatus = 'draft' | 'pending' | 'approved' | 'ordered' | 'partial' | 'received' | 'cancelled';
export type PurchaseOrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface PurchaseOrder extends BaseEntity {
  code: string;
  supplierId: number;
  supplierName: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: PurchaseOrderStatus;
  priority: PurchaseOrderPriority;
  requestedBy: string;
  approvedBy: string | null;
  expectedDate: string | null;
  notes: string | null;
  materialName: string;
  material?: Material;
  supplier?: Supplier;
  quantity: number;
  paymentType: string;
  creditDays: number;
}

export interface PurchaseOrderItem {
  productId?: number;
  productName?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreatePurchaseOrderDto {
  supplierId: number;
  priority?: PurchaseOrderPriority;
  expectedDate?: string;
}

export interface UpdatePurchaseOrderDto extends Partial<CreatePurchaseOrderDto> {
  status?: PurchaseOrderStatus;
}

export interface PurchaseOrderFilters extends BaseFilters, DateRangeFilter {
  status?: PurchaseOrderStatus;
  priority?: PurchaseOrderPriority;
  supplierId?: number;
}

// Supplier Statement types
export type SupplierStatementStatus = 'paid' | 'pending' | 'overdue' | 'partial';

export interface SupplierStatement extends BaseEntity {
  supplierId: number;
  supplierName: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  paid: number;
  balance: number;
  status: SupplierStatementStatus;
  concept: string | null;
}

export interface CreateSupplierStatementDto {
  supplierId: number;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  amount: number;
  concept?: string;
}
