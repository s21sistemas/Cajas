"use client";

import { useState, useEffect } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  Calendar,
  Eye,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/erp/action-toast";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { workOrdersService } from "@/lib/services";
import { productionService } from "@/lib/services/production.service";
import type { WorkOrder } from "@/lib/types";
import type { CreateWorkOrderDto } from "@/lib/types/work-order.types";
import type { Product } from "@/lib/types/product.types";
import type { Client } from "@/lib/types/client.types";
import { WorkOrderForm } from "@/components/forms/WorkOrderForm";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendiente", color: "bg-gray-500/20 text-gray-400", icon: Clock },
  in_progress: { label: "En Proceso", color: "bg-blue-500/20 text-blue-400", icon: Play },
  completed: { label: "Completada", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  cancelled: { label: "Cancelada", color: "bg-red-500/20 text-red-400", icon: Square },
  on_hold: { label: "Pausada", color: "bg-yellow-500/20 text-yellow-400", icon: Pause },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Baja", color: "bg-gray-500" },
  medium: { label: "Media", color: "bg-blue-500" },
  high: { label: "Alta", color: "bg-orange-500" },
  urgent: { label: "Urgente", color: "bg-red-500" },
};

export default function OrdenesTrabajo() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("all");
  const [filterPrioridad, setFilterPrioridad] = useState("all");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  // Dialog for pipeline details
  const [showPipelineDialog, setShowPipelineDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<any>(null);
  const [pipelineLoading, setPipelineLoading] = useState(false);

  const [formData, setFormData] = useState<CreateWorkOrderDto>({
    product_id: null,
    client_id: null,
    quantity: 1,
    priority: "medium",
    start_date: new Date().toISOString().split('T')[0],
    due_date: "",
    notes: "",
  });

  // Load products and clients (using workOrders endpoints to support limited roles)
  useEffect(() => {
    workOrdersService.getProducts().then(res => {
      setProducts(res.data || []);
    }).catch(() => {
      // Silently fail
    });
    workOrdersService.getClients().then(res => {
      setClients(res.data || []);
    }).catch(() => {
      // Silently fail
    });
  }, []);

  // Fetch work orders
  const { data: workOrdersResponse, loading, refetch } = useApiQuery(
    () => workOrdersService.getAll({
      search: search || undefined,
      status: filterEstado !== "all" ? filterEstado as any : undefined,
      priority: filterPrioridad !== "all" ? filterPrioridad as any : undefined,
    }),
    { enabled: true }
  );

  const workOrders: WorkOrder[] = workOrdersResponse?.data || [];

  // Create mutation
  const { mutate: createOrder, loading: creating } = useApiMutation(
    (data: CreateWorkOrderDto) => workOrdersService.create(data),
    {
      onSuccess: () => {
        showToast("success", "Éxito", "Orden de trabajo creada correctamente");
        setShowNewDialog(false);
        refetch();
      },
      onError: (err) => {
        showToast("error", "Error", err || "No se pudo crear la orden");
      }
    }
  );

  // Delete mutation
  const { mutate: deleteOrder } = useApiMutation(
    (id: number) => workOrdersService.delete(id),
    {
      onSuccess: () => {
        showToast("success", "Éxito", "Orden eliminada correctamente");
        refetch();
      },
      onError: (err) => {
        showToast("error", "Error", err || "No se pudo eliminar la orden");
      }
    }
  );

  // Update mutation
  const { mutate: updateOrder, loading: updating } = useApiMutation(
    ({ id, data }: { id: number; data: CreateWorkOrderDto }) => workOrdersService.update(id, data),
    {
      onSuccess: () => {
        showToast("success", "Éxito", "Orden actualizada correctamente");
        setShowNewDialog(false);
        setEditingOrder(null);
        refetch();
      },
      onError: (err) => {
        showToast("error", "Error", err || "No se pudo actualizar la orden");
      }
    }
  );

  const handleFormSubmit = async (data: CreateWorkOrderDto) => {
    if (editingOrder) {
      updateOrder({ id: editingOrder.id, data });
    } else {
      createOrder(data);
    }
  };

  const openEditDialog = (order: WorkOrder) => {
    setEditingOrder(order);
    setFormData({
      product_id: order.productId ?? null,
      client_id: order.clientId ?? null,
      quantity: order.quantity || 0,
      priority: order.priority || 'medium',
      start_date: order.startDate || '',
      due_date: order.dueDate || '',
      notes: order.notes || '',
    });
    setShowNewDialog(true);
  };

  const handleDialogClose = (open: boolean) => {
    setShowNewDialog(open);
    if (!open) {
      setEditingOrder(null);
      setFormData({
        product_id: null,
        client_id: null,
        quantity: 1,
        priority: "medium",
        start_date: new Date().toISOString().split('T')[0],
        due_date: "",
        notes: "",
      });
    }
  };

  const stats = {
    total: workOrders.length,
    pending: workOrders.filter((o) => o.status === "pending").length,
    inProgress: workOrders.filter((o) => o.status === "in_progress").length,
    completed: workOrders.filter((o) => o.status === "completed").length,
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-MX");
  };

  // Pipeline functions
  const openPipelineDialog = async (order: WorkOrder) => {
    setSelectedOrder(order);
    setShowPipelineDialog(true);
    setPipelineLoading(true);
    try {
      const data = await productionService.getPipelineStatus(order.id);
      setPipelineStatus(data);
    } catch (err: any) {
      showToast("error", "Error", err?.message || "No se pudo cargar el pipeline");
    } finally {
      setPipelineLoading(false);
    }
  };

  const initializePipeline = async () => {
    if (!selectedOrder) return;
    setPipelineLoading(true);
    try {
      await productionService.initializePipeline(selectedOrder.id);
      showToast("success", "Éxito", "Pipeline inicializado correctamente");
      // Refresh pipeline status
      const data = await productionService.getPipelineStatus(selectedOrder.id);
      setPipelineStatus(data);
    } catch (err: any) {
      showToast("error", "Error", err?.message || "No se pudo inicializar el pipeline");
    } finally {
      setPipelineLoading(false);
    }
  };

  // Función para obtener el color del estado MES
  const getMesStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-gray-500';
      case 'READY':
        return 'bg-blue-500';
      case 'RUNNING':
        return 'bg-green-500';
      case 'PAUSED':
        return 'bg-yellow-500';
      case 'COMPLETED':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <ERPLayout title="Órdenes de Trabajo" subtitle="Gestión de producción">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full bg-card" />
          <Skeleton className="h-[500px] bg-card" />
        </div>
      </ERPLayout>
    );
  }

  return (
    <ERPLayout title="Órdenes de Trabajo" subtitle="Gestión de producción">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Total Órdenes</p>
                  <p className="text-2xl font-bold text-card-foreground mt-1">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-400 mt-1">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-gray-400/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">En Proceso</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">{stats.inProgress}</p>
                </div>
                <Play className="h-8 w-8 text-blue-400/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Completadas</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar orden..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-64 bg-secondary border-0"
              />
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-36 bg-secondary border-0">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_progress">En Proceso</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="on_hold">Pausada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPrioridad} onValueChange={setFilterPrioridad}>
              <SelectTrigger className="w-36 bg-secondary border-0">
                <AlertTriangle className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setShowNewDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Orden
          </Button>
        </div>

        {/* Work Orders Table */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Órdenes de Trabajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Orden</TableHead>
                  <TableHead className="text-muted-foreground">Producto</TableHead>
                  <TableHead className="text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-muted-foreground">Cantidad</TableHead>
                  <TableHead className="text-muted-foreground">Progreso</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                  <TableHead className="text-muted-foreground">Prioridad</TableHead>
                  <TableHead className="text-muted-foreground">Entrega</TableHead>
                  <TableHead className="text-muted-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  const priority = priorityConfig[order.priority] || priorityConfig.medium;
                  const progress = order.quantity > 0 ? Math.round((order.completed / order.quantity) * 100) : 0;

                  return (
                    <TableRow key={order.id} className="border-border">
                      <TableCell>
                        <span className="font-mono text-sm">{order.code}</span>
                      </TableCell>
                      <TableCell>{order.productName}</TableCell>
                      <TableCell>{order.clientName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{order.quantity}</span>
                          <span className="text-xs text-muted-foreground">
                            {order.completed} completadas
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-2 w-20" />
                          <span className="text-xs">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priority.color}>{priority.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(order.dueDate || '')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver Pipeline" onClick={() => openPipelineDialog(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar" onClick={() => openEditDialog(order)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            title="Eliminar"
                            onClick={() => {
                              if (confirm("¿Está seguro de eliminar esta orden?")) {
                                deleteOrder(order.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* New Order Dialog */}
        <Dialog open={showNewDialog} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingOrder ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}</DialogTitle>
            </DialogHeader>
            <WorkOrderForm
              defaultValues={formData}
              onSubmit={handleFormSubmit}
              isLoading={creating || updating}
              products={products}
              clients={clients}
            />
          </DialogContent>
        </Dialog>

        {/* Pipeline Details Dialog */}
        <Dialog open={showPipelineDialog} onOpenChange={setShowPipelineDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Pipeline de Producción - {selectedOrder?.code}</DialogTitle>
            </DialogHeader>
            
            {pipelineLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : pipelineStatus ? (
              <div className="space-y-4">
                {/* Resumen de estados */}
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">Pendientes: {pipelineStatus.pipeline_status?.pending || 0}</Badge>
                  <Badge variant="outline" className="bg-blue-100">Listos: {pipelineStatus.pipeline_status?.ready || 0}</Badge>
                  <Badge variant="outline" className="bg-green-100">En Ejecución: {pipelineStatus.pipeline_status?.running || 0}</Badge>
                  <Badge variant="outline" className="bg-yellow-100">Pausados: {pipelineStatus.pipeline_status?.paused || 0}</Badge>
                  <Badge variant="outline" className="bg-emerald-100">Completados: {pipelineStatus.pipeline_status?.completed || 0}</Badge>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-2 bg-secondary rounded">
                    <div className="text-muted-foreground">Producidas</div>
                    <div className="font-bold text-lg">{pipelineStatus.pipeline_status?.total_produced || 0}</div>
                  </div>
                  <div className="text-center p-2 bg-secondary rounded">
                    <div className="text-muted-foreground">Scrap</div>
                    <div className="font-bold text-lg text-red-500">{pipelineStatus.pipeline_status?.total_scrap || 0}</div>
                  </div>
                  <div className="text-center p-2 bg-secondary rounded">
                    <div className="text-muted-foreground">Eficiencia</div>
                    <div className="font-bold text-lg">{pipelineStatus.pipeline_status?.efficiency || 0}%</div>
                  </div>
                </div>

                {/* Lista de procesos */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <h4 className="font-medium text-sm">Procesos</h4>
                  {(pipelineStatus.processes || []).map((process: any, index: number) => (
                    <div key={process.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{process.process_name || `Proceso ${index + 1}`}</div>
                          <div className="text-xs text-muted-foreground">
                            {process.completed_quantity} / {process.planned_quantity} unidades
                          </div>
                        </div>
                        <Badge className={`${getMesStatusColor(process.mes_status)} text-white`}>
                          {process.mes_status}
                        </Badge>
                      </div>
                      <Progress 
                        value={process.planned_quantity > 0 ? (process.completed_quantity / process.planned_quantity) * 100 : 0} 
                        className="h-1" 
                      />
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Scrap: {process.scrap_quantity}</span>
                        <span>Disponibles: {process.available_quantity}</span>
                        {process.metrics && (
                          <>
                            <span>Yield: {process.metrics.yield}%</span>
                            <span>Efic.: {process.metrics.efficiency}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {(pipelineStatus.processes || []).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No hay procesos definidos. Inicialice el pipeline.
                    </div>
                  )}
                </div>

                {/* Botón para inicializar pipeline */}
                {(pipelineStatus.processes || []).length === 0 && (
                  <Button onClick={initializePipeline} disabled={pipelineLoading} className="w-full">
                    {pipelineLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Inicializar Pipeline
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No se pudo cargar el estado del pipeline
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}
