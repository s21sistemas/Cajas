"use client";

import { useState } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, ShoppingBag, Edit, Trash2 } from "lucide-react";
import { purchaseOrdersService } from "@/lib/services/purchase-orders.service";
import { suppliersService, materialsService } from "@/lib/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useToast } from "@/components/erp/action-toast";
import { PurchaseOrderForm } from "@/components/forms/PurchaseOrderForm";

export default function OrdenesCompraPage() {
  return (
    <ProtectedRoute requiredPermission="purchaseorders.view">
      <OrdenesCompraPageInner />
    </ProtectedRoute>
  );
}

function OrdenesCompraPageInner() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [deletingOrder, setDeletingOrder] = useState<any>(null);
  
  const { showToast } = useToast();

  // Fetch purchase orders from API
  const { data: ordersResponse, loading, refetch } = useApiQuery(
    () => purchaseOrdersService.getAll({ search: searchTerm || undefined }),
    { enabled: true }
  );

  // Fetch suppliers and materials for the form (prefetch once)
  const { data: suppliersData, loading: suppliersLoading } = useApiQuery(
    () => suppliersService.getAll({ perPage: 1000 }),
    { enabled: true }
  );
  const { data: materialsData, loading: materialsLoading } = useApiQuery(
    () => materialsService.selectList(),
    { enabled: true }
  );

  const suppliers = suppliersData?.data || [];
  const materials = materialsData || [];

  const orders = ordersResponse?.data || [];

  const statusLabels: Record<string, string> = {
    draft: 'Borrador',
    pending: 'Pendiente',
    approved: 'Aprobada',
    ordered: 'Ordenada',
    partial: 'Parcial',
    received: 'Recibida',
    cancelled: 'Cancelada',
    in_progress: 'En Progreso',
    completed: 'Completada',
    on_hold: 'En Espera',
    paused: 'Pausada',
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    approved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ordered: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    partial: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    received: 'bg-green-500/20 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const priorityLabels: Record<string, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente',
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  // Create mutation
  const { mutate: createOrder, loading: creating } = useApiMutation(
    (data: any) => purchaseOrdersService.create(data),
    {
      onSuccess: () => {
        showToast("success", "Orden creada", "La orden de compra se ha creado correctamente");
        setIsDialogOpen(false);
        setEditingOrder(null);
        refetch();
      },
      onError: (error: any) => {
        showToast("error", "Error", error?.message || "No se pudo crear la orden");
      },
    }
  );

  // Update mutation
  const { mutate: updateOrder, loading: updating } = useApiMutation(
    ({ id, data }: { id: number; data: any }) => purchaseOrdersService.update(id, data),
    {
      onSuccess: () => {
        showToast("success", "Orden actualizada", "La orden de compra se ha actualizado correctamente");
        setIsDialogOpen(false);
        setEditingOrder(null);
        refetch();
      },
      onError: (error: any) => {
        showToast("error", "Error", error?.message || "No se pudo actualizar la orden");
      },
    }
  );

  // Delete mutation
  const { mutate: deleteOrder, loading: deleting } = useApiMutation(
    (id: number) => purchaseOrdersService.delete(id),
    {
      onSuccess: () => {
        showToast("success", "Orden eliminada", "La orden de compra se ha eliminado correctamente");
        setDeletingOrder(null);
        refetch();
      },
      onError: (error: any) => {
        showToast("error", "Error", error?.message || "No se pudo eliminar la orden");
      },
    }
  );

  // Handle form submit
  const handleSubmit = async (data: any) => {
    if (editingOrder) {
      updateOrder({ id: editingOrder.id, data });
    } else {
      createOrder(data);
    }
  };

  // Open edit dialog - close first then open to force remount
  function openEditDialog(order: any) {
    setIsDialogOpen(false);
    setTimeout(() => {
      setEditingOrder(order);
      setIsDialogOpen(true);
    }, 100);
  }

  // Open create dialog - close first then open to force remount
  function openCreateDialog() {
    setIsDialogOpen(false);
    setTimeout(() => {
      setEditingOrder(null);
      setIsDialogOpen(true);
    }, 100);
  }

  // Format currency
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN' 
    }).format(amount);
  }

  // Format date
  function formatDate(dateStr: string) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-MX');
  }

  // Calculate totals
  const pendingCount = orders.filter((o: any) => o.status === 'pending' || o.status === 'approved' || o.status === 'ordered').length;
  const receivedCount = orders.filter((o: any) => o.status === 'received').length;
  const totalAmount = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <ERPLayout title="Órdenes de Compra" subtitle="Gestión de órdenes de compra">
      <div className="space-y-6">
        {/* KPI Cards - siempre visibles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Total</p>
                  <p className="text-2xl font-bold text-card-foreground mt-1">{loading ? '-' : orders.length}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-400 mt-1">{loading ? '-' : pendingCount}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-yellow-400/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Recibidas</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">{loading ? '-' : receivedCount}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-green-400/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Monto Total</p>
                  <p className="text-xl font-bold text-card-foreground mt-1">{loading ? '-' : formatCurrency(totalAmount)}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar orden..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-secondary border-0"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Orden
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingOrder ? "Editar Orden" : "Crear Nueva Orden"}
                </DialogTitle>
                <DialogDescription>
                  {editingOrder
                    ? "Modifique los datos de la orden."
                    : "Complete los datos de la orden de compra."}
                </DialogDescription>
              </DialogHeader>
              <PurchaseOrderForm
                key={editingOrder?.id || 'new-order'}
                order={editingOrder}
                onSubmit={handleSubmit}
                isLoading={creating || updating}
                suppliers={suppliers}
                materials={materials}
                suppliersLoading={suppliersLoading}
                materialsLoading={materialsLoading}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Orders Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-left">Código</TableHead>
                  <TableHead className="text-left">Proveedor</TableHead>
                  <TableHead className="text-left">Material</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-left">Tipo Pago</TableHead>
                  <TableHead className="text-left">Prioridad</TableHead>
                  <TableHead className="text-left">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 rounded ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No hay órdenes de compra
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.code}</TableCell>
                      <TableCell>{order.supplier_name || order.supplier?.name || '-'}</TableCell>
                      <TableCell>{order.material_name || order.material?.name || '-'}</TableCell>
                      <TableCell className="text-center">{order.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(order.total || 0)}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-md text-xs border bg-muted">
                          {order.payment_type === 'credit' ? `Crédito (${order.credit_days} días)` : 'Contado'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs border ${priorityColors[order.priority] || priorityColors.medium}`}>
                          {priorityLabels[order.priority] || order.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs border ${statusColors[order.status] || statusColors.draft}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(order)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog open={!!deletingOrder} onOpenChange={() => setDeletingOrder(null)}>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingOrder(order)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar Orden?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Está seguro de eliminar la orden "{deletingOrder?.code}"?
                                  Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deletingOrder && deleteOrder(deletingOrder.id)}
                                  disabled={deleting}
                                >
                                  {deleting ? 'Eliminando...' : 'Eliminar'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ERPLayout>
  );
}
