"use client";

import { useState, useEffect } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wrench,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Timer,
  DollarSign,
} from "lucide-react";
import { serviceOrdersService, machinesService } from "@/lib/services";
import type { ServiceOrder, Machine } from "@/lib/types";

export default function ServiciosPage() {
  const [services, setServices] = useState<ServiceOrder[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [servResponse, machResponse] = await Promise.all([
          serviceOrdersService.getAll(),
          machinesService.getAll(),
        ]);
        
        const servData = (servResponse as { data: ServiceOrder[] }).data || servResponse;
        const machData = (machResponse as { data: Machine[] }).data || machResponse;
        
        setServices(Array.isArray(servData) ? servData : []);
        setMachines(Array.isArray(machData) ? machData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setServices([]);
        setMachines([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || service.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      pending: { variant: "secondary", label: "Pendiente" },
      assigned: { variant: "secondary", label: "Asignado" },
      in_progress: { variant: "default", label: "En Proceso" },
      completed: { variant: "default", label: "Completado" },
      cancelled: { variant: "destructive", label: "Cancelado" },
    };
    return styles[status] || { variant: "secondary", label: status };
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, { color: string; label: string }> = {
      repair: { color: "bg-destructive/20 text-destructive", label: "Reparación" },
      maintenance: { color: "bg-chart-1/20 text-chart-1", label: "Mantenimiento" },
      installation: { color: "bg-chart-2/20 text-chart-2", label: "Instalación" },
      consultation: { color: "bg-chart-3/20 text-chart-3", label: "Consultoría" },
    };
    return styles[type] || { color: "bg-secondary text-foreground", label: type };
  };

  const stats = {
    total: services.length,
    pending: services.filter((s) => s.status === "pending").length,
    inProgress: services.filter((s) => s.status === "in_progress").length,
    completed: services.filter((s) => s.status === "completed").length,
    totalCost: services.reduce((sum, s) => sum + (s.cost || 0), 0),
  };

  if (loading) {
    return (
      <ERPLayout title="Servicios" subtitle="Gestión de servicios y mantenimiento">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </ERPLayout>
    );
  }

  return (
    <ERPLayout title="Servicios" subtitle="Gestión de servicios y mantenimiento">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Servicios y Mantenimiento
            </h1>
            <p className="text-muted-foreground">
              Ordenes de servicio, mantenimiento preventivo y correctivo
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Orden
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nueva Orden de Servicio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Maquina</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar maquina" />
                    </SelectTrigger>
                    <SelectContent>
                      {machines.map((machine) => (
                        <SelectItem key={machine.id} value={String(machine.id)}>
                          {machine.name} - {machine.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Servicio</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventive">Preventivo</SelectItem>
                      <SelectItem value="corrective">Correctivo</SelectItem>
                      <SelectItem value="predictive">Predictivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prioridad</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Critica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Descripcion</Label>
                  <Textarea
                    placeholder="Describir el trabajo a realizar..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha Programada</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tiempo Estimado (hrs)</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tecnico Asignado</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tecnico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tec1">Juan Martinez</SelectItem>
                      <SelectItem value="tec2">Carlos Ramirez</SelectItem>
                      <SelectItem value="tec3">Miguel Lopez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Crear Orden de Servicio</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Ordenes
              </CardTitle>
              <Wrench className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.total}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendientes
              </CardTitle>
              <Clock className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-3">
                {stats.pending}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                En Proceso
              </CardTitle>
              <Timer className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">
                {stats.inProgress}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-1">
                {stats.completed}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Costo Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ${stats.totalCost.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="ordenes" className="space-y-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="ordenes">Ordenes de Servicio</TabsTrigger>
            <TabsTrigger value="calendario">Calendario</TabsTrigger>
          </TabsList>

          <TabsContent value="ordenes" className="space-y-4">
            {/* Filters */}
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar ordenes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-background border-border"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-48 bg-background border-border">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En Proceso</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Services Table */}
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-secondary/50">
                      <TableHead className="text-muted-foreground">
                        Orden
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Maquina
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Tipo
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Descripcion
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Fecha
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Tecnico
                      </TableHead>
                      <TableHead className="text-muted-foreground text-right">
                        Costo
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Estado
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service) => {
                      const statusBadge = getStatusBadge(service.status);
                      const typeBadge = getTypeBadge(service.type);
                      return (
                        <TableRow
                          key={service.id}
                          className="border-border hover:bg-secondary/50"
                        >
                          <TableCell className="font-mono text-xs text-foreground">
                            {service.id}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {service.code}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${typeBadge.color}`}
                            >
                              {typeBadge.label}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-foreground">
                            {service.description}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {new Date(service.scheduledDate || Date.now()).toLocaleDateString(
                              "es-MX"
                            )}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {service.assignedTo || "Sin asignar"}
                          </TableCell>
                          <TableCell className="text-right text-foreground">
                            ${(service.cost || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusBadge.variant}>
                              {statusBadge.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendario" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-5 w-5" />
                  Calendario de Mantenimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-7">
                  {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-medium text-muted-foreground py-2"
                      >
                        {day}
                      </div>
                    )
                  )}
                  {Array.from({ length: 35 }, (_, i) => {
                    const dayNum = i - 2;
                    const hasService = services.some((s) => {
                      if (!s.scheduledDate) return false;
                      const date = new Date(s.scheduledDate);
                      return date.getDate() === dayNum && date.getMonth() === 0;
                    });
                    return (
                      <div
                        key={i}
                        className={`p-2 min-h-[80px] rounded-lg border ${
                          dayNum > 0 && dayNum <= 31
                            ? "border-border bg-card"
                            : "border-transparent"
                        }`}
                      >
                        {dayNum > 0 && dayNum <= 31 && (
                          <>
                            <span className="text-sm text-foreground">
                              {dayNum}
                            </span>
                            {hasService && (
                              <div className="mt-1">
                                <div className="w-full h-1 bg-primary rounded" />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ERPLayout>
  );
}
