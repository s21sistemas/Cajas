"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList } from "lucide-react";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orderPedidoService } from "@/lib/services/order-pedido.service";
import type { OrderPedido, OrderPedidoStats, CreateOrderPedidoDto } from "@/lib/types/order-pedido.types";

import { OrdenPedidoStatsCards } from "./components/OrdenPedidoStatsCards";
import { OrdenPedidoTable } from "./components/OrdenPedidoTable";
import { OrdenPedidoFormDialog } from "./components/OrdenPedidoFormDialog";

export default function OrdenesPedidoPage() {
  const { showToast } = useToast();
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;
  const [orders, setOrders] = useState<OrderPedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderPedido | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<OrderPedido | null>(null);
  const [assigningOrder, setAssigningOrder] = useState<OrderPedido | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [deliveringOrder, setDeliveringOrder] = useState<OrderPedido | null>(null);
  const [deliverModalOpen, setDeliverModalOpen] = useState(false);
  const [deliveryPhoto, setDeliveryPhoto] = useState<File | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Stats
  const [stats, setStats] = useState<OrderPedidoStats>({
    total: 0,
    pending: 0,
    assigned: 0,
    picked_up: 0,
    in_transit: 0,
    delivered: 0,
    cancelled: 0,
    byStatus: {},
  });

  // Refs
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { per_page: 100 };
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (search && search.trim()) {
        // Server-side search if needed
      }
      const response = await orderPedidoService.getAll(params);
      setOrders(response.data || []);
    } catch (error: any) {
      console.error("Error cargando órdenes:", error);
      showToastRef.current("error", "Error", "No se pudieron cargar las órdenes de pedido");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await orderPedidoService.getStats();
      setStats(statsData);
    } catch (error: any) {
      console.error("Error cargando estadísticas:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchOrders();
      fetchStats();
    }
  }, [fetchOrders, fetchStats]);

  // Fetch when filters change
  useEffect(() => {
    if (!isInitialMount.current) {
      fetchOrders();
    }
  }, [statusFilter, fetchOrders]);

  // Handlers
  const handleSubmit = async (data: CreateOrderPedidoDto) => {
    setSubmitting(true);
    try {
      if (editingOrder) {
        await orderPedidoService.update(editingOrder.id, data);
        showToast("success", "Orden actualizada", "");
      } else {
        await orderPedidoService.create(data);
        showToast("success", "Orden creada", "");
      }
      setModalOpen(false);
      setEditingOrder(null);
      fetchOrders();
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingOrder) return;
    setSubmitting(true);
    try {
      await orderPedidoService.delete(Number(deletingOrder.id));
      showToast("success", "Orden eliminada", "");
      setDeletingOrder(null);
      fetchOrders();
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickUp = async (order: OrderPedido) => {
    setSubmitting(true);
    try {
      await orderPedidoService.pickUp(Number(order.id));
      showToast("success", "Orden marcada como recogida", "El inventario ha sido actualizado");
      fetchOrders();
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = (order: OrderPedido) => {
    setAssigningOrder(order);
    setSupplierName(order.supplierName || "");
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (supplierName: string) => {
    if (!assigningOrder) return;
    setSubmitting(true);
    try {
      await orderPedidoService.assign(Number(assigningOrder.id), { supplier_name: supplierName });
      showToast("success", "Proveedor asignado", "La orden ha sido asignada");
      setAssignModalOpen(false);
      setAssigningOrder(null);
      fetchOrders();
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeliver = (order: OrderPedido) => {
    setDeliveringOrder(order);
    setDeliveryPhoto(null);
    setDeliveryNotes("");
    setDeliverModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDeliveryPhoto(file);
    }
  };

  const handleDeliverSubmit = async () => {
    if (!deliveringOrder) return;
    setSubmitting(true);
    try {
      const data: any = {};
      if (deliveryNotes) {
        data.notes = deliveryNotes;
      }
      await orderPedidoService.deliver(Number(deliveringOrder.id), data);
      showToast("success", "Entrega registrada", "La orden ha sido marcada como entregada");
      setDeliverModalOpen(false);
      setDeliveringOrder(null);
      fetchOrders();
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (order: OrderPedido) => {
    setEditingOrder(order);
    setModalOpen(true);
  };

  return (
    <ERPLayout title="Órdenes de Pedido" subtitle="Gestión de órdenes de pedido para entrega">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Órdenes de Pedido</h1>
            <p className="text-muted-foreground">
              Administra las órdenes de pedido y su asignación a proveedores
            </p>
          </div>
          <Button onClick={() => { setEditingOrder(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Orden
          </Button>
        </div>

        <OrdenPedidoStatsCards stats={stats} />

        <div className="flex gap-4">
          <select 
            className="px-3 py-2 border rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="assigned">Asignada</option>
            <option value="picked_up">Recogida</option>
            <option value="in_transit">En tránsito</option>
            <option value="delivered">Entregada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        <OrdenPedidoTable
          orders={orders}
          search={search}
          onSearchChange={setSearch}
          onEdit={openEditModal}
          onDelete={setDeletingOrder}
          onPickUp={handlePickUp}
          onAssign={handleAssign}
          onDeliver={handleDeliver}
          loading={loading}
          onRefresh={fetchOrders}
        />

        <OrdenPedidoFormDialog
          open={modalOpen}
          onOpenChange={setModalOpen}
          defaultValues={editingOrder || undefined}
          onSubmit={handleSubmit}
          isLoading={submitting}
        />

        <ConfirmDialog
          open={!!deletingOrder}
          onOpenChange={(open) => !open && setDeletingOrder(null)}
          onConfirm={handleDelete}
          title="Eliminar Orden"
          description={`¿Estás seguro de que deseas eliminar la orden "${deletingOrder?.orderNumber}"?`}
          confirmText="Eliminar"
          variant="destructive"
        />

        <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Asignar Proveedor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="supplier_name">Nombre del Proveedor</Label>
                <Input
                  id="supplier_name"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Ingrese el nombre del proveedor"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => handleAssignSubmit(supplierName)}
                  disabled={!supplierName.trim() || submitting}
                >
                  {submitting ? "Asignando..." : "Asignar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={deliverModalOpen} onOpenChange={setDeliverModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Entrega</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Foto de Entrega (Opcional)</Label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary/90"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_notes">Notas de Entrega</Label>
                <Input
                  id="delivery_notes"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Notas adicionales de la entrega"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeliverModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleDeliverSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Registrando..." : "Registrar Entrega"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}
