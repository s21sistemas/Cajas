// Tipos para el módulo de Producción
// Definimos tipos locales mínimos para el módulo de producción

export type ProductionStatus = 'pending' | 'in_progress' | 'paused' | 'completed' | 'cancelled';

// Tipos locales con campos mínimos - no importamos de lib/types para evitar conflictos
export interface Process {
  id: number;
  code?: string;
  name: string;
  processType?: string;
  requiresMachine?: boolean;
  description?: string | null;
  machineId?: number | null;
}

export interface Operator {
  id: number;
  employeeCode?: string;
  name: string;
  shift?: string;
  specialty?: string;
  active?: boolean;
}

export interface Machine {
  id: number;
  code?: string;
  name: string;
  type?: string;
  status?: string;
}

export interface Product {
  id: number;
  name: string;
  code?: string;
  description?: string | null;
  category?: string | null;
  price?: number | null;
  cost?: number | null;
}

// Tipo para el formulario de creación
export interface CreateProductionForm {
  processId: number;
  machineId: number;
  operatorId: number;
  productId: number;
  targetParts: number;
  notes: string;
  workOrderId: number;
  parentProductionId: number;
}

// Configuración de estados
export const STATUS_CONFIG: Record<ProductionStatus, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'En Proceso', color: 'bg-primary/20 text-primary' },
  paused: { label: 'Pausado', color: 'bg-yellow-500/20 text-yellow-500' },
  completed: { label: 'Completado', color: 'bg-green-500/20 text-green-500' },
  cancelled: { label: 'Cancelado', color: 'bg-destructive/20 text-destructive' },
};

// Razones de pausa predefinidas
export const PAUSE_REASONS = [
  'Falta de material',
  'Cambio de suaje/troquel',
  'Ajuste de maquina',
  'Pausa programada',
  'Inspeccion de calidad',
  'Cambio de tinta',
  'Limpieza de equipo',
  'Problema tecnico',
  'Otro',
];

// Valores por defecto
export const DEFAULT_FORM: CreateProductionForm = {
  processId: 0,
  machineId: 0,
  operatorId: 0,
  productId: 0,
  targetParts: 100,
  notes: '',
  workOrderId: 0,
  parentProductionId: 0,
};

// WorkOrder tipo específico para producción (del módulo de Órdenes de Trabajo)
export interface WorkOrder {
  id: number;
  code: string;
  productName?: string;
  clientName?: string;
  quantity?: number;
  completed?: number;
  progress?: number;
  status?: 'draft' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
}
