import { api } from '../api';
import type {
  Production,
  ProductionOrder,
  CreateProductionDTO,
  UpdateProductionDTO,
  Process,
  Machine,
  Operator,
  ProductionStatus,
} from '../types/production.types';

// Tipo para WorkOrder (del módulo de Órdenes de Trabajo)
// Definido aquí para evitar dependencia circular con app/produccion/types
interface WorkOrder {
  id: number;
  code: string;
  product_name: string;
  client_name: string;
  quantity: number;
  completed?: number;
  progress?: number;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
}

// Tipo para Product
interface Product {
  id: number;
  name: string;
  code?: string;
}

export type { WorkOrder, Product };

// Tipos para respuesta paginada
interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  links: Array<{ url: string | null; label: string; active: boolean }>;
}

// Transformación de API → UI (Backend usa snake_case)
function transformProductionToOrder(production: Production): ProductionOrder {
  return {
    id: String(production.id),
    code: production.code || `OP-${String(production.id).padStart(4, '0')}`,
    processName: production.process?.name || 'Proceso',
    processType: production.process?.processType || production.process?.name || 'Proceso',
    requiresMachine: production.process?.requiresMachine ?? true,
    machineId: production.machine_id ?? null,
    machineName: production.machine?.name || null,
    operatorId: production.operator_id ?? null,
    operatorName: production.operator?.name || 'Sin operador',
    status: production.status || 'pending',
    pauseReason: production.pause_reason || undefined,
    targetParts: production.target_parts || 0,
    goodParts: production.good_parts || 0,
    scrapParts: production.scrap_parts || 0,
    startTime: production.start_time || '',
    endTime: production.end_time || null,
    parentProductionId: production.parent_production_id || null,
    qualityStatus: production.quality_status || 'PENDING',
    // Nuevos campos
    productName: production.work_order?.product?.name || production.work_order?.product_name || '',
    clientName: production.work_order?.client?.name || production.work_order?.client_name || null,
    saleCode: production.work_order?.sale?.invoice || null,
  };
}

// Convertir DTO camelCase a formato snake_case para el backend
function toSnakeCase(data: CreateProductionDTO | UpdateProductionDTO): Record<string, any> {
  const result: Record<string, any> = {};
  
  if ('processId' in data && data.processId !== undefined) result.process_id = data.processId;
  if ('machineId' in data && data.machineId !== undefined) result.machine_id = data.machineId;
  if ('operatorId' in data && data.operatorId !== undefined && data.operatorId !== null) result.operator_id = data.operatorId;
  if ('productId' in data && data.productId !== undefined && data.productId !== null) result.product_id = data.productId;
  if ('targetParts' in data && data.targetParts !== undefined) result.target_parts = data.targetParts;
  if ('startTime' in data && data.startTime !== undefined) result.start_time = data.startTime;
  if ('endTime' in data && data.endTime !== undefined) result.end_time = data.endTime;
  if ('goodParts' in data && data.goodParts !== undefined) result.good_parts = data.goodParts;
  if ('scrapParts' in data && data.scrapParts !== undefined) result.scrap_parts = data.scrapParts;
  if ('notes' in data && data.notes !== undefined) result.notes = data.notes;
  if ('status' in data && data.status !== undefined) result.status = data.status;
  if ('pauseReason' in data && data.pauseReason !== undefined) result.pause_reason = data.pauseReason;
  if ('workOrderId' in data && data.workOrderId !== undefined && data.workOrderId !== null) result.work_order_id = data.workOrderId;
  if ('parentProductionId' in data && data.parentProductionId !== undefined && data.parentProductionId !== null) result.parent_production_id = data.parentProductionId;
  
  return result;
}

// Extraer datos de respuesta API (maneja el formato { success, message, data })
function extractData<T>(response: any): T {
  // Si la respuesta tiene el formato { success, message, data }
  if (response && typeof response === 'object' && 'success' in response) {
    // Verificar si la respuesta indica un error del servidor
    if (response.success === false) {
      // Lanzar un error con el mensaje del servidor
      const error = new Error(response.message || 'Error del servidor');
      (error as any).response = response;
      throw error;
    }
    // Si success es true, retornar los datos
    return response.data;
  }
  // Si es un array directo o paginación
  return response;
}

