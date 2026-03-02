/**
 * Servicio de Reportes
 * Consume los endpoints de reportes del backend Laravel
 */
import { apiClient } from "../api";

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export const reportsService = {
  /**
   * Generar reporte de máquinas
   */
  async getMachinesReport(filters: ReportFilters & { format?: string }) {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('start_date', filters.startDate);
    if (filters.endDate) params.set('end_date', filters.endDate);
    if (filters.machine_id) params.set('machine_id', filters.machine_id);
    if (filters.status) params.set('status', filters.status);
    if (filters.format) params.set('format', filters.format);

    const query = params.toString();
    return apiClient.get(`/reports/machines${query ? `?${query}` : ''}`);
  },

  /**
   * Descargar reporte de máquinas en PDF
   */
  async downloadMachinesPDF(filters: ReportFilters) {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('start_date', filters.startDate);
    if (filters.endDate) params.set('end_date', filters.endDate);
    if (filters.machine_id) params.set('machine_id', filters.machine_id);
    if (filters.status) params.set('status', filters.status);
    params.set('format', 'pdf');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/machines?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.blob();
  },

  /**
   * Descargar reporte de máquinas en CSV/Excel
   */
  async downloadMachinesCSV(filters: ReportFilters) {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('start_date', filters.startDate);
    if (filters.endDate) params.set('end_date', filters.endDate);
    if (filters.machine_id) params.set('machine_id', filters.machine_id);
    if (filters.status) params.set('status', filters.status);
    params.set('format', 'csv');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/machines?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.blob();
  },

  /**
   * Generar reporte de producción
   */
  async getProductionReport(filters: ReportFilters & { format?: string }) {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('start_date', filters.startDate);
    if (filters.endDate) params.set('end_date', filters.endDate);
    if (filters.product_id) params.set('product_id', filters.product_id);
    if (filters.operator_id) params.set('operator_id', filters.operator_id);
    if (filters.status) params.set('status', filters.status);
    if (filters.format) params.set('format', filters.format);

    const query = params.toString();
    return apiClient.get(`/reports/production${query ? `?${query}` : ''}`);
  },

  /**
   * Descargar reporte de producción en PDF
   */
  async downloadProductionPDF(filters: ReportFilters) {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('start_date', filters.startDate);
    if (filters.endDate) params.set('end_date', filters.endDate);
    if (filters.product_id) params.set('product_id', filters.product_id);
    if (filters.operator_id) params.set('operator_id', filters.operator_id);
    if (filters.status) params.set('status', filters.status);
    params.set('format', 'pdf');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/production?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.blob();
  },

  /**
   * Generar reporte de ventas
   */
  async getSalesReport(filters: ReportFilters & { format?: string }) {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('start_date', filters.startDate);
    if (filters.endDate) params.set('end_date', filters.endDate);
    if (filters.client_id) params.set('client_id', filters.client_id);
    if (filters.status) params.set('status', filters.status);
    if (filters.format) params.set('format', filters.format);

    const query = params.toString();
    return apiClient.get(`/reports/sales${query ? `?${query}` : ''}`);
  },

  /**
   * Descargar reporte de ventas en PDF
   */
  async downloadSalesPDF(filters: ReportFilters) {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('start_date', filters.startDate);
    if (filters.endDate) params.set('end_date', filters.endDate);
    if (filters.client_id) params.set('client_id', filters.client_id);
    if (filters.status) params.set('status', filters.status);
    params.set('format', 'pdf');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/sales?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.blob();
  },

  /**
   * Generar reporte de inventario
   */
  async getInventoryReport(filters: ReportFilters & { format?: string }) {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.low_stock) params.set('low_stock', filters.low_stock);
    if (filters.format) params.set('format', filters.format);

    const query = params.toString();
    return apiClient.get(`/reports/inventory${query ? `?${query}` : ''}`);
  },

  /**
   * Descargar reporte de inventario en PDF
   */
  async downloadInventoryPDF(filters: ReportFilters) {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.low_stock) params.set('low_stock', filters.low_stock);
    params.set('format', 'pdf');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/inventory?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.blob();
  },

  /**
   * Generar reporte financiero
   */
  async getFinanceReport(filters: ReportFilters & { format?: string }) {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('start_date', filters.startDate);
    if (filters.endDate) params.set('end_date', filters.endDate);
    if (filters.type) params.set('type', filters.type);
    if (filters.category) params.set('category', filters.category);
    if (filters.format) params.set('format', filters.format);

    const query = params.toString();
    return apiClient.get(`/reports/finance${query ? `?${query}` : ''}`);
  },

  /**
   * Descargar reporte financiero en PDF
   */
  async downloadFinancePDF(filters: ReportFilters) {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('start_date', filters.startDate);
    if (filters.endDate) params.set('end_date', filters.endDate);
    if (filters.type) params.set('type', filters.type);
    if (filters.category) params.set('category', filters.category);
    params.set('format', 'pdf');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/finance?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.blob();
  },

  /**
   * Obtener datos del dashboard
   */
  async getDashboard(filters?: ReportFilters) {
    const params = new URLSearchParams();
    if (filters?.startDate) params.set('start_date', filters.startDate);
    if (filters?.endDate) params.set('end_date', filters.endDate);
    const query = params.toString();
    return apiClient.get(`/reports/dashboard${query ? `?${query}` : ''}`);
  },
};
