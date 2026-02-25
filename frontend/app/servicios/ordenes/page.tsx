"use client";

import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Wrench, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { ConfirmDialog, ViewDialog } from "@/components/erp/modal-form";
import { useToast } from "@/components/erp/action-toast";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { serviceOrdersService, clientsService } from "@/lib/services";
import type { ServiceOrder, ServiceOrderStatus, ServiceOrderType, ServiceOrderPriority, CreateServiceOrderDto } from "@/lib/types";

export default function ServiceOrdersPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const [viewingOrder, setViewingOrder] = useState<ServiceOrder | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<ServiceOrder | null>(null);
  const [clients, setClients] = useState<{ value: string; label: string }[]>([]);
  const [employees, setEmployees] = useState<{ value: string; label: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    description: "",
    type: "repair" as ServiceOrderType,
    priority: "medium" as ServiceOrderPriority,
    assignedTo: "",
    estimatedHours: "",
    scheduledDate: "",
    cost: "",
  });

  // Fetch service orders
  const { data: response, loading, refetch } = useApiQuery(
    () => serviceOrdersService.getAll({ search }),
    { enabled: true }
  );
  const orders = response?.data || [];

  // Fetch clients for dropdown
  useApiQuery(
    () => clientsService.getAll({ status: "active" }),
    {
      enabled: true,
      onSuccess: (data: any) => {
        setClients(data.data?.map((c: any) => ({ value: String(c.id), label: c.name })) || []);
      }
    }
  );

  // Create mutation
  const { mutate: createOrder, loading: creating } = useApiMutation(
    (data: CreateServiceOrderDto) => serviceOrdersService.create(data),
    {
      onSuccess: () => {
        showToast("success", "Éxito", "Orden de servicio creada correctamente");
        refetch();
        setIsModalOpen(false);
        resetForm();
      },
      onError: (err: string) => {
        showToast("error", "Error", err || "No se pudo crear la orden");
      }
    }
  );

  // Update mutation
  const { mutate: updateOrder, loading: updating } = useApiMutation(
    (data: Partial<CreateServiceOrderDto> & { status?: ServiceOrderStatus }) => {
      if (!editingOrder) throw new Error("No hay orden seleccionada");
      return serviceOrdersService.update(editingOrder.id, data);
    },
    {
      onSuccess: () => {
        showToast("success", "Éxito", "Orden actualizada correctamente");
        refetch();
        setIsModalOpen(false);
        setEditingOrder(null);
        resetForm();
      },
      onError: (err: string) => {
        showToast("error", "Error", err || "No se pudo actualizar la orden");
      }
    }
  );

  // Delete mutation
  const { mutate: deleteOrder, loading: deleting } = useApiMutation(
    (_: void) => {
      if (!deletingOrder) throw new Error("No hay orden seleccionada");
      return serviceOrdersService.delete(deletingOrder.id);
    },
    {
      onSuccess: () => {
        showToast("success", "Éxito", "Orden eliminada correctamente");
        refetch();
        setDeletingOrder(null);
      },
      onError: (err: string) => {
        showToast("error", "Error", err || "No se pudo eliminar la orden");
      }
    }
  );

  const resetForm = () => {
    setFormData({
      clientId: "",
      title: "",
      description: "",
      type: "repair",
      priority: "medium",
      assignedTo: "",
      estimatedHours: "",
      scheduledDate: "",
      cost: "",
    });
  };

  const handleCreate = () => {
    setEditingOrder(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (order: ServiceOrder) => {
    setEditingOrder(order);
    setFormData({
      clientId: String(order.clientId),
      title: order.title,
      description: order.description || "",
      type: order.type,
      priority: order.priority,
      assignedTo: order.assignedTo || "",
      estimatedHours: order.estimatedHours ? String(order.estimatedHours) : "",
      scheduledDate: order.scheduledDate || "",
      cost: order.cost ? String(order.cost) : "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const data: CreateServiceOrderDto = {
      clientId: parseInt(formData.clientId),
      title: formData.title,
      description: formData.description,
      type: formData.type,
      priority: formData.priority,
      assignedTo: formData.assignedTo || undefined,
      estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
      scheduledDate: formData.scheduledDate || undefined,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
    };

    if (editingOrder) {
      updateOrder(data);
    } else {
      createOrder(data);
    }
  };

  const handleDelete = () => {
    deleteOrder(undefined);
  };

  const getStatusBadge = (status: ServiceOrderStatus) => {
    const variants: Record<string, string> = {
      pending: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      assigned: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      in_progress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    const labels: Record<string, string> = {
      pending: "Pendiente",
      assigned: "Asignado",
      in_progress: "En Progreso",
      completed: "Completado",
      cancelled: "Cancelado",
    };
    return <Badge className={variants[status]}>{labels[status]}</Badge>;
  };

  const getPriorityBadge = (priority: ServiceOrderPriority) => {
    const variants: Record<string, string> = {
      low: "bg-gray-500/20 text-gray-400",
      medium: "bg-blue-500/20 text-blue-400",
      high: "bg-amber-500/20 text-amber-400",
      urgent: "bg-red-500/20 text-red-400",
    };
    const labels: Record<string, string> = { low: "Baja", medium: "Media", high: "Alta", urgent: "Urgente" };
    return <Badge className={variants[priority]}>{labels[priority]}</Badge>;
  };

  const getTypeBadge = (type: ServiceOrderType) => {
    const labels: Record<string, string> = {
      repair: "Reparacion",
      maintenance: "Mantenimiento",
      installation: "Instalacion",
      consultation: "Consultoria",
    };
    return <Badge variant="outline">{labels[type]}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
  };

  const stats = {
    total: orders.length,
    inProgress: orders.filter((o: ServiceOrder) => o.status === "in_progress").length,
    pending: orders.filter((o: ServiceOrder) => o.status === "pending" || o.status === "assigned").length,
    urgent: orders.filter((o: ServiceOrder) => o.priority === "urgent" && o.status !== "completed" && o.status !== "cancelled").length,
  };

  const isLoading = loading || creating || updating || deleting;

  return (
    <ERPLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ordenes de Servicio</h1>
            <p className="text-muted-foreground">Gestiona los servicios para clientes</p>
          </div>
          <Button onClick={handleCreate} className="gap-2" disabled={isLoading}>
            <Plus className="h-4 w-4" />
            Nueva Orden
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Ordenes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">En Progreso</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.urgent}</p>
                  <p className="text-xs text-muted-foreground">Urgentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-foreground">Lista de Ordenes de Servicio</CardTitle>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar orden..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-input border-border"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Orden</TableHead>
                      <TableHead className="text-muted-foreground">Cliente</TableHead>
                      <TableHead className="text-muted-foreground">Tipo</TableHead>
                      <TableHead className="text-muted-foreground">Prioridad</TableHead>
                      <TableHead className="text-muted-foreground">Asignado</TableHead>
                      <TableHead className="text-muted-foreground">Costo</TableHead>
                      <TableHead className="text-muted-foreground">Estado</TableHead>
                      <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order: ServiceOrder) => (
                      <TableRow key={order.id} className="border-border">
                        <TableCell className="font-mono text-sm text-foreground">{order.code}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{order.clientName}</p>
                            <p className="text-xs text-muted-foreground">{order.title}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(order.type)}</TableCell>
                        <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                        <TableCell className="text-foreground">{order.assignedTo || "-"}</TableCell>
                        <TableCell className="text-foreground font-medium">{order.cost ? formatCurrency(order.cost) : "-"}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewingOrder(order)}>
                                <Eye className="h-4 w-4 mr-2" /> Ver detalle
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(order)}>
                                <Pencil className="h-4 w-4 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setDeletingOrder(order)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card border-border rounded-lg p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-foreground">
                {editingOrder ? "Editar Orden de Servicio" : "Nueva Orden de Servicio"}
              </h2>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Cliente *</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-input text-foreground"
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Título *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título del servicio"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-input text-foreground"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tipo *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ServiceOrderType })}
                    className="w-full p-2 border border-border rounded-md bg-input text-foreground"
                  >
                    <option value="repair">Reparación</option>
                    <option value="maintenance">Mantenimiento</option>
                    <option value="installation">Instalación</option>
                    <option value="consultation">Consultoría</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Prioridad</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as ServiceOrderPriority })}
                    className="w-full p-2 border border-border rounded-md bg-input text-foreground"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Asignado a</label>
                <Input
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="Nombre del técnico"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Horas Estimadas</label>
                  <Input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Costo</label>
                  <Input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Fecha Programada</label>
                <Input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setIsModalOpen(false); setEditingOrder(null); resetForm(); }}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading || !formData.clientId || !formData.title}>
                  {editingOrder ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={!!deletingOrder}
          onClose={() => setDeletingOrder(null)}
          onConfirm={handleDelete}
          title="Eliminar Orden de Servicio"
          description={`¿Estas seguro de eliminar la orden ${deletingOrder?.code}? Esta accion no se puede deshacer.`}
          confirmLabel="Eliminar"
          variant="destructive"
        />

        {viewingOrder && (
          <ViewDialog
            open={!!viewingOrder}
            onClose={() => setViewingOrder(null)}
            title="Detalle de Orden de Servicio"
            data={[
              { label: "Orden", value: viewingOrder.code },
              { label: "Cliente", value: viewingOrder.clientName },
              { label: "Título", value: viewingOrder.title },
              { label: "Descripción", value: viewingOrder.description || "Sin descripción" },
              { label: "Tipo", value: getTypeBadge(viewingOrder.type) },
              { label: "Prioridad", value: getPriorityBadge(viewingOrder.priority) },
              { label: "Estado", value: getStatusBadge(viewingOrder.status) },
              { label: "Asignado a", value: viewingOrder.assignedTo || "-" },
              { label: "Horas Estimadas", value: viewingOrder.estimatedHours || "N/A" },
              { label: "Horas Reales", value: viewingOrder.actualHours ? String(viewingOrder.actualHours) : "N/A" },
              { label: "Fecha Programada", value: viewingOrder.scheduledDate || "N/A" },
              { label: "Fecha Completado", value: viewingOrder.completedDate || "N/A" },
              { label: "Costo", value: viewingOrder.cost ? formatCurrency(viewingOrder.cost) : "N/A" },
            ]}
          />
        )}
      </div>
    </ERPLayout>
  );
}
