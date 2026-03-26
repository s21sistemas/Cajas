"use client";

import { useState, useEffect } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  FileText,
  Download,
  TrendingUp,
  Factory,
  Users,
  Package,
  DollarSign,
  Calendar,
  Loader2,
} from "lucide-react";
import { reportsService } from "@/lib/services";

const COLORS = ["#4ade80", "#60a5fa", "#fbbf24", "#f87171", "#a78bfa"];

export default function ReportesPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    production: { 
      total?: number; 
      scrap?: number; 
      efficiency?: number; 
      change?: number; 
      efficiency_change?: number; 
      scrap_change?: number;
      daily?: { date: string; produced: number; target: number }[];
    };
    machines: { id: string | number; name: string; status: string; utilization: number }[];
    employees: { 
      total: number; 
      byDepartment?: Record<string, number>; 
      efficiency?: number; 
      attendance_rate?: number;
    };
    inventory: { id: string | number; name: string; currentStock: number; category: string }[];
    workOrders?: { total: number; pending: number; completed: number; in_progress: number };
    operators?: { total: number };
  } | null>(null);

  // Guardar datos originales del dashboard para las stats
  const [rawDashboardData, setRawDashboardData] = useState<any>(null);

  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Opciones dinámicas para filtros
  const [filterOptions, setFilterOptions] = useState<{
    machines: { id: number; name: string; status: string }[];
    products: { id: number; name: string }[];
    clients: { id: number; name: string }[];
    operators: { id: number; name: string }[];
    categories: { value: string; label: string }[];
  }>({
    machines: [],
    products: [],
    clients: [],
    operators: [],
    categories: [
      { value: 'materia_prima', label: 'Materia Prima' },
      { value: 'producto_term', label: 'Producto Terminado' },
      { value: 'embalaje', label: 'Embalaje' },
      { value: 'insumos', label: 'Insumos' },
    ],
  });

  // Función para calcular fechas según el período seleccionado
  const getDateRange = (period: string): { start: string; end: string } => {
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    let start: string;

    switch (period) {
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        start = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        start = monthStart.toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        start = quarterStart.toISOString().split('T')[0];
        break;
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        start = yearStart.toISOString().split('T')[0];
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    }

    return { start, end };
  };

  // Función para exportar reporte
  const handleExport = async () => {
    try {
      const { start, end } = getDateRange(selectedPeriod);
      const blob = await reportsService.downloadExecutivePDF({
        start_date: start,
        end_date: end,
      });
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-ejecutivo-${start}-al-${end}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      alert('Error al exportar el reporte');
    }
  };
  const [costTrendData, setCostTrendData] = useState<Array<Record<string, any>>>([]);
  const [costCategories, setCostCategories] = useState<string[]>([]);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    machine_id: '',
    status: '',
    product_id: '',
    operator_id: '',
    client_id: '',
    type: '',
    category: '',
    role_id: '',
    low_stock: '',
  });

  // Effect principal: carga datos del dashboard con filtros
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Calcular rango de fechas según el período seleccionado
        const { start, end } = getDateRange(selectedPeriod);
        
        // Construir filtros para la API - combinar período con filtros adicionales
        const apiFilters: any = {
          start_date: start,
          end_date: end,
        };
        
        // Agregar filtros adicionales solo si tienen valor
        if (filters.machine_id) apiFilters.machine_id = filters.machine_id;
        if (filters.product_id) apiFilters.product_id = filters.product_id;
        if (filters.operator_id) apiFilters.operator_id = filters.operator_id;
        if (filters.client_id) apiFilters.client_id = filters.client_id;
        if (filters.category) apiFilters.category = filters.category;
        if (filters.status) apiFilters.status = filters.status;
        if (filters.type) apiFilters.type = filters.type;
        if (filters.low_stock) apiFilters.low_stock = filters.low_stock;
        
        // Fetch dashboard data con todos los filtros
        const dashboard = await reportsService.getDashboard(apiFilters);
        console.log('primeros datos');
        console.log(dashboard.employees);
        setRawDashboardData(dashboard); // Guardar datos originales para stats
        setDashboardData({
          production: { 
            total: dashboard.production?.total || 0,
            scrap: dashboard.production?.scrap || 0,
            efficiency: dashboard.production?.efficiency || 0,
            change: dashboard.production?.change || 0,
            efficiency_change: dashboard.production?.efficiency_change || 0,
            scrap_change: dashboard.production?.scrap_change || 0,
            daily: dashboard.production?.daily || []
          },
          machines: dashboard.machines?.map((m: any) => ({
            id: m.id,
            name: m.name,
            status: m.status,
            utilization: m.utilization || 0
          })) || [],
          employees: { 
            total: dashboard.employees?.total || 0,
            byDepartment: dashboard.employees?.byDepartment || {},
            efficiency: dashboard.employees?.efficiency || 0,
            attendance_rate: dashboard.employees?.attendance_rate || 0
          },
          inventory: dashboard.inventory?.items ? dashboard.inventory.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            currentStock: item.currentStock || 0,
            category: item.category
          })) : []
        });

        // Fetch filter options
        try {
          const options = await reportsService.getOptions();
          setFilterOptions(options);
        } catch (e) {
          console.error('Error fetching filter options:', e);
        }

        // Fetch cost trend
        try {
          const trend = await reportsService.getCostTrend(6);
          setCostTrendData(trend);
          // Extraer categorías únicas de los datos
          if (trend.length > 0) {
            const allKeys = new Set<string>();
            trend.forEach(item => {
              Object.keys(item).forEach(key => {
                if (key !== 'month') {
                  allKeys.add(key);
                }
              });
            });
            setCostCategories(Array.from(allKeys));
          }
        } catch (e) {
          console.error('Error fetching cost trend:', e);
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [selectedPeriod, filters]);

  // Handler functions for report generation
  const openReportModal = (reportType: string) => {
    setSelectedReport(reportType);
    setModalOpen(true);
  };

  const handleGeneratePDF = async () => {
    if (!selectedReport) return;
    setGenerating(true);
    try {
      let blob: Blob | null = null;
      const filterParams = {
        start_date: filters.startDate,
        end_date: filters.endDate,
      };

      switch (selectedReport) {
        case 'machines':
          blob = await reportsService.downloadMachinesPDF({
            ...filterParams,
            machine_id: filters.machine_id ? Number(filters.machine_id) : undefined,
            status: filters.status || undefined,
          });
          break;
        case 'production':
          blob = await reportsService.downloadProductionPDF({
            ...filterParams,
            product_id: filters.product_id ? Number(filters.product_id) : undefined,
            operator_id: filters.operator_id ? Number(filters.operator_id) : undefined,
            status: filters.status || undefined,
          });
          break;
        case 'sales':
          blob = await reportsService.downloadSalesPDF({
            ...filterParams,
            client_id: filters.client_id ? Number(filters.client_id) : undefined,
            status: filters.status || undefined,
          });
          break;
        case 'inventory':
          blob = await reportsService.downloadInventoryPDF({
            category: filters.category || undefined,
            low_stock: filters.low_stock === 'true' ? true : filters.low_stock === 'false' ? false : undefined,
          });
          break;
        case 'finance':
          blob = await reportsService.downloadFinancePDF({
            ...filterParams,
            type: filters.type || undefined,
            category: filters.category || undefined,
          });
          break;
        case 'executive':
          blob = await reportsService.downloadExecutivePDF({
            ...filterParams,
            role_id: filters.role_id ? Number(filters.role_id) : undefined,
          });
          break;
      }

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-${selectedReport}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateExcel = async () => {
    if (!selectedReport) return;
    setGenerating(true);
    try {
      let blob: Blob | null = null;

      switch (selectedReport) {
        case 'machines':
          blob = await reportsService.downloadMachinesCSV({
            start_date: filters.startDate,
            end_date: filters.endDate,
            machine_id: filters.machine_id ? Number(filters.machine_id) : undefined,
            status: filters.status || undefined,
          });
          break;
        case 'production':
          blob = await reportsService.downloadProductionCSV({
            start_date: filters.startDate,
            end_date: filters.endDate,
            product_id: filters.product_id ? Number(filters.product_id) : undefined,
            operator_id: filters.operator_id ? Number(filters.operator_id) : undefined,
            status: filters.status || undefined,
          });
          break;
        case 'sales':
          blob = await reportsService.downloadSalesCSV({
            start_date: filters.startDate,
            end_date: filters.endDate,
            client_id: filters.client_id ? Number(filters.client_id) : undefined,
            status: filters.status || undefined,
          });
          break;
        case 'inventory':
          blob = await reportsService.downloadInventoryCSV({
            category: filters.category || undefined,
            low_stock: filters.low_stock === 'true' ? true : filters.low_stock === 'false' ? false : undefined,
          });
          break;
        case 'finance':
          blob = await reportsService.downloadFinanceCSV({
            start_date: filters.startDate,
            end_date: filters.endDate,
            type: filters.type || undefined,
            category: filters.category || undefined,
          });
          break;
        default:
          blob = await reportsService.downloadMachinesCSV({
            start_date: filters.startDate,
            end_date: filters.endDate,
          });
          break;
      }

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-${selectedReport}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error generating Excel:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !dashboardData) {
    return (
      <ERPLayout title="Reportes">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </ERPLayout>
    );
  }

  console.log(dashboardData);

  // Generate report data
  const productionEfficiency = (dashboardData.production.daily ?? []).map((p) => ({
    ...p,
    produced: p.produced || 0,
    target: p.target || 0,
    efficiency:
      p.target && p.produced
        ? Math.round((p.produced / p.target) * 100)
        : 0,
  }));

  const machineUtilization = dashboardData.machines.map((m) => ({
    name: m.name,
    utilization: m.utilization || 0,
  }));

  const machineStatusData = [
    {
      name: "Operativas",
      value: dashboardData.machines.filter((m) => m.status === "running").length,
    },
    {
      name: "Inactivas",
      value: dashboardData.machines.filter((m) => m.status === "idle").length,
    },
    {
      name: "Mantenimiento",
      value: dashboardData.machines.filter((m) => m.status === "maintenance").length,
    },
    {
      name: "Disponible",
      value: dashboardData.machines.filter((m) => m.status === "available").length,
    },
  ];

  const inventoryByCategory = Object.entries(
    dashboardData.inventory.reduce((acc, item) => {
      if (item.category && item.currentStock) {
        acc[item.category] = (acc[item.category] || 0) + Number(item.currentStock);
      }
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));
  console.log('empleados');
  console.log(dashboardData.employees);
  const employeeByDepartment = dashboardData.employees?.byDepartment 
    ? Object.entries(dashboardData.employees.byDepartment).map(([name, value]) => ({ name, value }))
    : [];


  console.log(employeeByDepartment);

  // Colores para categorías dinámicas
  const categoryColors: Record<string, string> = {
    materiales: '#4ade80',
    mano_obra: '#60a5fa',
    servicios: '#fbbf24',
    mantenimiento: '#f472b6',
    otros: '#a78bfa',
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || '#9ca3af';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      materiales: 'Materiales',
      mano_obra: 'Mano de Obra',
      servicios: 'Servicios',
      mantenimiento: 'Mantenimiento',
      otros: 'Otros',
    };
    return labels[category] || category;
  };

  const costTrend = costTrendData.length > 0 ? costTrendData : [];
  const displayCostTrend = costTrend.length > 0 ? costTrend : [
    { month: "Ene", materiales: 0, mano_obra: 0, servicios: 0 },
    { month: "Feb", materiales: 0, mano_obra: 0, servicios: 0 },
    { month: "Mar", materiales: 0, mano_obra: 0, servicios: 0 },
    { month: "Abr", materiales: 0, mano_obra: 0, servicios: 0 },
    { month: "May", materiales: 0, mano_obra: 0, servicios: 0 },
    { month: "Jun", materiales: 0, mano_obra: 0, servicios: 0 },
  ];

  return (
    <ERPLayout title="Reportes">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Reportes y Analisis
            </h1>
            <p className="text-muted-foreground">
              Informes de produccion, costos y rendimiento
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40 bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mes</SelectItem>
                <SelectItem value="quarter">Este Trimestre</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
              </SelectContent>
            </Select>
            {/* <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button> */}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Eficiencia Produccion
              </CardTitle>
              <Factory className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {rawDashboardData?.production?.efficiency?.toFixed(1) || 0}%
              </div>
              <p className="text-xs text-chart-1">
                {rawDashboardData?.production?.total || 0} unidades producidas
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Utilizacion Maquinas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {rawDashboardData?.machines?.length > 0 
                  ? (rawDashboardData.machines.reduce((acc: number, m: any) => acc + (m.utilization || 0), 0) / rawDashboardData.machines.length).toFixed(1) 
                  : 0}%
              </div>
              <p className="text-xs text-chart-1">
                {rawDashboardData?.machines?.length || 0} máquinas activas
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Costo por Unidad
              </CardTitle>
              <DollarSign className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ${rawDashboardData?.finance?.balance ? (rawDashboardData.finance.balance / (rawDashboardData.production?.total || 1)).toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-chart-1">
                Balance: ${rawDashboardData?.finance?.balance?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ordenes Completadas
              </CardTitle>
              <Package className="h-4 w-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {rawDashboardData?.workOrders?.completed || 0}
              </div>
              <p className="text-xs text-chart-1">
                {rawDashboardData?.workOrders?.total || 0} órdenes total
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="produccion" className="space-y-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="produccion">Produccion</TabsTrigger>
            <TabsTrigger value="maquinas">Maquinas</TabsTrigger>
            <TabsTrigger value="costos">Costos</TabsTrigger>
            <TabsTrigger value="rrhh">Personal</TabsTrigger>
            <TabsTrigger value="inventario">Inventario</TabsTrigger>
          </TabsList>

          <TabsContent value="produccion" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Produccion vs Objetivo
                  </CardTitle>
                  <CardDescription>
                    Comparativa mensual de produccion
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={productionEfficiency}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="label" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="produced" fill="#4ade80" name="Producido" />
                      <Bar dataKey="target" fill="#60a5fa" name="Objetivo" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Eficiencia por Periodo
                  </CardTitle>
                  <CardDescription>
                    Porcentaje de cumplimiento de objetivos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={productionEfficiency}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="label" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" domain={[0, 120]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="efficiency"
                        stroke="#4ade80"
                        strokeWidth={2}
                        dot={{ fill: "#4ade80" }}
                        name="Eficiencia %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maquinas" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Utilizacion por Maquina
                  </CardTitle>
                  <CardDescription>
                    Porcentaje de tiempo operativo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={machineUtilization} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                      <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="utilization" fill="#60a5fa" name="Utilizacion %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Estado de Maquinas
                  </CardTitle>
                  <CardDescription>
                    Distribucion por estado actual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={machineStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {machineStatusData.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="costos" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Tendencia de Costos
                </CardTitle>
                <CardDescription>
                  Desglose mensual por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={displayCostTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                    {costCategories.length > 0 ? (
                      costCategories.map((category, index) => (
                        <Area
                          key={category}
                          type="monotone"
                          dataKey={category}
                          stackId="1"
                          stroke={getCategoryColor(category)}
                          fill={getCategoryColor(category)}
                          fillOpacity={0.6}
                          name={getCategoryLabel(category)}
                        />
                      ))
                    ) : (
                      <>
                        <Area
                          type="monotone"
                          dataKey="materiales"
                          stackId="1"
                          stroke="#4ade80"
                          fill="#4ade80"
                          fillOpacity={0.6}
                          name="Materiales"
                        />
                        <Area
                          type="monotone"
                          dataKey="mano_obra"
                          stackId="1"
                          stroke="#60a5fa"
                          fill="#60a5fa"
                          fillOpacity={0.6}
                          name="Mano de Obra"
                        />
                        <Area
                          type="monotone"
                          dataKey="servicios"
                          stackId="1"
                          stroke="#fbbf24"
                          fill="#fbbf24"
                          fillOpacity={0.6}
                          name="Servicios"
                        />
                      </>
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rrhh" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Personal por Departamento
                  </CardTitle>
                  <CardDescription>
                    Distribucion de empleados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={employeeByDepartment}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {employeeByDepartment.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Metricas de Personal
                  </CardTitle>
                  <CardDescription>
                    Indicadores clave de RRHH
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="text-foreground">Total Empleados</span>
                    </div>
                    <span className="text-xl font-bold text-foreground">
                      {dashboardData.employees?.total || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-chart-1" />
                      <span className="text-foreground">Eficiencia Promedio</span>
                    </div>
                    <span className="text-xl font-bold text-chart-1">
                      {dashboardData.employees?.efficiency ?? dashboardData.production?.efficiency ?? 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-chart-2" />
                      <span className="text-foreground">Asistencia</span>
                    </div>
                    <span className="text-xl font-bold text-chart-2">
                      {dashboardData.employees?.attendance_rate ?? 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventario" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Stock por Categoria
                </CardTitle>
                <CardDescription>
                  Distribucion del inventario actual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryByCategory}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" fill="#4ade80" name="Unidades" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Report Templates */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              Plantillas de Reportes
            </CardTitle>
            <CardDescription>
              Genera reportes predefinidos en formato PDF o Excel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { name: "Reporte de Produccion", icon: Factory, desc: "Resumen de produccion mensual", type: "production" },
                { name: "Reporte de Inventario", icon: Package, desc: "Estado actual del almacen", type: "inventory" },
                { name: "Reporte de Personal", icon: Users, desc: "Metricas de recursos humanos", type: "hr" },
                { name: "Reporte de Costos", icon: DollarSign, desc: "Analisis de gastos y costos", type: "finance" },
                { name: "Reporte de Maquinas", icon: TrendingUp, desc: "Utilizacion y mantenimiento", type: "machines" },
                { name: "Reporte Ejecutivo", icon: FileText, desc: "Resumen general para gerencia", type: "executive" },
              ].map((report) => (
                <div
                  key={report.name}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => openReportModal(report.type)}
                >
                  <div className="flex items-center gap-3">
                    <report.icon className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{report.name}</p>
                      <p className="text-xs text-muted-foreground">{report.desc}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openReportModal(report.type); }}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generar Reporte</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Date Range - show for most reports */}
            {selectedReport && !['inventory'].includes(selectedReport) && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Fecha Inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">Fecha Fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Machine filter */}
            {selectedReport === 'machines' && (
              <div className="grid gap-2">
                <Label htmlFor="machine">Máquina</Label>
                <Select
                  value={filters.machine_id || 'all'}
                  onValueChange={(value) => setFilters({ ...filters, machine_id: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las máquinas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las máquinas</SelectItem>
                    {filterOptions.machines.map((machine) => (
                      <SelectItem key={machine.id} value={String(machine.id)}>
                        {machine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Production filters */}
            {selectedReport === 'production' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="product">Producto</Label>
                  <Select
                    value={filters.product_id || 'all'}
                    onValueChange={(value) => setFilters({ ...filters, product_id: value === 'all' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los productos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los productos</SelectItem>
                      {filterOptions.products.map((product) => (
                        <SelectItem key={product.id} value={String(product.id)}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="operator">Operador</Label>
                  <Select
                    value={filters.operator_id || 'all'}
                    onValueChange={(value) => setFilters({ ...filters, operator_id: value === 'all' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los operadores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los operadores</SelectItem>
                      {filterOptions.operators.map((operator) => (
                        <SelectItem key={operator.id} value={String(operator.id)}>
                          {operator.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Sales filters */}
            {selectedReport === 'sales' && (
              <div className="grid gap-2">
                <Label htmlFor="client">Cliente</Label>
                <Select
                  value={filters.client_id || 'all'}
                  onValueChange={(value) => setFilters({ ...filters, client_id: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los clientes</SelectItem>
                    {filterOptions.clients.map((client) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Inventory filters */}
            {selectedReport === 'inventory' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={filters.category || 'all'}
                    onValueChange={(value) => setFilters({ ...filters, category: value === 'all' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {filterOptions.categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lowStock">Solo Bajo Stock</Label>
                  <Select
                    value={filters.low_stock || 'all'}
                    onValueChange={(value) => setFilters({ ...filters, low_stock: value === 'all' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los items" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los items</SelectItem>
                      <SelectItem value="true">Solo bajo stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Status filter */}
            {selectedReport && ['machines', 'production', 'sales'].includes(selectedReport) && (
              <div className="grid gap-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Finance type filter */}
            {selectedReport === 'finance' && (
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo de Movimiento</Label>
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) => setFilters({ ...filters, type: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="income">Ingreso</SelectItem>
                    <SelectItem value="expense">Gasto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="text-sm text-muted-foreground mt-2">
              Seleccione los filtros deseados y elija el formato de exportación
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={handleGenerateExcel}
              disabled={generating}
              className="flex-1"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Excel (.csv)
            </Button>
            <Button
              onClick={handleGeneratePDF}
              disabled={generating}
              className="flex-1"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ERPLayout>
  );
}
