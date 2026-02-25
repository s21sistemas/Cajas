// Tipos para Producción
export interface Production {
  id: number;
  code?: string;
  process_id: number;
  machine_id?: number | null;
  operator_id: number;
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

  // Relaciones
  process?: Process;
  machine?: Machine;
  operator?: Operator;
}

export type ProductionStatus = 'pending' | 'in_progress' | 'paused' | 'completed' | 'cancelled';

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
  targetParts?: number;
  startTime: string;
  notes?: string;
  workOrderId?: number | null;
}

export interface UpdateProductionDTO {
  processId?: number;
  machineId?: number | null;
  operatorId?: number;
  targetParts?: number;
  endTime?: string;
  goodParts?: number;
  scrapParts?: number;
  notes?: string;
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
  machineName: string | null;
  operatorName: string;
  status: ProductionStatus;
  pauseReason?: string;
  targetParts: number;
  goodParts: number;
  scrapParts: number;
  startTime: string;
  endTime: string | null;
}

// Transformación de API → UI (Backend usa snake_case)
export function transformProductionToOrder(production: Production): ProductionOrder {
  return {
    id: String(production.id),
    code: production.code || `OP-${String(production.id).padStart(4, '0')}`,
    processName: production.process?.name || 'Proceso',
    processType: production.process?.processType || production.process?.name || 'Proceso',
    requiresMachine: production.process?.requiresMachine ?? true,
    machineName: production.machine?.name || null,
    operatorName: production.operator?.name || 'Operador',
    status: production.status || 'pending',
    pauseReason: production.pause_reason || undefined,
    targetParts: production.target_parts || 0,
    goodParts: production.good_parts || 0,
    scrapParts: production.scrap_parts || 0,
    startTime: production.start_time || '',
    endTime: production.end_time || null,
  };
}