// Extraer array de datos (para paginación)
function extractDataArray<T>(response: any): T[] {
  const data = extractData<T[]>(response);
  return Array.isArray(data) ? data : [];
}

export const productionService = {
  // Obtener todas las producciones (paginado) con filtros
  async getAll(filters?: { client_id?: number; sale_id?: number; status?: string }): Promise<ProductionOrder[]> {
    try {
      // Construir query params
      const params = new URLSearchParams();
      if (filters?.client_id) params.append('client_id', String(filters.client_id));
      if (filters?.sale_id) params.append('sale_id', String(filters.sale_id));
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      
      const queryString = params.toString();
      const url = queryString ? `/productions?${queryString}` : '/productions';
      
      const response = await api.get<PaginatedResponse<Production>>(url);
       
      // El paginator de Laravel tiene la estructura: { data: [...], current_page: 1, ... }
      let productions: Production[] = [];
      
      if (response && 'data' in response) {
        productions = (response as any).data || [];
      } else if (Array.isArray(response)) {
        productions = response;
      }
      
      return productions.map(transformProductionToOrder);
    } catch (error: any) {
      console.warn('Error fetching productions, usando mock:', error?.message || error);
      return [];
    }
  },

  // Obtener una producción por ID
  async getById(id: number): Promise<ProductionOrder> {
    try {
      const response = await api.get<any>(`/productions/${id}`);
      const production = extractData<Production>(response);
      return transformProductionToOrder(production);
    } catch (error: any) {
      console.warn(`Error fetching production ${id}:`, error?.message || error);
      throw error;
    }
  },

  // Crear nueva producción
  async create(data: CreateProductionDTO): Promise<ProductionOrder> {
    try {
      const snakeData = toSnakeCase(data);
      const response = await api.post<any>('/productions', snakeData);
      const production = extractData<Production>(response);
      return transformProductionToOrder(production);
    } catch (error: any) {
      console.error('Error creating production:', error?.message || error);
      throw error;
    }
  },

  // Actualizar producción
  async update(id: number, data: UpdateProductionDTO): Promise<ProductionOrder> {
    try {
      const snakeData = toSnakeCase(data);
      const response = await api.put<any>(`/productions/${id}`, snakeData);
      const production = extractData<Production>(response);
      return transformProductionToOrder(production);
    } catch (error: any) {
      // El error ya viene con el mensaje del servidor desde el interceptor de axios
      const errorMsg = error?.message || error?.response?.data?.message || 'Error al actualizar la producción';
      throw new Error(errorMsg);
    }
  },

  // Eliminar producción
  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/productions/${id}`);
    } catch (error: any) {
      console.error(`Error deleting production ${id}:`, error?.message || error);
      throw error;
    }
  },

  // Iniciar producción
  async start(id: number, data?: Record<string, any>): Promise<ProductionOrder> {
    return this.updateStatus(id, 'in_progress', data);
  },

  // Cambiar estado de producción (interno)
  async updateStatus(id: number, status: ProductionStatus, extra?: Record<string, any>): Promise<ProductionOrder> {
    return this.update(id, { status, ...extra } as UpdateProductionDTO);
  },

  // Pausar producción
  async pause(id: number, reason: string): Promise<ProductionOrder> {
    return this.updateStatus(id, 'paused', { pauseReason: reason });
  },

  // Reanudar producción
  async resume(id: number): Promise<ProductionOrder> {
    return this.updateStatus(id, 'in_progress');
  },

  // Completar producción
  async complete(id: number, goodParts: number, scrapParts: number = 0): Promise<ProductionOrder> {
    return this.update(id, {
      goodParts,
      scrapParts,
      status: 'completed',
      endTime: new Date().toISOString(),
    });
  },

  // Cancelar producción
  async cancel(id: number, reason?: string): Promise<ProductionOrder> {
    return this.update(id, {
      status: 'cancelled',
      endTime: new Date().toISOString(),
      notes: reason,
    });
  },

  // Registrar partes
  async registerParts(id: number, goodParts: number, scrapParts: number = 0): Promise<ProductionOrder> {
    return this.update(id, { goodParts, scrapParts });
  },

  // Obtener procesos disponibles (selectList)
  async getProcesses(): Promise<Process[]> {
    try {
      const response = await api.get<Process[]>('/processes/select-list');
      return extractDataArray<Process>(response);
    } catch (error: any) {
      console.warn('Error fetching processes:', error?.message || error);
      return [];
    }
  },

  // Obtener máquinas disponibles (selectList)
  async getMachines(): Promise<Machine[]> {
    try {
      const response = await api.get<Machine[]>('/machines/select-list');
      return extractDataArray<Machine>(response);
    } catch (error: any) {
      console.warn('Error fetching machines:', error?.message || error);
      return [];
    }
  },

  // Obtener operadores disponibles (selectList)
  async getOperators(): Promise<Operator[]> {
    try {
      const response = await api.get<Operator[]>('/operators/select-list');
      return extractDataArray<Operator>(response);
    } catch (error: any) {
      console.warn('Error fetching operators:', error?.message || error);
      return [];
    }
  },

  // Obtener productos disponibles (selectList)
  async getProducts(): Promise<Product[]> {
    try {
      const response = await api.get<any>('/products/select-list');
      return extractDataArray<Product>(response);
    } catch (error: any) {
      console.warn('Error fetching products:', error?.message || error);
      return [];
    }
  },

  // Filtrar por estado
  async getByStatus(status: ProductionStatus): Promise<ProductionOrder[]> {
    const productions = await this.getAll();
    return productions.filter((p) => p.status === status);
  },

  // Obtener producciones en curso
  async getInProgress(): Promise<ProductionOrder[]> {
    return this.getByStatus('in_progress');
  },

  // Obtener producciones pendientes
  async getPending(): Promise<ProductionOrder[]> {
    return this.getByStatus('pending');
  },

  // Obtener producciones completadas
  async getCompleted(): Promise<ProductionOrder[]> {
    return this.getByStatus('completed');
  },

  // Obtener work orders disponibles para vincular a producción (selectList)
  async getWorkOrders(): Promise<WorkOrder[]> {
    try {
      const response = await api.get<any>('/work-orders/select-list');
      return extractDataArray<WorkOrder>(response);
    } catch (error: any) {
      console.warn('Error fetching work orders:', error?.message || error);
      return [];
    }
  },

  // Obtener work order por ID
  async getWorkOrderById(id: number): Promise<WorkOrder | null> {
    try {
      const response = await api.get<any>(`/work-orders/${id}`);
      return extractData<WorkOrder>(response);
    } catch (error: any) {
      console.warn(`Error fetching work order ${id}:`, error?.message || error);
      return null;
    }
  },

  // Obtener productions de una work order
  async getProductionsByWorkOrder(workOrderId: number): Promise<ProductionOrder[]> {
    try {
      const response = await api.get<any>(`/work-orders/${workOrderId}/productions`);
      const productions = extractData<Production[]>(response);
      return productions.map(transformProductionToOrder);
    } catch (error: any) {
      console.warn(`Error fetching productions for work order ${workOrderId}:`, error?.message || error);
      return [];
    }
  },

  // Completar producción y transferir a inventario de producto terminado
  async completeToInventory(id: number): Promise<{ transferred_quantity: number; new_stock: number }> {
    try {
      const response = await api.post<any>(`/productions/${id}/complete-to-inventory`);
      return extractData<{ transferred_quantity: number; new_stock: number }>(response);
    } catch (error: any) {
      console.error(`Error completing production ${id} to inventory:`, error?.message || error);
      throw error;
    }
  },

  // ============================================================
  // Métodos de WorkOrderProcess (ahora en ProductionController)
  // ============================================================

  // Tipos para estados MES de proceso
  ProcessMesStatus: {
    PENDING: 'PENDING',
    READY: 'READY',
    RUNNING: 'RUNNING',
    PAUSED: 'PAUSED',
    COMPLETED: 'COMPLETED',
  } as const,

  // Obtener todos los procesos de orden de trabajo
  async getWorkOrderProcesses(params?: {
    work_order_id?: number;
    status?: string;
    is_rework_process?: boolean;
  }): Promise<any[]> {
    try {
      const response = await api.get('/work-order-processes', params);
      return extractData(response);
    } catch (error: any) {
      console.error('Error fetching work order processes:', error?.message || error);
      throw error;
    }
  },

  // Obtener un proceso por ID
  async getWorkOrderProcessById(id: number): Promise<any> {
    try {
      const response = await api.get(`/work-order-processes/${id}`);
      return extractData(response);
    } catch (error: any) {
      console.error('Error fetching work order process:', error?.message || error);
      throw error;
    }
  },

  // Crear un nuevo proceso
  async createWorkOrderProcess(data: {
    work_order_id: number;
    process_id: number;
    machine_id?: number;
    employee_id?: number;
    planned_quantity?: number;
    is_rework_process?: boolean;
  }): Promise<any> {
    try {
      const response = await api.post('/work-order-processes', data);
      return extractData(response);
    } catch (error: any) {
      console.error('Error creating work order process:', error?.message || error);
      throw error;
    }
  },

  // Actualizar un proceso
  async updateWorkOrderProcess(id: number, data: Partial<any>): Promise<any> {
    try {
      const response = await api.put(`/work-order-processes/${id}`, data);
      return extractData(response);
    } catch (error: any) {
      console.error('Error updating work order process:', error?.message || error);
      throw error;
    }
  },

  // Eliminar un proceso
  async deleteWorkOrderProcess(id: number): Promise<void> {
    try {
      await api.delete(`/work-order-processes/${id}`);
    } catch (error: any) {
      console.error('Error deleting work order process:', error?.message || error);
      throw error;
    }
  },

  // Iniciar un proceso (cambiar a RUNNING)
  async startWorkOrderProcess(id: number): Promise<any> {
    try {
      const response = await api.post(`/work-order-processes/${id}/start`, {});
      const data = extractData(response);
      return (data as any)?.data || data;
    } catch (error: any) {
      console.error('Error starting process:', error?.message || error);
      throw error;
    }
  },

  // Pausar un proceso
  async pauseWorkOrderProcess(id: number, reason?: string): Promise<any> {
    try {
      const response = await api.post(`/work-order-processes/${id}/pause`, { reason });
      const data = extractData(response);
      return (data as any)?.data || data;
    } catch (error: any) {
      console.error('Error pausing process:', error?.message || error);
      throw error;
    }
  },

  // Completar un proceso
  async completeWorkOrderProcess(id: number): Promise<any> {
    try {
      const response = await api.post(`/work-order-processes/${id}/complete`, {});
      return extractData(response);
    } catch (error: any) {
      console.error('Error completing process:', error?.message || error);
      throw error;
    }
  },

  // Obtener métricas de un proceso
  async getWorkOrderProcessMetrics(id: number): Promise<any> {
    try {
      const response = await api.get(`/work-order-processes/${id}/metrics`);
      return extractData(response);
    } catch (error: any) {
      console.error('Error fetching process metrics:', error?.message || error);
      throw error;
    }
  },

  // Inicializar el pipeline de producción
  async initializePipeline(workOrderId: number): Promise<any> {
    try {
      const response = await api.post(`/work-orders/${workOrderId}/initialize-pipeline`, {});
      return extractData(response);
    } catch (error: any) {
      console.error('Error initializing pipeline:', error?.message || error);
      throw error;
    }
  },

  // Obtener estado del pipeline
  async getPipelineStatus(workOrderId: number): Promise<any> {
    try {
      const response = await api.get(`/work-orders/${workOrderId}/pipeline-status`);
      return extractData(response);
    } catch (error: any) {
      console.error('Error fetching pipeline status:', error?.message || error);
      throw error;
    }
  }
};

export default productionService;
