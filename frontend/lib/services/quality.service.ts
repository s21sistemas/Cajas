import { api } from '../api';

// Tipos para evaluaciones de calidad
export interface QualityEvaluation {
  id: number;
  production_id: number;
  work_order_process_id: number;
  quantity_evaluated: number;
  decision: 'APPROVED' | 'SCRAP' | 'REWORK' | null;
  quantity_approved: number;
  quantity_scrap: number;
  quantity_rework: number;
  observations: string | null;
  evaluator_id: number | null;
  evaluated_at: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  evaluator?: {
    id: number;
    name: string;
  };
  work_order_process?: {
    id: number;
    process?: {
      id: number;
      name: string;
    };
  };
  production?: {
    id: number;
    code: string;
    good_parts: number;
    scrap_parts: number;
  };
}

export interface QualityEvaluationRequest {
  production_id: number;
  work_order_process_id: number;
  quantity_evaluated: number;
  decision: 'APPROVED' | 'SCRAP' | 'REWORK';
  quantity_approved?: number;
  quantity_scrap?: number;
  quantity_rework?: number;
  observations?: string;
}

export interface QualityMetrics {
  total_evaluated: number;
  total_approved: number;
  total_scrap: number;
  total_rework: number;
  approved_count: number;
  scrap_count: number;
  rework_count: number;
}

export interface QualityDashboard {
  pending_count: number;
  approved_today: number;
  scrap_today: number;
  rework_today: number;
  yield_today: number;
}

// Transformación de respuesta API
function extractData<T>(response: any): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data;
  }
  return response;
}

export const qualityService = {
  /**
   * Obtener producciones pendientes de evaluación de calidad
   */
  async getPendingEvaluations(params?: {
    work_order_id?: number;
    work_order_process_id?: number;
  }): Promise<any> {
    try {
      const response = await api.get('/quality/pending', params);
      return extractData(response);
    } catch (error: any) {
      console.error('Error fetching pending evaluations:', error?.message || error);
      throw error;
    }
  },

  /**
   * Obtener evaluaciones de calidad por producción
   */
  async getByProduction(productionId: number): Promise<QualityEvaluation[]> {
    try {
      const response = await api.get(`/quality/production/${productionId}`);
      return extractData(response);
    } catch (error: any) {
      console.error('Error fetching quality evaluations:', error?.message || error);
      throw error;
    }
  },

  /**
   * Obtener evaluaciones por proceso
   */
  async getByProcess(processId: number): Promise<{
    process: any;
    evaluations: QualityEvaluation[];
    summary: QualityMetrics;
  }> {
    try {
      const response = await api.get(`/quality/process/${processId}`);
      return extractData(response);
    } catch (error: any) {
      console.error('Error fetching process evaluations:', error?.message || error);
      throw error;
    }
  },

  /**
   * Obtener historial de movimientos de trazabilidad
   */
  async getMovements(params?: {
    work_order_id?: number;
    work_order_process_id?: number;
    movement_type?: string;
  }): Promise<any[]> {
    try {
      const response = await api.get('/quality/movements', params);
      return extractData(response);
    } catch (error: any) {
      console.error('Error fetching movements:', error?.message || error);
      throw error;
    }
  },

  /**
   * Obtener dashboard de calidad
   */
  async getDashboard(): Promise<QualityDashboard> {
    try {
      const response = await api.get('/quality/dashboard');
      return extractData(response);
    } catch (error: any) {
      console.error('Error fetching quality dashboard:', error?.message || error);
      throw error;
    }
  },

  /**
   * Crear evaluación de calidad
   */
  async evaluate(data: QualityEvaluationRequest): Promise<{
    evaluation: QualityEvaluation;
    process_metrics: any;
  }> {
    try {
      const response = await api.post('/quality', data);
      return extractData(response);
    } catch (error: any) {
      console.error('Error creating quality evaluation:', error?.message || error);
      throw error;
    }
  },

  /**
   * Obtener todas las evaluaciones (para admins)
   */
  async getAll(params?: {
    page?: number;
    per_page?: number;
    decision?: string;
  }): Promise<any> {
    try {
      const response = await api.get('/quality', params);
      return extractData(response);
    } catch (error: any) {
      console.error('Error fetching all evaluations:', error?.message || error);
      throw error;
    }
  },
};

// Labels para decisiones de calidad
export const QUALITY_DECISIONS = {
  APPROVED: { label: 'Aprobado', color: 'bg-green-500', text: 'text-green-500' },
  SCRAP: { label: 'Scrap', color: 'bg-red-500', text: 'text-red-500' },
  REWORK: { label: 'Reproceso', color: 'bg-yellow-500', text: 'text-yellow-500' },
} as const;
