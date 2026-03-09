// Tipos para Producción (respuesta del backend - usa snake_case)
export interface Production {
  id: number;
  code?: string;
  processId: number;
  machineId?: number | null;
  operatorId?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  goodParts: number;
  scrapParts: number;
  targetParts?: number;
  notes?: string | null;
  status?: ProductionStatus;
  pauseReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  parentProductionId?: number | null;
  qualityStatus?: 'PENDING' | 'APPROVED' | 'SCRAP' | 'REWORK';
  workOrderId?: number | null;
  productId?: number | null;
  saleId?: number | null;
  clientId?: number | null;

  // Relaciones
  process?: Process;
  machine?: Machine;
  operator?: Operator;
  product?: Product;
  sale?: Sale;
  client?: Client;
  workOrder?: WorkOrder;
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
