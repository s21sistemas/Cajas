"use client";

import { useState, useEffect } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { workOrdersService } from "@/lib/services/work-orders.service";
import { productionService } from "@/lib/services/production.service";
import {
  Play,
  Pause,
  CheckCircle,
  Package,
  ClipboardList,
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

// WorkOrder del backend (snake_case)
interface WorkOrder {
  id: number;
  code: string;
  product_name: string;
  client_name: string;
  quantity: number;
  completed: number;
  progress: number;
  status: string;
  priority: string;
  operator?: string;
  product_id?: number;
}

// Production del backend
interface Production {
  id: number;
  code: string;
  process_id: number;
  process?: {
    id: number;
    name: string;
  };
  product_process_id: number;
  product_process?: {
    id: number;
    sequence: number;
  };
  work_order_id: number;
  status: 'pending' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
  quality_status?: 'PENDING' | 'APPROVED' | 'SCRAP' | 'REWORK';
  target_parts: number;
  good_parts: number;
  scrap_parts: number;
  start_time?: string;
  end_time?: string;
  pause_reason?: string;
  machine?: {
    id: number;
    name: string;
  };
  operator?: {
    id: number;
    name: string;
  };
}

export default function OperadorProduccionPage() {
  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [productions, setProductions] = useState<Production[]>([]);
  const [selectedProduction, setSelectedProduction] = useState<Production | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [goodParts, setGoodParts] = useState("");
  const [scrapParts, setScrapParts] = useState("0");
  const [machineId, setMachineId] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [machines, setMachines] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [pauseReason, setPauseReason] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0); // Tiempo transcurrido en segundos

  // Timer para actualizar el tiempo transcurrido
  useEffect(() => {
    if (selectedProduction?.status === 'in_progress' && selectedProduction?.start_time) {
      const startTime = new Date(selectedProduction.start_time).getTime();
      
      const updateTimer = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      };
      
      // Actualizar inmediatamente
      updateTimer();
      
      // Luego actualizar cada segundo
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [selectedProduction?.status, selectedProduction?.start_time]);

  // Función para formatear tiempo
  const formatElapsedTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch work orders
  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const response = await workOrdersService.getAssigned();
      // La API devuelve datos en snake_case
      const data = (response as any).data || [];
      setWorkOrders(data);
    } catch (error: any) {
      toast.error(error?.message || "No se pudieron cargar las órdenes de trabajo");
    } finally {
      setLoading(false);
    }
  };

  // Fetch productions for a work order
  const fetchProductions = async (workOrderId: number) => {
    try {
      const data = await workOrdersService.getProductions(workOrderId);
      setProductions(data || []);
    } catch (error: any) {
      toast.error(error?.message || "No se pudieron cargar las producciones");
    }
  };

  // Fetch machines and operators
  const fetchData = async () => {
    try {
      const [machs, ops] = await Promise.all([
        productionService.getMachines(),
        productionService.getOperators(),
      ]);
      setMachines(machs);
      setOperators(ops);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Select work order and load its productions
  const handleSelectWorkOrder = async (wo: WorkOrder) => {
    setSelectedWorkOrder(wo);
    setSelectedProduction(null);
    await fetchProductions(wo.id);
  };

  // Open production detail dialog
  const handleOpenProductionDetail = (production: Production) => {
    setSelectedProduction(production);
    setMachineId(production.machine?.id?.toString() || "");
    setOperatorId(production.operator?.id?.toString() || "");
    setGoodParts("");
    setScrapParts("0");
    setRegisterOpen(true);
  };

  // Open start production dialog
  const handleOpenStartProduction = (production: Production) => {
    setSelectedProduction(production);
    setMachineId("");
    setOperatorId("");
    setRegisterOpen(true);
  };

  // Get current production (the one that can be worked on)
  const getCurrentProduction = (): Production | null => {
    // Find the first pending or in_progress production
    // But also check quality gate - previous must be approved
    const sortedProductions = [...productions].sort((a, b) => 
      (a.product_process?.sequence || 0) - (b.product_process?.sequence || 0)
    );
    
    for (let i = 0; i < sortedProductions.length; i++) {
      const prod = sortedProductions[i];
      
      // If this production is already completed or cancelled, skip
      if (prod.status === 'completed' || prod.status === 'cancelled') {
        continue;
      }
      
      // If this is the first production, it's always available
      if (i === 0) {
        return prod;
      }
      
      // Check if previous production passed quality
      const prevProd = sortedProductions[i - 1];
      if (prevProd.quality_status === 'APPROVED') {
        return prod;
      }
      
      // Previous not approved, can't work on this one
      return null;
    }
    
    return null;
  };

  // Check if production can be started (quality gate)
  const canStartProduction = (production: Production): { canStart: boolean; reason?: string } => {
    const sortedProductions = [...productions].sort((a, b) => 
      (a.product_process?.sequence || 0) - (b.product_process?.sequence || 0)
    );
    
    const currentIndex = sortedProductions.findIndex(p => p.id === production.id);
    
    // First production can always start
    if (currentIndex === 0) {
      return { canStart: true };
    }
    
    // Check previous production quality
    const prevProd = sortedProductions[currentIndex - 1];
    
    if (prevProd.quality_status !== 'APPROVED') {
      return { 
        canStart: false, 
        reason: `El proceso anterior (${prevProd.process?.name || 'Proceso'}) debe pasar control de calidad primero` 
      };
    }
    
    return { canStart: true };
  };

  // Start production
  const handleStartProduction = async (production: Production) => {
    const check = canStartProduction(production);
    if (!check.canStart) {
      toast.error(check.reason || "No se puede iniciar la producción");
      return;
    }

    setSubmitting(true);
    try {
      await productionService.update(production.id, {
        status: 'in_progress',
        machineId: machineId ? parseInt(machineId) : undefined,
        operatorId: operatorId ? parseInt(operatorId) : undefined,
      });
      toast.success("La producción ha iniciado");
      if (selectedWorkOrder) {
        await fetchProductions(selectedWorkOrder.id);
      }
    } catch (error: any) {
      toast.error(error?.message || "No se pudo iniciar la producción");
    } finally {
      setSubmitting(false);
    }
  };

  // Pause production
  const handlePauseProduction = async () => {
    if (!selectedProduction) return;

    setSubmitting(true);
    try {
      await productionService.pause(selectedProduction.id, pauseReason || "Pausado por operador");
      toast.success("La producción ha sido pausada");
      setRegisterOpen(false);
      setPauseReason("");
      if (selectedWorkOrder) {
        await fetchProductions(selectedWorkOrder.id);
      }
    } catch (error: any) {
      toast.error(error?.message || "No se pudo pausar la producción");
    } finally {
      setSubmitting(false);
    }
  };

  // Register parts
  const handleRegisterParts = async () => {
    if (!selectedProduction) return;

    setSubmitting(true);
    try {
      await productionService.registerParts(
        selectedProduction.id,
        parseInt(goodParts) || 0,
        parseInt(scrapParts) || 0
      );
      toast.success(`Buenas: ${goodParts}, Scrap: ${scrapParts}`);
      setRegisterOpen(false);
      setGoodParts("");
      setScrapParts("0");
      if (selectedWorkOrder) {
        await fetchProductions(selectedWorkOrder.id);
      }
    } catch (error: any) {
      toast.error(error?.message || "No se pudieron registrar las piezas");
    } finally {
      setSubmitting(false);
    }
  };

  // Complete production
  const handleCompleteProduction = async () => {
    if (!selectedProduction) return;

    setSubmitting(true);
    try {
      await productionService.complete(
        selectedProduction.id,
        parseInt(goodParts) || 0,
        parseInt(scrapParts) || 0
      );
      toast.success("La producción ha sido completada");
      setCompleteOpen(false);
      setGoodParts("");
      setScrapParts("0");
      if (selectedWorkOrder) {
        await fetchProductions(selectedWorkOrder.id);
      }
    } catch (error: any) {
      toast.error(error?.message || "No se pudo completar la producción");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
    fetchData();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  const getProductionStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-blue-500">En Producción</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completada</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500">Pausada</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelada</Badge>;
      default:
        return <Badge className="bg-gray-500">Pendiente</Badge>;
    }
  };

  const getQualityStatusBadge = (status?: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-500">Aprobado</Badge>;
      case "SCRAP":
        return <Badge className="bg-red-500">Scrap</Badge>;
      case "REWORK":
        return <Badge className="bg-yellow-500">Rework</Badge>;
      default:
        return <Badge className="bg-gray-500">Pendiente</Badge>;
    }
  };

  // Legacy function for work order status
  const getWorkOrderStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-blue-500">En Producción</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completada</Badge>;
      case "on_hold":
        return <Badge className="bg-yellow-500">En Espera</Badge>;
      default:
        return <Badge className="bg-gray-500">Pendiente</Badge>;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <ERPLayout title="Producción" subtitle="Panel del Operador">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </ERPLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <ERPLayout title="Producción" subtitle="Panel del Operador">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mis Órdenes de Trabajo</h1>
            <p className="text-muted-foreground">Selecciona una orden para registrar producción</p>
          </div>
          <Button onClick={fetchWorkOrders} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Pendientes</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {workOrders.filter((wo) => wo.status === "draft").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Play className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">En Producción</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {workOrders.filter((wo) => wo.status === "in_progress").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Completadas</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {workOrders.filter((wo) => wo.status === "completed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work Orders List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Órdenes de Trabajo Asignadas</CardTitle>
          </CardHeader>
          <CardContent>
            {workOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay órdenes de trabajo asignadas
              </div>
            ) : (
              <div className="space-y-4">
                {workOrders.map((wo) => (
                  <div
                    key={wo.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{wo.product_name}</h3>
                        <span className={`w-2 h-2 rounded-full ${getPriorityColor(wo.priority)}`} />
                        {getWorkOrderStatusBadge(wo.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {wo.client_name} | Cantidad: {wo.quantity}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={wo.progress} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{wo.progress}%</span>
                        <span className="text-sm text-muted-foreground">
                          ({wo.completed}/{wo.quantity})
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleSelectWorkOrder(wo)}
                        disabled={wo.status === "completed"}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ver Producciones
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Productions List - Show when a work order is selected */}
        {selectedWorkOrder && productions.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Producciones - {selectedWorkOrder.product_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productions
                  .sort((a, b) => (a.product_process?.sequence || 0) - (b.product_process?.sequence || 0))
                  .map((production, index) => {
                    const qualityCheck = canStartProduction(production);
                    const canWork = qualityCheck.canStart || production.status !== 'pending';
                    
                    return (
                      <div
                        key={production.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          production.status === 'in_progress' 
                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/30' 
                            : production.status === 'completed'
                            ? 'bg-green-50 border-green-200 dark:bg-green-950/30'
                            : 'bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{production.process?.name || `Proceso ${production.process_id}`}</h4>
                              {getProductionStatusBadge(production.status)}
                              {production.quality_status && getQualityStatusBadge(production.quality_status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>Meta: {production.target_parts} piezas</span>
                              <span>Buenos: {production.good_parts || 0}</span>
                              <span>Scrap: {production.scrap_parts || 0}</span>
                            </div>
                            {!canWork && production.status === 'pending' && (
                              <div className="flex items-center gap-1 text-xs text-orange-500 mt-1">
                                <AlertCircle className="h-3 w-3" />
                                {qualityCheck.reason}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {production.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenStartProduction(production)}
                              disabled={!qualityCheck.canStart}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Iniciar
                            </Button>
                          )}
                          {production.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenProductionDetail(production)}
                            >
                              <Package className="h-4 w-4 mr-1" />
                              Continuar
                            </Button>
                          )}
                          {production.status === 'paused' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenProductionDetail(production)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Reanudar
                            </Button>
                          )}
                          {production.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenProductionDetail(production)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Ver Detalle
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No productions message */}
        {selectedWorkOrder && productions.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay producciones asociadas a esta orden</p>
                <p className="text-sm mt-1">Las producciones se crean automáticamente al aprobar la orden</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Production Detail Dialog */}
        <Dialog open={registerOpen} onOpenChange={(open) => {
          setRegisterOpen(open);
          if (!open) {
            setSelectedProduction(null);
            setGoodParts("");
            setScrapParts("0");
            setPauseReason("");
          }
        }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedProduction?.status === 'pending' && "Iniciar Producción"}
                {selectedProduction?.status === 'in_progress' && "Producción en Curso"}
                {selectedProduction?.status === 'paused' && "Reanudar Producción"}
                {selectedProduction?.status === 'completed' && "Producción Completada"}
              </DialogTitle>
              <DialogDescription>
                {selectedWorkOrder?.product_name} - Proceso: {selectedProduction?.process?.name || 'N/A'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Production Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Secuencia</p>
                  <p className="font-medium">{selectedProduction?.product_process?.sequence || 1}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estado</p>
                  {getProductionStatusBadge(selectedProduction?.status || 'pending')}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Calidad</p>
                  {getQualityStatusBadge(selectedProduction?.quality_status)}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Meta</p>
                  <p className="font-medium">{selectedProduction?.target_parts || 0} piezas</p>
                </div>
              </div>

              {/* Start Production - Select Machine & Operator */}
              {selectedProduction?.status === 'pending' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Máquina *</Label>
                      <Select value={machineId} onValueChange={setMachineId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar máquina" />
                        </SelectTrigger>
                        <SelectContent>
                          {machines.map((mach) => (
                            <SelectItem key={mach.id} value={String(mach.id)}>
                              {mach.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Operador *</Label>
                      <Select value={operatorId} onValueChange={setOperatorId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar operador" />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map((op) => (
                            <SelectItem key={op.id} value={String(op.id)}>
                              {op.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* In Progress - Register Parts or Pause */}
              {selectedProduction?.status === 'in_progress' && (
                <div className="space-y-4">
                  {/* Timer Visual */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400 text-center mb-1">Tiempo Transcurrido</p>
                    <p className="text-4xl font-bold text-blue-700 dark:text-blue-300 text-center font-mono">
                      {formatElapsedTime(elapsedTime)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Piezas Buenos *</Label>
                      <Input
                        type="number"
                        value={goodParts}
                        onChange={(e) => setGoodParts(e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Scrap</Label>
                      <Input
                        type="number"
                        value={scrapParts}
                        onChange={(e) => setScrapParts(e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Razón de pausa (opcional)</Label>
                    <Input
                      value={pauseReason}
                      onChange={(e) => setPauseReason(e.target.value)}
                      placeholder="Razón si va a pausar..."
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Piezas registradas: Buenos {selectedProduction?.good_parts || 0}, Scrap {selectedProduction?.scrap_parts || 0}
                  </div>
                </div>
              )}

              {/* Paused - Resume or Complete */}
              {selectedProduction?.status === 'paused' && (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>Razón de pausa: {selectedProduction?.pause_reason || 'No especificada'}</p>
                    <p className="mt-2">Piezas registradas: Buenos {selectedProduction?.good_parts || 0}, Scrap {selectedProduction?.scrap_parts || 0}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Piezas Buenos adicionales</Label>
                      <Input
                        type="number"
                        value={goodParts}
                        onChange={(e) => setGoodParts(e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Scrap adicional</Label>
                      <Input
                        type="number"
                        value={scrapParts}
                        onChange={(e) => setScrapParts(e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Completed - Show Summary */}
              {selectedProduction?.status === 'completed' && (
                <div className="space-y-2 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Piezas Buenos:</span>
                    <span className="font-medium text-green-500">{selectedProduction?.good_parts || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scrap:</span>
                    <span className="font-medium text-red-500">{selectedProduction?.scrap_parts || 0}</span>
                  </div>
                  {selectedProduction?.start_time && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inició:</span>
                      <span className="font-medium">{new Date(selectedProduction.start_time).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedProduction?.end_time && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Finalizó:</span>
                      <span className="font-medium">{new Date(selectedProduction.end_time).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRegisterOpen(false)}>
                Cerrar
              </Button>
              
              {/* Pending - Start Button */}
              {selectedProduction?.status === 'pending' && (
                <Button 
                  onClick={() => handleStartProduction(selectedProduction)} 
                  disabled={submitting || !machineId || !operatorId}
                >
                  {submitting ? "Iniciando..." : "Iniciar Producción"}
                </Button>
              )}

              {/* In Progress - Register/Pause Buttons */}
              {selectedProduction?.status === 'in_progress' && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={handlePauseProduction}
                    disabled={submitting}
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Pausar
                  </Button>
                  <Button 
                    onClick={handleRegisterParts}
                    disabled={submitting || !goodParts}
                  >
                    {submitting ? "Registrando..." : "Registrar Piezas"}
                  </Button>
                </div>
              )}

              {/* Paused - Resume/Complete Buttons */}
              {selectedProduction?.status === 'paused' && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleStartProduction(selectedProduction)}
                    disabled={submitting}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Reanudar
                  </Button>
                  <Button 
                    onClick={handleCompleteProduction}
                    disabled={submitting}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completar
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
    </ProtectedRoute>
  );
}
