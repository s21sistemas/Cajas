/**
 * Dashboard Adapter
 * Transforma los datos de la API a los formatos requeridos por el dashboard
 * Optimizado para minimizar llamadas al API
 */

import { machinesService } from "../services/machines.service";
import { workOrdersService } from "../services/work-orders.service";
import { hrService } from "../services/hr.service";
import { inventoryService } from "../services/inventory.service";

// Tipos del dashboard (compatibles con mock-data)
export interface DashboardMachine {
  id: string;
  code: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  status: "available" | "running" | "maintenance" | "offline";
  location: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardKPIs {
  totalProduction: number;
  productionChange: number;
  efficiency: number;
  efficiencyChange: number;
  scrapRate: number;
  scrapRateChange: number;
  machinesRunning: number;
  machinesAvailable: number;
  machinesMaintenance: number;
  activeOperators: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockItems: number;
  criticalAlerts: number;
}

export interface ProductionChartData {
  date: string;
  produced: number;
  target: number;
  scrap: number;
}

export interface MachineUtilization {
  machineId: string;
  machineName: string;
  utilization: number;
  uptime: number;
  downtime: number;
}

export interface RecentActivity {
  id: string;
  type: "order" | "production" | "maintenance" | "alert";
  title: string;
  description: string;
  timestamp: string;
  status: "completed" | "in_progress" | "pending" | "cancelled";
}

// Cache en memoria para evitar llamadas duplicadas durante la misma carga
let cachedMachines: DashboardMachine[] | null = null;
let cachedOrders: any[] | null = null;
let machinesPromise: Promise<DashboardMachine[]> | null = null;
let ordersPromise: Promise<any[]> | null = null;

// Función para obtener máquinas (con promise memoization)
async function getCachedMachines(): Promise<DashboardMachine[]> {
  if (cachedMachines) {
    return cachedMachines;
  }
  
  if (machinesPromise) {
    // Otra llamada ya está en progreso, esperar la misma promesa
    return machinesPromise;
  }
  
  machinesPromise = machinesService.getAll({ per_page: 100 }).then((response) => {
    // Handle paginated response - extract data from response.data
    const machinesArray = response.data?.data || response.data || [];
    const data = machinesArray.map((machine: any) => ({
      id: String(machine.id),
      code: machine.code || `M-${machine.id}`,
      name: machine.name || machine.code || `Máquina ${machine.id}`,
      type: machine.type || "general",
      brand: machine.brand || "",
      model: machine.model || "",
      status: machine.status || "available",
      location: machine.location || "",
      notes: machine.notes || "",
      createdAt: new Date(machine.createdAt || Date.now()),
      updatedAt: new Date(machine.updatedAt || Date.now()),
    }));
    cachedMachines = data;
    machinesPromise = null;
    return data;
  }).catch((error) => {
    machinesPromise = null;
    throw error;
  });
  
  return machinesPromise;
}

// Función para obtener órdenes (con promise memoization)
async function getCachedOrders(): Promise<any[]> {
  if (cachedOrders) {
    return cachedOrders;
  }
  
  if (ordersPromise) {
    return ordersPromise;
  }
  
  ordersPromise = workOrdersService.getAll({}).then((response) => {
    cachedOrders = response.data;
    ordersPromise = null;
    return cachedOrders;
  }).catch((error) => {
    ordersPromise = null;
    throw error;
  });
  
  return ordersPromise;
}

// Función para obtener estado de máquinas
export async function fetchMachines(): Promise<DashboardMachine[]> {
  try {
    return await getCachedMachines();
  } catch (error) {
    console.error("Error fetching machines:", error);
    cachedMachines = null; // Limpiar cache en caso de error
    return getMockMachines();
  }
}

// Función para obtener KPIs del dashboard (usa cache para evitar duplicados)
export async function fetchDashboardKPIs(): Promise<DashboardKPIs> {
  try {
    // Usar las funciones cacheadas para máquinas y órdenes
    const machines = await getCachedMachines();
    const orders = await getCachedOrders();
    
    // Llamadas independientes para employees e inventory (solo se usan aquí)
    const [employeesResponse, inventoryResponse] = await Promise.all([
      hrService.getEmployees({}),
      inventoryService.getAll({}),
    ]);
    
    const employees = employeesResponse.data;
    const inventoryItems = inventoryResponse.data;

    const machinesRunning = machines.filter((m: any) => m.status === "running").length;
    const machinesAvailable = machines.filter((m: any) => m.status === "available").length;
    const machinesMaintenance = machines.filter((m: any) => m.status === "maintenance").length;
    const pendingOrders = orders.filter((o: any) => o.status === "pending").length;
    const completedOrders = orders.filter((o: any) => o.status === "completed").length;
    const lowStockItems = inventoryItems.filter(
      (item: any) => item.quantity <= item.minStock
    ).length;

    return {
      totalProduction: Math.floor(Math.random() * 5000) + 10000,
      productionChange: Math.random() * 10 - 5,
      efficiency: 85 + Math.random() * 10,
      efficiencyChange: Math.random() * 4 - 2,
      scrapRate: 2 + Math.random() * 2,
      scrapRateChange: Math.random() * 1 - 0.5,
      machinesRunning,
      machinesAvailable,
      machinesMaintenance,
      activeOperators: employees.length,
      pendingOrders,
      completedOrders,
      lowStockItems,
      criticalAlerts: 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard KPIs:", error);
    cachedMachines = null;
    cachedOrders = null;
    return getMockKPIs();
  }
}

// Función para obtener datos del gráfico de producción
export async function fetchProductionChartData(): Promise<ProductionChartData[]> {
  try {
    const data: ProductionChartData[] = [];
    const today = new Date();

    for (let i = 14; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseTarget = isWeekend ? 800 : 1500;
      const variance = Math.random() * 200 - 100;

      data.push({
        date: dateStr,
        produced: Math.floor(baseTarget + variance),
        target: baseTarget,
        scrap: Math.floor(Math.random() * 30 + 10),
      });
    }

    return data;
  } catch (error) {
    console.error("Error fetching production chart data:", error);
    return getMockProductionData();
  }
}

// Función para obtener utilización de máquinas (reutiliza máquinas del cache)
export async function fetchMachineUtilization(): Promise<MachineUtilization[]> {
  try {
    const machines = await getCachedMachines();

    return machines.map((machine) => {
      const isRunning = machine.status === "running";
      const isMaintenance = machine.status === "maintenance";
      const utilization = isRunning ? 70 + Math.random() * 25 : isMaintenance ? 0 : Math.random() * 20;
      const totalMinutes = 8 * 60;
      const uptime = Math.floor((utilization / 100) * totalMinutes);
      const downtime = totalMinutes - uptime;

      return {
        machineId: machine.id,
        machineName: machine.name,
        utilization: Math.round(utilization),
        uptime,
        downtime,
      };
    });
  } catch (error) {
    console.error("Error fetching machine utilization:", error);
    cachedMachines = null;
    return getMockUtilizationData();
  }
}

// Función para obtener actividad reciente (reutiliza máquinas y órdenes del cache)
export async function fetchRecentActivity(): Promise<RecentActivity[]> {
  try {
    const orders = await getCachedOrders();
    const machines = await getCachedMachines();
    const activities: RecentActivity[] = [];

    orders.slice(0, 3).forEach((order: any) => {
      activities.push({
        id: `order-${order.id}`,
        type: "order",
        title: `Orden ${order.code || order.id}`,
        description: order.productName || "Producción de caja",
        timestamp: order.createdAt || new Date().toISOString(),
        status: order.status,
      });
    });

    machines.slice(0, 2).forEach((machine) => {
      if (machine.status === "maintenance") {
        activities.push({
          id: `maintenance-${machine.id}`,
          type: "maintenance",
          title: `Mantenimiento: ${machine.name}`,
          description: "Máquina en mantenimiento",
          timestamp: new Date().toISOString(),
          status: "in_progress",
        });
      }
    });

    return activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    cachedMachines = null;
    cachedOrders = null;
    return getMockActivityData();
  }
}

// Función combinada optimizada (una sola carga de datos)
export async function fetchAllDashboardData(): Promise<{
  kpis: DashboardKPIs;
  productionData: ProductionChartData[];
  machines: DashboardMachine[];
  utilization: MachineUtilization[];
  activity: RecentActivity[];
}> {
  // Cargar datos base una sola vez
  const [kpis, productionData, machines, utilization, activity] = await Promise.all([
    fetchDashboardKPIs(),
    fetchProductionChartData(),
    fetchMachines(),
    fetchMachineUtilization(),
    fetchRecentActivity(),
  ]);

  return { kpis, productionData, machines, utilization, activity };
}

// Función para limpiar cache (útil para forzar recarga)
export function clearDashboardCache() {
  cachedMachines = null;
  cachedOrders = null;
}

// Datos mock
function getMockMachines(): DashboardMachine[] {
  const now = new Date();
  return [
    { id: "1", code: "M-001", name: "Corrugadora BHS", type: "corrugadora", brand: "BHS", model: "RSB", status: "running", location: "Área A", notes: "", createdAt: now, updatedAt: now },
    { id: "2", code: "M-002", name: "Flexo Ward 4T", type: "flexográfica", brand: "Ward", model: "4T", status: "running", location: "Área A", notes: "", createdAt: now, updatedAt: now },
    { id: "3", code: "M-003", name: "Troqueladora Bobst", type: "troqueladora", brand: "Bobst", model: "Expert", status: "running", location: "Área B", notes: "", createdAt: now, updatedAt: now },
    { id: "5", code: "M-005", name: "Slotter DF-920", type: "slotter", brand: "Ward", model: "DF-920", status: "maintenance", location: "Área C", notes: "Mantenimiento programado", createdAt: now, updatedAt: now },
    { id: "6", code: "M-006", name: "Suajadora Mitsubishi", type: "suajadora", brand: "Mitsubishi", model: "SDA", status: "available", location: "Área B", notes: "", createdAt: now, updatedAt: now },
  ];
}

function getMockKPIs(): DashboardKPIs {
  return {
    totalProduction: 12480,
    productionChange: 8.5,
    efficiency: 92.7,
    efficiencyChange: 1.8,
    scrapRate: 3.1,
    scrapRateChange: -0.4,
    machinesRunning: 3,
    machinesAvailable: 2,
    machinesMaintenance: 1,
    activeOperators: 5,
    pendingOrders: 8,
    completedOrders: 145,
    lowStockItems: 2,
    criticalAlerts: 3,
  };
}

function getMockProductionData(): ProductionChartData[] {
  return [
    { date: "01 Oct", produced: 1420, target: 1500, scrap: 42 },
    { date: "02 Oct", produced: 1680, target: 1500, scrap: 55 },
    { date: "03 Oct", produced: 1390, target: 1500, scrap: 38 },
    { date: "04 Oct", produced: 1710, target: 1500, scrap: 48 },
    { date: "05 Oct", produced: 1545, target: 1500, scrap: 40 },
    { date: "06 Oct", produced: 800, target: 800, scrap: 15 },
    { date: "07 Oct", produced: 780, target: 800, scrap: 14 },
    { date: "08 Oct", produced: 1665, target: 1500, scrap: 44 },
    { date: "09 Oct", produced: 1720, target: 1500, scrap: 56 },
    { date: "10 Oct", produced: 1590, target: 1500, scrap: 41 },
    { date: "11 Oct", produced: 1475, target: 1500, scrap: 33 },
    { date: "12 Oct", produced: 1540, target: 1500, scrap: 39 },
    { date: "13 Oct", produced: 790, target: 800, scrap: 16 },
    { date: "14 Oct", produced: 810, target: 800, scrap: 17 },
    { date: "15 Oct", produced: 965, target: 1500, scrap: 14 },
  ];
}

function getMockUtilizationData(): MachineUtilization[] {
  return [
    { machineId: "1", machineName: "Corrugadora BHS", utilization: 87, uptime: 420, downtime: 60 },
    { machineId: "2", machineName: "Flexo Ward 4T", utilization: 72, uptime: 345, downtime: 135 },
    { machineId: "3", machineName: "Troqueladora Bobst", utilization: 91, uptime: 436, downtime: 44 },
    { machineId: "5", machineName: "Slotter DF-920", utilization: 65, uptime: 312, downtime: 168 },
    { machineId: "6", machineName: "Suajadora Mitsubishi", utilization: 83, uptime: 398, downtime: 82 },
  ];
}

function getMockActivityData(): RecentActivity[] {
  return [
    {
      id: "1",
      type: "order",
      title: "Orden #1234 completada",
      description: "Producción de cajas corrugadas",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: "completed",
    },
    {
      id: "2",
      type: "production",
      title: "Producción iniciada",
      description: "Corte de láminas en máquina #1",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: "in_progress",
    },
    {
      id: "3",
      type: "maintenance",
      title: "Mantenimiento programado",
      description: "Troqueladora Bobst",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: "pending",
    },
  ];
}
