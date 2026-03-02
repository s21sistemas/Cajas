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
import { api } from "@/lib/mock-data";
import { reportsService } from "@/lib/services";

const COLORS = ["#4ade80", "#60a5fa", "#fbbf24", "#f87171", "#a78bfa"];

export default function ReportesPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    production: { label: string; produced: number; target: number }[];
    machines: { id: string; name: string; status: string; utilization: number }[];
    employees: { id: string; name: string; department: string; efficiency?: number }[];
    inventory: { id: string; name: string; currentStock: number; category: string }[];
  } | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState("month");

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
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [production, machines, employees, inventory] = await Promise.all([
        api.getProductionData(),
        api.getMachines(),
        api.getEmployees(),
        api.getInventory(),
      ]);
      setDashboardData({
        production,
        machines,
        employees,
        inventory,
      });
      setLoading(false);
    };
    fetchData();
  }, []);

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
        startDate: filters.startDate,
        endDate: filters.endDate,
      };

      switch (selectedReport) {
        case 'machines':
          blob = await reportsService.downloadMachinesPDF({
            ...filterParams,
            machine_id: filters.machine_id || undefined,
            status: filters.status || undefined,
          });
          break;
        case 'production':
          blob = await reportsService.downloadProductionPDF({
            ...filterParams,
            product_id: filters.product_id || undefined,
            operator_id: filters.operator_id || undefined,
            status: filters.status || undefined,
          });
          break;
        case 'sales':
          blob = await reportsService.downloadSalesPDF({
            ...filterParams,
            client_id: filters.client_id || undefined,
            status: filters.status || undefined,
          });
          break;
        case 'inventory':
          blob = await reportsService.downloadInventoryPDF({
            category: filters.category || undefined,
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
          // Get executive report as JSON and show in new window
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/executive?start_date=${filters.startDate}&end_date=${filters.endDate}&format=pdf`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          blob = await response.blob();
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
            startDate: filters.startDate,
            endDate: filters.endDate,
            machine_id: filters.machine_id || undefined,
            status: filters.status || undefined,
          });
          break;
        // Add other report types as needed
        default:
          // For other reports, download as PDF and rename to .xlsx (not ideal but works)
          blob = await reportsService.downloadMachinesPDF({
            startDate: filters.startDate,
            endDate: filters.endDate,
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

  // Generate report data
  const productionEfficiency = dashboardData.production.map((p) => ({
    ...p,
    efficiency: Math.round((p.produced / p.target) * 100),
  }));

  const machineUtilization = dashboardData.machines.map((m) => ({
    name: m.name,
    utilization: m.utilization,
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
  ];

  const inventoryByCategory = Object.entries(
    dashboardData.inventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.currentStock;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const employeeByDepartment = Object.entries(
    dashboardData.employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const costTrend = [
    { month: "Ene", materiales: 45000, manoObra: 32000, servicios: 8000 },
    { month: "Feb", materiales: 48000, manoObra: 33000, servicios: 7500 },
    { month: "Mar", materiales: 42000, manoObra: 31000, servicios: 9000 },
    { month: "Abr", materiales: 51000, manoObra: 34000, servicios: 8500 },
    { month: "May", materiales: 47000, manoObra: 32500, servicios: 7800 },
    { month: "Jun", materiales: 53000, manoObra: 35000, servicios: 9200 },
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
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
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
              <div className="text-2xl font-bold text-foreground">94.2%</div>
              <p className="text-xs text-chart-1">+2.1% vs mes anterior</p>
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
              <div className="text-2xl font-bold text-foreground">87.5%</div>
              <p className="text-xs text-chart-1">+5.3% vs mes anterior</p>
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
              <div className="text-2xl font-bold text-foreground">$12.45</div>
              <p className="text-xs text-destructive">+$0.32 vs mes anterior</p>
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
              <div className="text-2xl font-bold text-foreground">847</div>
              <p className="text-xs text-chart-1">+12% vs mes anterior</p>
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
                  <AreaChart data={costTrend}>
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
                      dataKey="manoObra"
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
                      {dashboardData.employees.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-chart-1" />
                      <span className="text-foreground">Eficiencia Promedio</span>
                    </div>
                    <span className="text-xl font-bold text-chart-1">92%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-chart-2" />
                      <span className="text-foreground">Asistencia</span>
                    </div>
                    <span className="text-xl font-bold text-chart-2">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-chart-3" />
                      <span className="text-foreground">Capacitaciones</span>
                    </div>
                    <span className="text-xl font-bold text-chart-3">24</span>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
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
                    <SelectItem value="1">Máquina 1</SelectItem>
                    <SelectItem value="2">Máquina 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
