import { BaseEntity } from './api.types';

// Filtros para reportes
export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  machine_id?: number;
  status?: string;
  product_id?: number;
  operator_id?: number;
  client_id?: number;
  type?: string;
  category?: string;
  low_stock?: boolean;
  role_id?: number;
}

// Dashboard
export interface DashboardProduction {
  total: number;
  scrap: number;
  efficiency: number;
}

export interface DashboardMachine {
  id: number;
  name: string;
  status: string;
  utilization: number;
  total_hours: number;
}

export interface DashboardWorkOrders {
  total: number;
  pending: number;
  completed: number;
  in_progress: number;
}

export interface DashboardEmployee {
  total: number;
  by_department: Record<string, number>;
}

export interface DashboardInventoryItem {
  id: number;
  name: string;
  code: string;
  currentStock: number;
  category: string;
  min_stock: number;
}

export interface DashboardInventory {
  total_items: number;
  low_stock: number;
  items: DashboardInventoryItem[];
}

export interface DashboardSales {
  total: number;
  revenue: number;
}

export interface DashboardPurchases {
  total: number;
  expense: number;
}

export interface DashboardFinance {
  income: number;
  expenses: number;
  balance: number;
}

export interface DashboardResponse {
  period: {
    start: string;
    end: string;
  };
  production: DashboardProduction;
  machines: DashboardMachine[];
  workOrders: DashboardWorkOrders;
  employees: DashboardEmployee;
  inventory: DashboardInventory;
  sales: DashboardSales;
  purchases: DashboardPurchases;
  finance: DashboardFinance;
}

// Reporte de Máquinas
export interface MachineReport {
  id: number;
  code: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  location: string;
  status: string;
  total_productions: number;
  total_parts: number;
  total_scrap: number;
  total_hours: number;
  total_movements: number;
  utilization: number;
}

// Reporte de Producción
export interface ProductionReport {
  id: number;
  code: string;
  product: string;
  process: string;
  operator: string;
  machine: string;
  work_order: string;
  target_parts: number;
  good_parts: number;
  scrap_parts: number;
  status: string;
  quality_status: string;
  start_time: string;
  end_time: string;
}

// Reporte de Ventas
export interface SaleReport {
  id: number;
  code: string;
  client: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  payment_type: string;
  created_at: string;
}

export interface SalesReportSummary {
  total_sales: number;
  total_revenue: number;
  pending: number;
  paid: number;
}

export interface SalesReportResponse {
  data: SaleReport[];
  summary: SalesReportSummary;
}

// Reporte de Inventario
export interface InventoryReportItem {
  id: number;
  code: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock: number;
  max_stock: number;
  unit_cost: number;
  total_value: number;
}

export interface InventoryReportSummary {
  total_items: number;
  total_value: number;
  low_stock_count: number;
}

export interface InventoryReportResponse {
  data: InventoryReportItem[];
  summary: InventoryReportSummary;
}

// Reporte Financiero
export interface FinanceReport {
  id: number;
  date: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  reference: string;
  status: string;
}

export interface FinanceReportSummary {
  total_income: number;
  total_expenses: number;
  balance: number;
}

export interface FinanceReportResponse {
  data: FinanceReport[];
  summary: FinanceReportSummary;
}
