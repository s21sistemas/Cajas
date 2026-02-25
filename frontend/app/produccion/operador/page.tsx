"use client";

import { useState, useEffect } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
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
import { useToast } from "@/components/erp/action-toast";
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
} from "lucide-react";

// WorkOrder del backend (snake_case)
interface WorkOrder {
  id: number;
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

export default function OperadorProduccionPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [goodParts, setGoodParts] = useState("");
  const [scrapParts, setScrapParts] = useState("0");
  const [processId, setProcessId] = useState("");
  const [machineId, setMachineId] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [processes, setProcesses] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);

  // Fetch work orders
  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const response = await workOrdersService.getAssigned();
      // La API devuelve datos en snake_case
      const data = (response as any).data || [];
      setWorkOrders(data);
    } catch (error: any) {
      showToast("error", "Error", error?.message || "No se pudieron cargar las órdenes de trabajo");
    } finally {
      setLoading(false);
    }
  };

  // Fetch processes, machines, operators
  const fetchData = async () => {
    try {
      const [procs, machs, ops] = await Promise.all([
        productionService.getProcesses(),
        productionService.getMachines(),
        productionService.getOperators(),
      ]);
      setProcesses(procs);
      setMachines(machs);
      setOperators(ops);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
    fetchData();
  }, []);

  // Register production
  const handleRegisterProduction = async () => {
    if (!selectedWorkOrder || !goodParts || !processId) {
      showToast("error", "Error", "Completa los campos requeridos");
      return;
    }

    setSubmitting(true);
    try {
      // Usar el servicio directamente con los datos en formato snake_case
      await (productionService as any).create({
        work_order_id: selectedWorkOrder.id,
        process_id: parseInt(processId),
        machine_id: machineId ? parseInt(machineId) : null,
        operator_id: operatorId ? parseInt(operatorId) : null,
        good_parts: parseInt(goodParts),
        scrap_parts: parseInt(scrapParts) || 0,
        status: 'completed',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
      });

      showToast("success", "Producción registrada", `Se registraron ${goodParts} piezas`);
      setRegisterOpen(false);
      setGoodParts("");
      setScrapParts("0");
      setSelectedWorkOrder(null);
      fetchWorkOrders();
    } catch (error: any) {
      showToast("error", "Error", error?.message || "No se pudo registrar la producción");
    } finally {
      setSubmitting(false);
    }
  };

  // Complete work order and transfer to inventory
  const handleCompleteWorkOrder = async () => {
    if (!selectedWorkOrder) return;

    setSubmitting(true);
    try {
      await workOrdersService.markComplete(selectedWorkOrder.id);
      showToast("success", "Orden completada", "La producción se transfirió a producto terminado");
      setCompleteOpen(false);
      setSelectedWorkOrder(null);
      fetchWorkOrders();
    } catch (error: any) {
      showToast("error", "Error", error?.message || "No se pudo completar la orden");
    } finally {
      setSubmitting(false);
    }
  };

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

  const getStatusBadge = (status: string) => {
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
      <ERPLayout title="Producción" subtitle="Panel del Operador">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </ERPLayout>
    );
  }

  return (
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
                        {getStatusBadge(wo.status)}
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
                        onClick={() => {
                          setSelectedWorkOrder(wo);
                          setRegisterOpen(true);
                        }}
                        disabled={wo.status === "completed"}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Producir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedWorkOrder(wo);
                          setCompleteOpen(true);
                        }}
                        disabled={wo.progress < 100}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Register Production Dialog */}
        <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Producción</DialogTitle>
              <DialogDescription>
                {selectedWorkOrder?.product_name} - Cantidad objetivo: {selectedWorkOrder?.quantity}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Proceso *</Label>
                <Select value={processId} onValueChange={setProcessId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proceso" />
                  </SelectTrigger>
                  <SelectContent>
                    {processes.map((proc) => (
                      <SelectItem key={proc.id} value={String(proc.id)}>
                        {proc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Máquina</Label>
                  <Select value={machineId} onValueChange={setMachineId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
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
                  <Label>Operador</Label>
                  <Select value={operatorId} onValueChange={setOperatorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
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

              {selectedWorkOrder && (
                <div className="text-sm text-muted-foreground">
                  Progreso actual: {selectedWorkOrder.completed}/{selectedWorkOrder.quantity} (
                  {selectedWorkOrder.progress}%)
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRegisterOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRegisterProduction} disabled={submitting || !processId || !goodParts}>
                {submitting ? "Registrando..." : "Registrar Producción"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Complete Work Order Dialog */}
        <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Completar Orden de Trabajo</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de completar la orden de trabajo y transferir a inventario de producto
                terminado?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedWorkOrder && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Producto:</span>
                    <span className="font-medium">{selectedWorkOrder.product_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cantidad:</span>
                    <span className="font-medium">{selectedWorkOrder.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Producido:</span>
                    <span className="font-medium">{selectedWorkOrder.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Progreso:</span>
                    <span className="font-medium">{selectedWorkOrder.progress}%</span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCompleteOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCompleteWorkOrder} disabled={submitting}>
                {submitting ? "Completando..." : "Completar y Transferir"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}
