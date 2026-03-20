// Export all types for easy importing
// NOTA: Algunos archivos tienen tipos duplicados con nombres diferentes.
// Para evitar conflictos, exportamos cada tipo explícitamente.

// API y tipos base
export type * from './api.types';

// Tipos principales (sin conflictos)
export type * from './product.types';
export type * from './material.types';
export type * from './process.types';
export type * from './machine.types';
export type * from './operator.types';
export type * from './inventory.types';
export type * from './supplier.types';
export type * from './hr.types';
export type * from './finance.types';
export type * from './purchase-order.types';
export type * from './maintenance.types';
export type * from './order-pedido.types';
export type * from './reports.types';
export type * from './vehicle.types';
export type * from './delivery.types';
export type * from './gasoline-receipt.types';

// Client y WorkOrder (tienen tipos que pueden duplicarse)
export type { Client, Branch, CreateClientDto, CreateBranchDto, UpdateClientDto, UpdateBranchDto } from './client.types';
export type { WorkOrder, WorkOrderStatus, WorkOrderPriority, CreateWorkOrderDto, UpdateWorkOrderDto, WorkOrderFilters, WorkOrderItem } from './work-order.types';
export type { PaymentType } from './work-order.types';

// Quote y ServiceOrder - exportar tipos específicos para evitar conflictos
export type { Quote, QuoteStatus, CreateQuoteDto, UpdateQuoteDto, QuoteFilters, QuoteItem, QuoteStats } from './quote.types';
export type { ServiceOrder, ServiceOrderStatus, ServiceOrderType, ServiceOrderPriority, CreateServiceOrderDto, UpdateServiceOrderDto, ServiceOrderFilters } from './service-order.types';
export type { Sale, SaleStatus, CreateSaleDto, UpdateSaleDto, SaleFilters } from './service-order.types';
export type { PaymentType as ServicePaymentType } from './service-order.types';
