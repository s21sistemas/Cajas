"use client";

import { useState, useEffect, useCallback } from "react";
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
import { purchaseOrdersService, suppliersService, materialsService } from "@/lib/services";
import { PurchaseOrder } from "@/lib/types/purchase-order.types";
import { Supplier } from "@/lib/types/supplier.types";
import { Material } from "@/lib/types/material.types";
import { useToast } from "@/components/erp/action-toast";
import { PurchaseOrderForm } from "@/components/forms/PurchaseOrderForm";

// ============================================
// Tipos
// ============================================

interface Stats {
  total: number;
  pending: number;
  approved: number;
  ordered: number;
  received: number;
  totalAmount: number;
}

// ============================================
// Constantes
// ============================================

const STATUS_LABELS: Record<string, string> = {
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

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ordered: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  partial: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  received: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// ============================================
// Funciones helper
// ============================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', { 
    style: 'currency', 
    currency: 'MXN' 
  }).format(amount);
}

// ============================================
// Componente: StatsCards
// ============================================

interface StatsCardsProps {
  stats: Stats | null;
  loading: boolean;
}

function StatsCards({ stats, loading }: StatsCardsProps) {
  const pendingCount = (stats?.pending ?? 0) + (stats?.approved ?? 0) + (stats?.ordered ?? 0);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Total</p>
              <p className="text-2xl font-bold text-card-foreground mt-1">
                {loading ? '-' : stats?.total ?? 0}
              </p>
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
              <p className="text-2xl font-bold text-yellow-400 mt-1">
                {loading ? '-' : pendingCount}
              </p>
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
              <p className="text-2xl font-bold text-green-400 mt-1">
                {loading ? '-' : stats?.received ?? 0}
              </p>
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
              <p className="text-xl font-bold text-card-foreground mt-1">
                {loading ? '-' : formatCurrency(stats?.totalAmount ?? 0)}
              </p>
            </div>
            <ShoppingBag className="h-8 w-8 text-primary/30" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Componente: OrdersTable
// ============================================

interface OrdersTableProps {
  orders: PurchaseOrder[];
  loading: boolean;
  onEdit: (order: PurchaseOrder) => void;
  onDelete: (order: PurchaseOrder) => void;
}

function OrdersTable({ orders, loading, onEdit, onDelete }: OrdersTableProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-left">Orden de compra</TableHead>
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
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.code}</TableCell>
                  <TableCell>{order.supplierName || order.supplier?.name || '-'}</TableCell>
                  <TableCell>{order.materialName || order.material?.name || '-'}</TableCell>
                  <TableCell className="text-center">{order.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(order.total || 0)}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-md text-xs border bg-muted">
                      {order.paymentType === 'credit' ? `Crédito (${order.creditDays} días)` : 'Contado'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs border ${PRIORITY_COLORS[order.priority] || PRIORITY_COLORS.medium}`}>
                      {PRIORITY_LABELS[order.priority] || order.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs border ${STATUS_COLORS[order.status] || STATUS_COLORS.draft}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(order)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(order)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ============================================
// Componente: DeleteConfirmDialog
// ============================================

interface DeleteConfirmDialogProps {
  open: boolean;
  order: PurchaseOrder | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}

function DeleteConfirmDialog({ open, order, onOpenChange, onConfirm, loading }: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar Orden?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Está seguro de eliminar la orden "{order?.code}"?
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================
// Componente: Page Inner (lógica principal)
// ============================================

function OrdenesCompraPageInner() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<PurchaseOrder | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { showToast } = useToast();

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes, suppliersRes, materialsRes] = await Promise.all([
        purchaseOrdersService.getAll({ search: searchTerm || undefined }),
        purchaseOrdersService.getStats(),
        suppliersService.selectList(),
        materialsService.selectList(),
      ]);
      
      setOrders(ordersRes?.data || []);
      setStats({
        total: ordersRes?.total ?? 0,
        pending: statsRes?.pending ?? 0,
        approved: statsRes?.approved ?? 0,
        ordered: statsRes?.ordered ?? 0,
        received: statsRes?.received ?? 0,
        totalAmount: statsRes?.totalAmount ?? 0,
      });
      setSuppliers(suppliersRes || []);
      console.log(materialsRes);
      setMaterials(materialsRes || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const suppliersLoading = false;
  const materialsLoading = false;

  // Funciones de mutación usando async/await directo
  const handleCreate = async (data: any) => {
    setActionLoading(true);
    try {
      await purchaseOrdersService.create(data);
      showToast("success", "Orden creada", "La orden de compra se ha creado correctamente");
      setIsDialogOpen(false);
      setEditingOrder(null);
      fetchData();
    } catch (error: any) {
      showToast("error", "Error", error?.message || "No se pudo crear la orden");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingOrder) return;
    setActionLoading(true);
    try {
      await purchaseOrdersService.update(editingOrder.id, data);
      showToast("success", "Orden actualizada", "La orden de compra se ha actualizado correctamente");
      setIsDialogOpen(false);
      setEditingOrder(null);
      fetchData();
    } catch (error: any) {
      showToast("error", "Error", error?.message || "No se pudo actualizar la orden");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingOrder) return;
    setActionLoading(true);
    try {
      await purchaseOrdersService.delete(deletingOrder.id);
      showToast("success", "Orden eliminada", "La orden de compra se ha eliminado correctamente");
      setDeletingOrder(null);
      fetchData();
    } catch (error: any) {
      showToast("error", "Error", error?.message || "No se pudo eliminar la orden");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (data: any) => {
    if (editingOrder) {
      await handleUpdate(data);
    } else {
      await handleCreate(data);
    }
  };

  // Open edit dialog - close first then open to force remount
  const openEditDialog = useCallback((order: PurchaseOrder) => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setEditingOrder(order);
      setIsDialogOpen(true);
    }, 100);
  }, []);

  // Open create dialog - close first then open to force remount
  const openCreateDialog = useCallback(() => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setEditingOrder(null);
      setIsDialogOpen(true);
    }, 100);
  }, []);

  // Forzar re-render del diálogo al hacer click en "Nueva Orden"
  const handleNewOrderClick = () => {
    openCreateDialog();
  };

  return (
    <ERPLayout title="Órdenes de Compra" subtitle="Gestión de órdenes de compra">
      <div className="space-y-6">
        {/* Stats Cards - datos del backend */}
        <StatsCards stats={stats} loading={loading} />

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
          
          {/* Botón para nueva orden - dispara el diálogo */}
          <Button onClick={handleNewOrderClick}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Orden
          </Button>
        </div>

        {/* Orders Table */}
        <OrdersTable
          orders={orders}
          loading={loading}
          onEdit={openEditDialog}
          onDelete={(order) => setDeletingOrder(order)}
        />

        {/* Order Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              isLoading={actionLoading}
              suppliers={suppliers}
              materials={materials}
              suppliersLoading={suppliersLoading}
              materialsLoading={materialsLoading}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <DeleteConfirmDialog
          open={!!deletingOrder}
          order={deletingOrder}
          onOpenChange={(open) => !open && setDeletingOrder(null)}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      </div>
    </ERPLayout>
  );
}

// ============================================
// Componente principal
// ============================================

export default function OrdenesCompraPage() {
  return (
    <ProtectedRoute requiredPermission="purchaseorders.view">
      <OrdenesCompraPageInner />
    </ProtectedRoute>
  );
}
