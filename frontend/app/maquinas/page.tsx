"use client";

import { useEffect, useState, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import {
  Plus,
  Search,
  Cog,
  Settings,
  Wrench,
  Power,
  Filter,
  Play,
  Square,
  Clock,
  Loader2,
  Gauge,
  Trash2,
  Eye,
  PowerOff,
  MapPin,
  Tag,
} from "lucide-react";
import { machinesService, settingsService } from "@/lib/services";
import type { Machine, CreateMachineDto } from "@/lib/types/machine.types";
import { cn } from "@/lib/utils";
import { z } from "zod";

// Schema de validación con Zod
const machineSchema = z.object({
  code: z.string().min(1, "El código es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  type: z.string().min(1, "El tipo es requerido"),
  brand: z.string().optional(),
  model: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  axes: z.string()
    .optional()
    .refine((val) => !val || !isNaN(parseInt(val)), {
      message: "Debe ser un número válido",
    }),
});

type MachineFormData = z.infer<typeof machineSchema>;

type MachineStatus = "running" | "available" | "maintenance" | "offline";

const statusConfig: Record<MachineStatus, { label: string; dotClass: string; badgeClass: string }> = {
  running: {
    label: "En Operacion",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  available: {
    label: "Disponible",
    dotClass: "bg-blue-500",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  maintenance: {
    label: "Mantenimiento",
    dotClass: "bg-amber-500",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  offline: {
    label: "Apagada",
    dotClass: "bg-gray-400",
    badgeClass: "bg-gray-50 text-gray-600 border-gray-200",
  },
};

interface MachineStats {
  total: number;
  running: number;
  available: number;
  maintenance: number;
  offline: number;
  averageUtilization: number;
}

export default function MaquinasPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState<MachineStats>({
    total: 0,
    running: 0,
    available: 0,
    maintenance: 0,
    offline: 0,
    averageUtilization: 0,
  });

  const [newMachineOpen, setNewMachineOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [machinesDeletePin, setMachinesDeletePin] = useState<string | null>(null);

  const [newForm, setNewForm] = useState({ code: "", name: "", type: "", brand: "", model: "", location: "", notes: "", axes: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [configForm, setConfigForm] = useState({ name: "", type: "", brand: "", model: "", location: "", notes: "" });
  const [maintenanceForm, setMaintenanceForm] = useState({ type: "preventive", notes: "", scheduledDate: "" });

  // Refs for search debounce
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load settings for PIN
  const loadSettings = async () => {
    try {
      console.log("[Settings] Loading production settings...");
      const response = await settingsService.getByModule("production") as any;
      console.log("[Settings] Raw response:", response);
      
      if (response && response.settings) {
        const pinValue = response.settings.machinesDeletePin;
        console.log("[Settings] PIN value from settings:", pinValue);
        setMachinesDeletePin(pinValue || null);
        console.log("[Settings] State updated to:", pinValue || null);
      } else {
        console.log("[Settings] No settings found, setting PIN to null");
        setMachinesDeletePin(null);
      }
    } catch (error) {
      console.error("[Settings] Error loading settings:", error);
      setMachinesDeletePin(null);
    }
  };

  // Fetch machines
  const fetchMachines = async (search: string = "") => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      
      const response = await machinesService.getAll(params);
      // Handle paginated response - Laravel returns {data: [...], currentPage: 1, ...}
      // After interceptor transforms: {data: [...], currentPage: 1, ...}
      const data = (response as any).data || [];
      setMachines(data);
    } catch (error: any) {
      showToast("error", "Error", error?.message || "Error al cargar máquinas");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await machinesService.getStats();
      // Backend returns {success: true, data: {...}, message: "...", errors: null}
      const statsData = (response as any).data || response;
      setStats(statsData);
    } catch (error: any) {
      console.error("Error loading stats:", error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMachines();
    fetchStats();
    loadSettings();
  }, []);

  // Search debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchMachines(searchTerm);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, statusFilter]);

  const filteredMachines = machines;

  const counts = {
    running: stats.running,
    available: stats.available,
    maintenance: stats.maintenance,
    offline: stats.offline,
  };

  const handleCreate = async () => {
    // Validar con Zod
    try {
      machineSchema.parse(newForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!fieldErrors[field]) {
            fieldErrors[field] = err.message;
          }
        });
        setFormErrors(fieldErrors);
        const firstError = Object.values(fieldErrors)[0];
        showToast("warning", "Error de validación", firstError);
        return;
      }
    }
    
    setFormErrors({});
    setActionLoading(-1);
    try {
      const data: CreateMachineDto = {
        code: newForm.code,
        name: newForm.name,
        type: newForm.type,
        brand: newForm.brand || undefined,
        model: newForm.model || undefined,
        location: newForm.location || undefined,
        notes: newForm.notes || undefined,
        axes: newForm.axes ? parseInt(newForm.axes) : undefined,
      };
      await machinesService.create(data);
      showToast("success", "Máquina registrada", `${newForm.code} - ${newForm.name}`);
      setNewMachineOpen(false);
      setNewForm({ code: "", name: "", type: "", brand: "", model: "", location: "", notes: "", axes: "" });
      fetchMachines(searchTerm);
      fetchStats();
    } catch (error: any) {
      // Manejar errores de validación del servidor
      const serverErrors = error?.errors;
      const errorStatus = error?.status;
      
      if (errorStatus === 422 && serverErrors && typeof serverErrors === 'object') {
        const fieldErrors: Record<string, string> = {};
        Object.keys(serverErrors).forEach((key) => {
          fieldErrors[key] = serverErrors[key][0];
        });
        setFormErrors(fieldErrors);
        showToast("warning", "Error de validación", Object.values(fieldErrors)[0]);
      } else {
        showToast("error", "Error", error?.message || "No se pudo crear la máquina");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePower = async (m: Machine) => {
    setActionLoading(m.id);
    try {
      const newStatus = m.status === "offline" ? "available" : "offline";
      await machinesService.updateStatus(m.id, newStatus);
      showToast("success", newStatus === "offline" ? "Máquina apagada" : "Máquina encendida", m.code);
      fetchMachines(searchTerm);
      fetchStats();
    } catch (error: any) {
      showToast("error", "Error", error?.message || "Error al cambiar estado");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartOp = async (m: Machine) => {
    setActionLoading(m.id);
    try {
      await machinesService.startOperation(m.id);
      showToast("success", "Operación iniciada", m.code);
      fetchMachines(searchTerm);
      fetchStats();
    } catch (error: any) {
      showToast("error", "Error", error?.message || "Error al iniciar operación");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStopOp = async (m: Machine) => {
    setActionLoading(m.id);
    try {
      await machinesService.stopOperation(m.id);
      showToast("info", "Operación detenida", m.code);
      fetchMachines(searchTerm);
      fetchStats();
    } catch (error: any) {
      showToast("error", "Error", error?.message || "Error al detener operación");
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenConfig = (m: Machine) => {
    setSelectedMachine(m);
    setConfigForm({ 
      name: m.name, 
      type: m.type || "", 
      brand: m.brand || "", 
      model: m.model || "", 
      location: m.location || "", 
      notes: m.notes || "" 
    });
    setConfigDialogOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!selectedMachine) return;
    setActionLoading(selectedMachine.id);
    try {
      await machinesService.update(selectedMachine.id, {
        name: configForm.name,
        type: configForm.type,
        brand: configForm.brand || undefined,
        model: configForm.model || undefined,
        location: configForm.location || undefined,
        notes: configForm.notes || undefined,
      });
      showToast("success", "Configuración guardada", selectedMachine.code);
      setConfigDialogOpen(false);
      fetchMachines(searchTerm);
    } catch (error: any) {
      showToast("error", "Error", error?.message || "Error al guardar");
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenMaintenance = (m: Machine) => {
    setSelectedMachine(m);
    setMaintenanceForm({ type: "preventive", notes: "", scheduledDate: "" });
    setMaintenanceDialogOpen(true);
  };

  const handleScheduleMaintenance = async () => {
    if (!selectedMachine) return;
    setActionLoading(selectedMachine.id);
    try {
      await machinesService.scheduleMaintenance(selectedMachine.id, {
        type: maintenanceForm.type,
        notes: maintenanceForm.notes,
        scheduledDate: maintenanceForm.scheduledDate,
      });
      showToast("warning", "Mantenimiento programado", `${selectedMachine.code} - ${maintenanceForm.type}`);
      setMaintenanceDialogOpen(false);
      fetchMachines(searchTerm);
      fetchStats();
    } catch (error: any) {
      showToast("error", "Error", error?.message || "Error al programar mantenimiento");
    } finally {
      setActionLoading(null);
    }
  };

  const handleFinishMaintenance = async (m: Machine) => {
    setActionLoading(m.id);
    try {
      await machinesService.completeMaintenance(m.id);
      showToast("success", "Mantenimiento completado", m.code);
      fetchMachines(searchTerm);
      fetchStats();
    } catch (error: any) {
      showToast("error", "Error", error?.message || "Error al completar mantenimiento");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetail = (m: Machine) => {
    setSelectedMachine(m);
    setDetailDialogOpen(true);
  };

  const handleDeleteMachine = (m: Machine) => {
    setSelectedMachine(m);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async (pin?: string) => {
    if (!selectedMachine) return;
    setActionLoading(selectedMachine.id);
    try {
      await machinesService.delete(selectedMachine.id, pin);
      showToast("success", "Máquina eliminada", selectedMachine.code);
      setSelectedMachine(null);
      setConfirmDeleteOpen(false);
      fetchMachines(searchTerm);
      fetchStats();
    } catch (error: any) {
      showToast("error", "Error", error?.message || "Error al eliminar");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d: string | Date | null | undefined) => {
    if (!d) return '-';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  };

  if (loading && machines.length === 0) {
    return (
      <ERPLayout title="Maquinas" subtitle="Gestion de maquinas">
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (<Skeleton key={i} className="h-24" />))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (<Skeleton key={i} className="h-64" />))}
          </div>
        </div>
      </ERPLayout>
    );
  }

  return (
    <ERPLayout title="Maquinas" subtitle="Gestion y monitoreo de maquinas de produccion">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {([
            { label: "En Operacion", count: counts.running, dotClass: "bg-emerald-500", bgClass: "bg-emerald-50", textClass: "text-emerald-700", icon: Play },
            { label: "Disponibles", count: counts.available, dotClass: "bg-blue-500", bgClass: "bg-blue-50", textClass: "text-blue-700", icon: Power },
            { label: "Mantenimiento", count: counts.maintenance, dotClass: "bg-amber-500", bgClass: "bg-amber-50", textClass: "text-amber-700", icon: Wrench },
            { label: "Apagadas", count: counts.offline, dotClass: "bg-gray-400", bgClass: "bg-gray-50", textClass: "text-gray-600", icon: PowerOff },
          ]).map((kpi) => (
            <Card key={kpi.label} className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{kpi.label}</p>
                    <p className={cn("text-2xl font-bold mt-1", kpi.textClass)}>{kpi.count}</p>
                  </div>
                  <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg", kpi.bgClass)}>
                    <kpi.icon className={cn("h-5 w-5", kpi.textClass)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar maquina..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-full sm:w-64" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="running">En Operacion</SelectItem>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                <SelectItem value="offline">Apagada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setNewMachineOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Maquina
          </Button>
        </div>

        {/* Machine Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMachines.map((machine) => {
            const st = statusConfig[machine.status as MachineStatus] || statusConfig.available;
            const isLoading = actionLoading === machine.id;

            return (
              <Card key={machine.id} className="border hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                        <Cog className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">{machine.code}</CardTitle>
                        <p className="text-xs text-muted-foreground">{machine.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Badge variant="outline" className={cn("text-[11px] font-medium gap-1.5", st.badgeClass)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", st.dotClass, machine.status === "running" && "animate-pulse")} />
                          {st.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="font-medium text-sm">{machine.name}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Tag className="h-3.5 w-3.5" />
                      <span>{machine.brand} {machine.model}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{machine.location || "-"}</span>
                    </div>
                  </div>

                  {/* Utilization bar - simulated for now */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> Utilizacion</span>
                      <span className="font-semibold text-muted-foreground">-</span>
                    </div>
                    <Progress value={0} className="h-1.5" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> -</span>
                    <span>Creada: {formatDate(machine.createdAt)}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t">
                    {machine.status === "offline" && (
                      <Button size="sm" variant="outline" onClick={() => handleTogglePower(machine)} disabled={isLoading} className="text-xs h-8">
                        <Power className="h-3.5 w-3.5 mr-1" /> Encender
                      </Button>
                    )}
                    {machine.status === "available" && (
                      <>
                        <Button size="sm" onClick={() => handleStartOp(machine)} disabled={isLoading} className="text-xs h-8">
                          <Play className="h-3.5 w-3.5 mr-1" /> Iniciar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleTogglePower(machine)} disabled={isLoading} className="text-xs h-8">
                          <PowerOff className="h-3.5 w-3.5 mr-1" /> Apagar
                        </Button>
                      </>
                    )}
                    {machine.status === "running" && (
                      <Button size="sm" variant="outline" onClick={() => handleStopOp(machine)} disabled={isLoading} className="text-xs h-8 border-amber-200 text-amber-700 hover:bg-amber-50">
                        <Square className="h-3.5 w-3.5 mr-1" /> Detener
                      </Button>
                    )}
                    {machine.status === "maintenance" && (
                      <Button size="sm" onClick={() => handleFinishMaintenance(machine)} disabled={isLoading} className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Wrench className="h-3.5 w-3.5 mr-1" /> Finalizar Mant.
                      </Button>
                    )}
                    {machine.status !== "maintenance" && (
                      <Button size="sm" variant="outline" onClick={() => handleOpenMaintenance(machine)} disabled={isLoading} className="text-xs h-8">
                        <Wrench className="h-3.5 w-3.5 mr-1" /> Mant.
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleOpenConfig(machine)} className="text-xs h-8 ml-auto">
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleViewDetail(machine)} className="text-xs h-8">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteMachine(machine)} className="text-xs h-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredMachines.length === 0 && (
          <div className="text-center py-16">
            <Cog className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No se encontraron maquinas</p>
            <p className="text-sm text-muted-foreground mt-1">Ajusta los filtros o agrega una nueva maquina</p>
          </div>
        )}
      </div>

      {/* New Machine Dialog */}
      <Dialog open={newMachineOpen} onOpenChange={(open) => { setNewMachineOpen(open); if (!open) setFormErrors({}); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Nueva Maquina</DialogTitle>
            <DialogDescription>Registra una nueva maquina en el sistema</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 overflow-y-auto max-h-[60vh] pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Codigo *</Label>
                <Input 
                  placeholder="MAQ-007" 
                  value={newForm.code} 
                  onChange={(e) => { setNewForm({ ...newForm, code: e.target.value }); setFormErrors({ ...formErrors, code: "" }); }} 
                  className={formErrors.code ? "border-destructive" : ""}
                />
                {formErrors.code && <p className="text-sm text-destructive">{formErrors.code}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Input 
                  placeholder="Ej: Troqueladora, Pegadora" 
                  value={newForm.type} 
                  onChange={(e) => { setNewForm({ ...newForm, type: e.target.value }); setFormErrors({ ...formErrors, type: "" }); }} 
                  className={formErrors.type ? "border-destructive" : ""}
                />
                {formErrors.type && <p className="text-sm text-destructive">{formErrors.type}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input 
                placeholder="Nombre de la maquina" 
                value={newForm.name} 
                onChange={(e) => { setNewForm({ ...newForm, name: e.target.value }); setFormErrors({ ...formErrors, name: "" }); }} 
                className={formErrors.name ? "border-destructive" : ""}
              />
              {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca</Label>
                <Input placeholder="Marca" value={newForm.brand} onChange={(e) => setNewForm({ ...newForm, brand: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input placeholder="Modelo" value={newForm.model} onChange={(e) => setNewForm({ ...newForm, model: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ubicacion</Label>
              <Input placeholder="Ej: Nave 1 - Zona Corrugado" value={newForm.location} onChange={(e) => setNewForm({ ...newForm, location: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea placeholder="Notas adicionales" value={newForm.notes} onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Ejes</Label>
              <Input 
                placeholder="Número de ejes" 
                value={newForm.axes} 
                onChange={(e) => { setNewForm({ ...newForm, axes: e.target.value }); setFormErrors({ ...formErrors, axes: "" }); }} 
                className={formErrors.axes ? "border-destructive" : ""}
              />
              {formErrors.axes && <p className="text-sm text-destructive">{formErrors.axes}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewMachineOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={actionLoading !== null}>
              {actionLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</> : "Registrar Maquina"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Config Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurar {selectedMachine?.code}</DialogTitle>
            <DialogDescription>Edita los datos de la maquina</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={configForm.name} onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Input value={configForm.type} onChange={(e) => setConfigForm({ ...configForm, type: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca</Label>
                <Input value={configForm.brand} onChange={(e) => setConfigForm({ ...configForm, brand: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input value={configForm.model} onChange={(e) => setConfigForm({ ...configForm, model: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ubicacion</Label>
              <Input value={configForm.location} onChange={(e) => setConfigForm({ ...configForm, location: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea value={configForm.notes} onChange={(e) => setConfigForm({ ...configForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveConfig} disabled={actionLoading !== null}>
              {actionLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</> : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Maintenance Dialog */}
      <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Programar Mantenimiento</DialogTitle>
            <DialogDescription>{selectedMachine?.code} - {selectedMachine?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Mantenimiento</Label>
              <Select value={maintenanceForm.type} onValueChange={(v) => setMaintenanceForm({ ...maintenanceForm, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">Preventivo</SelectItem>
                  <SelectItem value="corrective">Correctivo</SelectItem>
                  <SelectItem value="predictive">Predictivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha Programada</Label>
              <Input type="date" value={maintenanceForm.scheduledDate} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, scheduledDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea placeholder="Notas del mantenimiento" value={maintenanceForm.notes} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMaintenanceDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleScheduleMaintenance} disabled={!maintenanceForm.scheduledDate || actionLoading !== null}>
              {actionLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Programando...</> : "Programar Mantenimiento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de Maquina</DialogTitle>
            <DialogDescription>{selectedMachine?.code}</DialogDescription>
          </DialogHeader>
          {selectedMachine && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-muted-foreground">Codigo</p><p className="font-medium">{selectedMachine.code}</p></div>
                <div><p className="text-muted-foreground">Nombre</p><p className="font-medium">{selectedMachine.name}</p></div>
                <div><p className="text-muted-foreground">Tipo</p><p className="font-medium">{selectedMachine.type}</p></div>
                <div><p className="text-muted-foreground">Marca / Modelo</p><p className="font-medium">{selectedMachine.brand} {selectedMachine.model}</p></div>
                <div><p className="text-muted-foreground">Ubicacion</p><p className="font-medium">{selectedMachine.location || "-"}</p></div>
                <div><p className="text-muted-foreground">Registrada</p><p className="font-medium">{formatDate(selectedMachine.createdAt)}</p></div>
              </div>
              {selectedMachine.notes && (
                <div className="space-y-1">
                  <p className="text-muted-foreground">Notas</p>
                  <p className="text-sm">{selectedMachine.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={() => setConfirmDeleteOpen(false)}
        title="Eliminar Maquina"
        description={`¿Estás seguro de eliminar "${selectedMachine?.code}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        showPinInput={!!machinesDeletePin}
        pinPlaceholder="Ingrese PIN de confirmación"
        onConfirmWithPin={(pin) => confirmDelete(pin)}
        onConfirm={() => confirmDelete()}
      />
    </ERPLayout>
  );
}
