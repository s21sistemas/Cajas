"use client";

import { useState, useEffect } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { DeliveryStatsCards } from "./components/DeliveryStatsCards";
import { DeliveryTable } from "./components/DeliveryTable";
import { DeliveryFormDialog } from "./components/DeliveryFormDialog";
import { deliveriesService, vehiclesService } from "@/lib/services";
import type { Delivery, CreateDeliveryDto } from "@/lib/types/delivery.types";
import type { Vehicle } from "@/lib/types/vehicle.types";

export default function EntregasPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [deletingDelivery, setDeletingDelivery] = useState<Delivery | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Función para obtener entregas
  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const response = await deliveriesService.getAll();
      const data = Array.isArray(response) ? response : [];
      setDeliveries(data);
    } catch (error: any) {
      showToast("error", "Error al cargar entregas", error?.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener vehículos
  const fetchVehicles = async () => {
    try {
      const response = await vehiclesService.getAll();
      const data = Array.isArray(response) ? response : [];
      setVehicles(data);
    } catch (error: any) {
      console.error("Error al cargar vehículos:", error);
    }
  };

  // Carga inicial
  useEffect(() => {
    fetchDeliveries();
    fetchVehicles();
  }, []);

  // Filter by search
  const filteredDeliveries = deliveries.filter(d =>
    d.driver?.toLowerCase().includes(search.toLowerCase()) ||
    d.originAddress?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (data: CreateDeliveryDto) => {
    setSubmitting(true);
    try {
      if (editingDelivery) {
        await deliveriesService.update(Number(editingDelivery.id), data);
        showToast("success", "Entrega actualizada", "");
      } else {
        await deliveriesService.create(data);
        showToast("success", "Entrega creada", "");
      }
      setModalOpen(false);
      setEditingDelivery(null);
      fetchDeliveries();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDelivery) return;
    setSubmitting(true);
    try {
      await deliveriesService.delete(Number(deletingDelivery.id));
      showToast("success", "Entrega eliminada", "");
      setDeletingDelivery(null);
      fetchDeliveries();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setModalOpen(true);
  };

  const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === 'pending').length,
    inTransit: deliveries.filter(d => d.status === 'in_transit').length,
    completed: deliveries.filter(d => d.status === 'completed').length,
  };

  return (
    <ProtectedRoute>
      <ERPLayout title="Entregas" subtitle="Gestión de entregas">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Entregas</h1>
              <p className="text-muted-foreground">Gestión de entregas</p>
            </div>
            <Button onClick={() => { setEditingDelivery(null); setModalOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Entrega
            </Button>
          </div>

          <DeliveryStatsCards
            total={stats.total}
            pending={stats.pending}
            inTransit={stats.inTransit}
            completed={stats.completed}
          />

          <DeliveryTable
            deliveries={filteredDeliveries}
            search={search}
            onSearchChange={setSearch}
            onView={() => {}}
            onEdit={openEditModal}
            onDelete={setDeletingDelivery}
            loading={loading}
          />
        </div>

        <DeliveryFormDialog
          open={modalOpen}
          onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingDelivery(null); }}
          editingDelivery={editingDelivery}
          vehicles={vehicles}
          onSubmit={handleSubmit}
          loading={submitting}
        />

        <ConfirmDialog
          open={!!deletingDelivery}
          onOpenChange={() => setDeletingDelivery(null)}
          title="Eliminar Entrega"
          description={`¿Estás seguro de eliminar la entrega "${deletingDelivery?.driver}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          variant="destructive"
          onConfirm={handleDelete}
        />
      </ERPLayout>
    </ProtectedRoute>
  );
}
