"use client";

import { useState, useEffect } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/erp/action-toast";
import { workOrdersService } from "@/lib/services";
import { productsService } from "@/lib/services";
import type { WorkOrder } from "@/lib/types";
import type { CreateWorkOrderDto } from "@/lib/types/work-order.types";
import type { Client } from "@/lib/types/client.types";
import {
  WorkOrderStats,
  WorkOrderFilters,
  WorkOrderTable,
  WorkOrderDialog,
  DeleteWorkOrderDialog,
  PipelineDialog,
} from "./components";

export default function OrdenesTrabajo() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("all");
  const [filterPrioridad, setFilterPrioridad] = useState("all");
  
  // Dialogs state
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPipelineDialog, setShowPipelineDialog] = useState(false);
  
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<WorkOrder | null>(null);
  const [pipelineOrder, setPipelineOrder] = useState<WorkOrder | null>(null);
  
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  // Load products and clients
  useEffect(() => {
    productsService.selectList()
      .then(res => setProducts(res || []))
      .catch(() => {});
    
    workOrdersService.getClientsSelectList()
      .then(res => setClients(res || []))
      .catch(() => {});
  }, []);

  // Fetch work orders
  useEffect(() => {
    async function fetchWorkOrders() {
      setLoading(true);
      try {
        const response = await workOrdersService.getAll({
          search: search || undefined,
          status: filterEstado !== "all" ? filterEstado as any : undefined,
          priority: filterPrioridad !== "all" ? filterPrioridad as any : undefined,
        });
        setWorkOrders(response?.data || []);
      } catch (error) {
        console.error("Error fetching work orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkOrders();
  }, [search, filterEstado, filterPrioridad]);

  // Handlers
  const handleCreate = async (data: CreateWorkOrderDto) => {
    try {
      if (editingOrder) {
        await workOrdersService.update(editingOrder.id, data);
        showToast("success", "Éxito", "Orden actualizada correctamente");
      } else {
        await workOrdersService.create(data);
        showToast("success", "Éxito", "Orden de trabajo creada correctamente");
      }
      setShowDialog(false);
      setEditingOrder(null);
      // Refresh list
      const response = await workOrdersService.getAll();
      setWorkOrders(response?.data || []);
    } catch (err: any) {
      showToast("error", "Error", err?.message || "No se pudo guardar la orden");
    }
  };

  const handleDelete = async () => {
    if (!deletingOrder) return;
    try {
      await workOrdersService.delete(deletingOrder.id);
      showToast("success", "Éxito", "Orden eliminada correctamente");
      setShowDeleteDialog(false);
      setDeletingOrder(null);
      // Refresh list
      const response = await workOrdersService.getAll();
      setWorkOrders(response?.data || []);
    } catch (err: any) {
      showToast("error", "Error", err?.message || "No se pudo eliminar la orden");
    }
  };

  const openEditDialog = (order: WorkOrder) => {
    setEditingOrder(order);
    setShowDialog(true);
  };

  const openDeleteDialog = (order: WorkOrder) => {
    setDeletingOrder(order);
    setShowDeleteDialog(true);
  };

  const openPipelineDialog = (order: WorkOrder) => {
    setPipelineOrder(order);
    setShowPipelineDialog(true);
  };

  const handleDialogClose = (open: boolean) => {
    setShowDialog(open);
    if (!open) {
      setEditingOrder(null);
    }
  };

  // Loading state
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
        {/* Stats */}
        <WorkOrderStats workOrders={workOrders} />

        {/* Filters */}
        <WorkOrderFilters
          searchTerm={search}
          onSearchChange={setSearch}
          filterStatus={filterEstado}
          onFilterStatusChange={setFilterEstado}
          filterPriority={filterPrioridad}
          onFilterPriorityChange={setFilterPrioridad}
          onCreateClick={() => setShowDialog(true)}
        />

        {/* Table */}
        <WorkOrderTable
          workOrders={workOrders}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onViewPipeline={openPipelineDialog}
        />

        {/* Dialogs */}
        <WorkOrderDialog
          open={showDialog}
          onOpenChange={handleDialogClose}
          workOrder={editingOrder}
          onSubmit={handleCreate}
          products={products}
          clients={clients}
          isLoading={false}
        />

        <DeleteWorkOrderDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          workOrderCode={deletingOrder?.code || null}
          onConfirm={handleDelete}
          isLoading={false}
        />

        <PipelineDialog
          open={showPipelineDialog}
          onOpenChange={setShowPipelineDialog}
          workOrder={pipelineOrder}
        />
      </div>
    </ERPLayout>
  );
}
