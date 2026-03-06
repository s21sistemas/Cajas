// Tipos para Producción (respuesta del backend - usa snake_case)
export interface Production {
  id: number;
  code?: string;
  process_id: number;
  machine_id?: number | null;
  operator_id?: number | null;
  start_time?: string | null;
  end_time?: string | null;
  good_parts: number;
  scrap_parts: number;
  target_parts?: number;
  notes?: string | null;
  status?: ProductionStatus;
  pause_reason?: string | null;
  created_at?: string;
  updated_at?: string;
  parent_production_id?: number | null;
  quality_status?: 'PENDING' | 'APPROVED' | 'SCRAP' | 'REWORK';
  work_order_id?: number | null;
  product_id?: number | null;
  sale_id?: number | null;
  client_id?: number | null;

  // Relaciones
  process?: Process;
  machine?: Machine;
  operator?: Operator;
  product?: Product;
  sale?: Sale;
  client?: Client;
  work_order?: WorkOrder;
}

export type ProductionStatus = 'pending' | 'in_progress' | 'paused' | 'completed' | 'cancelled';

export interface Product {
  id: number;
  name: string;
  code?: string;
}

export interface Sale {
  id: number;
  code: string;
  invoice?: string;
}

export interface Client {
  id: number;
  name: string;
}

export interface WorkOrder {
  id: number;
  code?: string;
  product_name?: string;
  product?: Product;
  client?: Client;
  client_name?: string;
  sale?: Sale;
}

export interface Process {
  id: number;
  code?: string;
  name: string;
  processType?: string;
  requiresMachine?: boolean;
  description?: string | null;
  machineId?: number | null;
}

export interface Machine {
  id: number;
  code: string;
  name: string;
  type: string;
  status?: string;
}

export interface Operator {
  id: number;
  employeeCode: string;
  name: string;
  shift?: string;
  specialty?: string;
  active?: boolean;
}

// Tipos para formularios
export interface CreateProductionDTO {
  processId: number;
  machineId?: number | null;
  operatorId?: number | null;
  productId?: number | null;
  targetParts?: number;
  startTime: string;
  notes?: string;
  workOrderId?: number | null;
  parentProductionId?: number | null;
}

export interface UpdateProductionDTO {
  processId?: number;
  machineId?: number | null;
  operatorId?: number | null;
  productId?: number | null;
  targetParts?: number;
  endTime?: string;
  goodParts?: number;
  scrapParts?: number;
  notes?: string | null;
  status?: ProductionStatus;
  pauseReason?: string;
}

// Para la página de producción
export interface ProductionOrder {
  id: string;
  code: string;
  processName: string;
  processType: string;
  requiresMachine: boolean;
  processId?: number;
  process?: { id: number; name: string };
  machineId: number | null;
  machineName: string | null;
  machine?: { id: number; name: string };
  operatorId: number | null;
  operatorName: string;
  operator?: { id: number; name: string };
  workOrderId?: number;
  workOrder?: { id: number; code: string; client?: { id: number; name: string }; sale?: { id: number; code: string } };
  client?: { id: number; name: string };
  sale?: { id: number; code: string };
  status: ProductionStatus;
  pauseReason?: string;
  targetParts: number;
  goodParts: number;
  scrapParts: number;
  startTime: string;
  endTime: string | null;
  parentProductionId?: number | null;
  qualityStatus?: 'PENDING' | 'APPROVED' | 'SCRAP' | 'REWORK';
  // Información adicional
  productName?: string;
  clientName?: string;
  saleCode?: string;
}

// Transformación de API → UI (Backend usa snake_case)
export function transformProductionToOrder(production: Production): ProductionOrder {
  return {
    id: String(production.id),
    code: production.code || `OP-${String(production.id).padStart(4, '0')}`,
    processName: production.process?.name || 'Proceso',
    processType: production.process?.processType || production.process?.name || 'Proceso',
    requiresMachine: production.process?.requiresMachine ?? true,
    processId: production.process_id,
    process: production.process ? { id: production.process.id, name: production.process.name } : undefined,
    machineId: production.machine_id ?? null,
    machineName: production.machine?.name || null,
    machine: production.machine ? { id: production.machine.id, name: production.machine.name } : undefined,
    operatorId: production.operator_id ?? null,
    operatorName: production.operator?.name || 'Operador',
    operator: production.operator ? { id: production.operator.id, name: production.operator.name } : undefined,
    workOrderId: production.work_order_id || undefined,
    workOrder: production.work_order ? {
      id: production.work_order.id,
      code: production.work_order.code || '',
      client: production.work_order.client ? { id: production.work_order.client.id, name: production.work_order.client.name } : undefined,
      sale: production.work_order.sale ? { id: production.work_order.sale.id, code: production.work_order.sale.code || '' } : undefined,
    } : undefined,
    client: production.work_order?.client ? { id: production.work_order.client.id, name: production.work_order.client.name } : undefined,
    sale: production.work_order?.sale ? { id: production.work_order.sale.id, code: production.work_order.sale.code || '' } : undefined,
    status: production.status || 'pending',
    pauseReason: production.pause_reason || undefined,
    targetParts: production.target_parts || 0,
    goodParts: production.good_parts || 0,
    scrapParts: production.scrap_parts || 0,
    startTime: production.start_time || '',
    endTime: production.end_time || null,
    parentProductionId: production.parent_production_id || null,
    qualityStatus: production.quality_status || 'PENDING',
    // Información adicional
    productName: production.product?.name || production.work_order?.product?.name || production.work_order?.product_name || '',
    clientName: production.client?.name || production.work_order?.client?.name || production.work_order?.client_name || '',
    saleCode: production.sale?.code || production.work_order?.sale?.invoice || '',
  };
}
