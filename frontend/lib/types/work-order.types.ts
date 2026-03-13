import { BaseEntity, BaseFilters, DateRangeFilter } from './api.types';

// Work Order types
export type WorkOrderStatus = 'draft' | 'pending' | 'approved' | 'ordered' | 'partial' | 'received' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold' | 'paused';
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent';
export type PaymentType = 'cash' | 'credit';

export interface WorkOrder extends BaseEntity {
  code: string;
  clientId: number | null;
  clientName: string | null;
  supplierId: number | null;
  supplierName: string | null;
  saleId: number | null;
  saleCode: string | null;
  productId: number | null;
  productName: string;
  quantity: number;
  completed: number;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  startDate: string | null;
  dueDate: string | null;
  expectedDate: string | null;
  progress: number;
  estimatedTime: number;
  actualTime: number;
  machineId: number | null;
  machineName: string | null;
  operatorId: number | null;
  operatorName: string | null;
  notes: string | null;
  cancellationReason: string | null;
  // Campos de precios
  unitPrice: number;
  subtotal: number;
  iva: number;
  total: number;
  // Campos de pago
  paymentType: PaymentType;
  creditDays: number;
  client?: {
    id: number;
    name: string;
  }
}

export interface WorkOrderItem extends BaseEntity {
  workOrderId: number;
  productName: string;
  width: number;
  height: number;
  depth: number;
  quantity: number;
  notes: string | null;
}

export interface WorkOrderProcess extends BaseEntity {
  workOrderId: number;
  processId: number;
  processName: string;
  machineId: number | null;
  machineName: string | null;
  employeeId: number | null;
  employeeName: string | null;
  status: WorkOrderStatus;
  completedQuantity: number;
  estimatedTime: number;
  actualTime: number;
  startTime: string | null;
  endTime: string | null;
}

export interface CreateWorkOrderDto {
  product_id?: number | null;
  client_id?: number | null;
  supplier_id?: number | null;
  sale_id?: number | null;
  product_name?: string;
  quantity?: number;
  priority?: WorkOrderPriority;
  start_date?: string;
  due_date?: string;
  expected_date?: string;
  notes?: string;
  // Campos de precios
  unit_price?: number;
  subtotal?: number;
  iva?: number;
  total?: number;
  // Campos de pago
  payment_type?: PaymentType;
  credit_days?: number;
}

export interface UpdateWorkOrderDto extends Partial<CreateWorkOrderDto> {
  status?: WorkOrderStatus;
  completed?: number;
  progress?: number;
}

export interface WorkOrderFilters extends BaseFilters, DateRangeFilter {
  status?: WorkOrderStatus;
  priority?: WorkOrderPriority;
  clientId?: number;
  productId?: number;
  supplierId?: number;
}
