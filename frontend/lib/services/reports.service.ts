/**
 * Servicio de Reportes
 * Consume los endpoints de reportes del backend Laravel
 */
import { api } from '../api';
import {
  ReportFilters,
  DashboardResponse,
  MachineReport,
  ProductionReport,
  SalesReportResponse,
  InventoryReportResponse,
  FinanceReportResponse,
} from '../types';

function extractData<T>(response: any): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data;
  }
  return response;
}

function paramsToString(filters: ReportFilters): string {
  const params = new URLSearchParams();
  if (filters.start_date) params.set('start_date', filters.start_date);
  if (filters.end_date) params.set('end_date', filters.end_date);
  if (filters.machine_id) params.set('machine_id', String(filters.machine_id));
  if (filters.status) params.set('status', filters.status);
  if (filters.product_id) params.set('product_id', String(filters.product_id));
  if (filters.operator_id) params.set('operator_id', String(filters.operator_id));
  if (filters.client_id) params.set('client_id', String(filters.client_id));
  if (filters.type) params.set('type', filters.type);
  if (filters.category) params.set('category', filters.category);
  return params.toString();
}

export const reportsService = {
  /**
   * Obtener datos del dashboard
   */
  async getDashboard(filters?: ReportFilters): Promise<DashboardResponse> {
    const query = filters ? paramsToString(filters) : '';
    const response = await api.get<DashboardResponse>(`/reports/dashboard${query ? `?${query}` : ''}`);
    return extractData(response);
  },

  /**
   * Reporte de máquinas
   */
  async getMachines(filters?: ReportFilters): Promise<MachineReport[]> {
    const query = filters ? paramsToString(filters) : '';
    const response = await api.get<MachineReport[]>(`/reports/machines${query ? `?${query}` : ''}`);
    return extractData(response);
  },

  /**
   * Descargar reporte de máquinas en PDF
   */
  async downloadMachinesPDF(filters: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);
    if (filters.machine_id) params.set('machine_id', String(filters.machine_id));
    if (filters.status) params.set('status', filters.status);
    params.set('format', 'pdf');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/machines?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    return response.blob();
  },

  /**
   * Descargar reporte de máquinas en CSV
   */
  async downloadMachinesCSV(filters: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);
    if (filters.machine_id) params.set('machine_id', String(filters.machine_id));
    if (filters.status) params.set('status', filters.status);
    params.set('format', 'csv');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/machines?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    return response.blob();
  },

  /**
   * Reporte de producción
   */
  async getProduction(filters?: ReportFilters): Promise<ProductionReport[]> {
    const query = filters ? paramsToString(filters) : '';
    const response = await api.get<ProductionReport[]>(`/reports/production${query ? `?${query}` : ''}`);
    return extractData(response);
  },

  /**
   * Descargar reporte de producción en PDF
   */
  async downloadProductionPDF(filters: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);
    if (filters.product_id) params.set('product_id', String(filters.product_id));
    if (filters.operator_id) params.set('operator_id', String(filters.operator_id));
    if (filters.status) params.set('status', filters.status);
    params.set('format', 'pdf');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/production?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    return response.blob();
  },

  /**
   * Reporte de ventas
   */
  async getSales(filters?: ReportFilters): Promise<SalesReportResponse> {
    const query = filters ? paramsToString(filters) : '';
    const response = await api.get<SalesReportResponse>(`/reports/sales${query ? `?${query}` : ''}`);
    return extractData(response);
  },

  /**
   * Descargar reporte de ventas en PDF
   */
  async downloadSalesPDF(filters: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);
    if (filters.client_id) params.set('client_id', String(filters.client_id));
    if (filters.status) params.set('status', filters.status);
    params.set('format', 'pdf');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/sales?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    return response.blob();
  },

  /**
   * Reporte de inventario
   */
  async getInventory(filters?: ReportFilters): Promise<InventoryReportResponse> {
    const query = filters ? paramsToString(filters) : '';
    const response = await api.get<InventoryReportResponse>(`/reports/inventory${query ? `?${query}` : ''}`);
    return extractData(response);
  },

  /**
   * Descargar reporte de inventario en PDF
   */
  async downloadInventoryPDF(filters?: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.low_stock) params.set('low_stock', 'true');
    params.set('format', 'pdf');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/inventory?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    return response.blob();
  },

  /**
   * Reporte financiero
   */
  async getFinance(filters?: ReportFilters): Promise<FinanceReportResponse> {
    const query = filters ? paramsToString(filters) : '';
    const response = await api.get<FinanceReportResponse>(`/reports/finance${query ? `?${query}` : ''}`);
    return extractData(response);
  },

  /**
   * Descargar reporte financiero en PDF
   */
  async downloadFinancePDF(filters: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);
    if (filters.type) params.set('type', filters.type);
    if (filters.category) params.set('category', filters.category);
    params.set('format', 'pdf');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/finance?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    return response.blob();
  },

  /**
   * Opciones para filtros de reportes
   */
  async getOptions(): Promise<{
    machines: { id: number; name: string; status: string }[];
    products: { id: number; name: string }[];
    clients: { id: number; name: string }[];
    operators: { id: number; name: string }[];
    categories: { value: string; label: string }[];
  }> {
    const response = await api.get('/reports/options');
    return response;
  },

  /**
   * Tendencias de costos
   */
  async getCostTrend(months: number = 6): Promise<{
    month: string;
    materiales: number;
    manoObra: number;
    servicios: number;
  }[]> {
    const response = await api.get(`/reports/cost-trend?months=${months}`);
    return response;
  },

  /**
   * Descargar reporte de producción en CSV
   */
  async downloadProductionCSV(filters: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);
    if (filters.product_id) params.set('product_id', String(filters.product_id));
    if (filters.operator_id) params.set('operator_id', String(filters.operator_id));
    if (filters.status) params.set('status', filters.status);
    params.set('format', 'csv');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/production?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    return response.blob();
  },

  /**
   * Descargar reporte de ventas en CSV
   */
  async downloadSalesCSV(filters: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);
    if (filters.client_id) params.set('client_id', String(filters.client_id));
    if (filters.status) params.set('status', filters.status);
    params.set('format', 'csv');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/sales?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    return response.blob();
  },

  /**
   * Descargar reporte de inventario en CSV
   */
  async downloadInventoryCSV(filters: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.low_stock) params.set('low_stock', 'true');
    params.set('format', 'csv');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/inventory?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return response.blob();
  },

  /**
   * Descargar reporte financiero en CSV
   */
  async downloadFinanceCSV(filters: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);
    if (filters.type) params.set('type', filters.type);
    if (filters.category) params.set('category', filters.category);
    params.set('format', 'csv');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/finance?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    return response.blob();
  },

  /**
   * Descargar reporte ejecutivo en PDF
   */
  async downloadExecutivePDF(filters: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);
    if (filters.role_id) params.set('role_id', String(filters.role_id));
    params.set('format', 'pdf');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/executive?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    return response.blob();
  },
};
