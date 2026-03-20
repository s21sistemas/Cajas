import type { WorkOrder } from "./work-order.types";
import type { Process } from "./process.types";
import type { Machine } from "./machine.types";
import type { Operator } from "./operator.types";
import type { Product } from "./product.types";
import type { Client } from "./client.types";

// Re-exportar tipos importados para compatibilidad
export type { WorkOrder, Process, Machine, Operator, Product, Client };

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
  parentProcess?: Production | null;
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

// Sale type - definido localmente ya que no existe en otro archivo
export interface Sale {
  id: number;
  code: string;
  invoice?: string;
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
  incrementParts?: boolean;
}
