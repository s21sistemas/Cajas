// Tipos para el módulo de Producción
// Todos los tipos relacionados con producción en un solo lugar

export type ProductionStatus = 'pending' | 'in_progress' | 'paused' | 'completed' | 'cancelled';

export interface Process {
  id: string;
  name: string;
  requiresMachine?: boolean;
}

export interface Operator {
  id: string;
  name: string;
}

export interface Machine {
  id: string;
  name: string;
}

// Tipo para el formulario de creación
export interface CreateProductionForm {
  processId: string;
  machineId: string | undefined;
  operatorId: string | undefined;
  targetParts: number;
  notes: string;
  workOrderId: string | undefined;
}

// Tipo para la lista de producciones
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
  processId: '',
  machineId: undefined,
  operatorId: undefined,
  targetParts: 100,
  notes: '',
  workOrderId: undefined,
};

// Tipo para WorkOrder (del módulo de Órdenes de Trabajo)
export interface WorkOrder {
  id: number;
  code: string;
  product_name: string;
  client_name: string;
  quantity: number;
  completed: number;
  progress: number;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
}
