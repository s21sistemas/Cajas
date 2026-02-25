"use client";

import { useState, useEffect } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { VehicleStatsCards } from "./components/VehicleStatsCards";
import { VehicleTable } from "./components/VehicleTable";
import { VehicleFormDialog } from "./components/VehicleFormDialog";
import { vehiclesService } from "@/lib/services";
import type { Vehicle, CreateVehicleDto } from "@/lib/types/vehicle.types";

export default function VehiculosPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Función para obtener vehículos
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehiclesService.getAll();
      // El servicio devuelve directamente el array
      const data = Array.isArray(response) ? response : [];
      setVehicles(data);
    } catch (error: any) {
      showToast("error", "Error al cargar vehículos", error?.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Filter by search
  const filteredVehicles = vehicles.filter(v =>
    v.brand?.toLowerCase().includes(search.toLowerCase()) ||
    v.licensePlate?.toLowerCase().includes(search.toLowerCase()) ||
    v.model?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (data: CreateVehicleDto) => {
    setSubmitting(true);
    try {
      if (editingVehicle) {
        await vehiclesService.update(Number(editingVehicle.id), data);
        showToast("success", "Vehículo actualizado", "");
      } else {
        await vehiclesService.create(data);
        showToast("success", "Vehículo creado", "");
      }
      setModalOpen(false);
      setEditingVehicle(null);
      fetchVehicles();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingVehicle) return;
    setSubmitting(true);
    try {
      await vehiclesService.delete(Number(deletingVehicle.id));
      showToast("success", "Vehículo eliminado", "");
      setDeletingVehicle(null);
      fetchVehicles();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setModalOpen(true);
  };

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'Available').length,
    assigned: vehicles.filter(v => v.status === 'Assigned').length,
  };

  return (
    <ProtectedRoute>
      <ERPLayout title="Vehículos" subtitle="Gestión de flota vehicular">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Vehículos</h1>
              <p className="text-muted-foreground">Gestión de flota vehicular</p>
            </div>
            <Button onClick={() => { setEditingVehicle(null); setModalOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Vehículo
            </Button>
          </div>

          <VehicleStatsCards
            total={stats.total}
            available={stats.available}
            assigned={stats.assigned}
          />

          <VehicleTable
            vehicles={filteredVehicles}
            search={search}
            onSearchChange={setSearch}
            onView={() => {}}
            onEdit={openEditModal}
            onDelete={setDeletingVehicle}
            loading={loading}
          />
        </div>

        <VehicleFormDialog
          open={modalOpen}
          onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingVehicle(null); }}
          editingVehicle={editingVehicle}
          onSubmit={handleSubmit}
          loading={submitting}
        />

        <ConfirmDialog
          open={!!deletingVehicle}
          onOpenChange={() => setDeletingVehicle(null)}
          title="Eliminar Vehículo"
          description={`¿Estás seguro de eliminar el vehículo "${deletingVehicle?.licensePlate}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          variant="destructive"
          onConfirm={handleDelete}
        />
      </ERPLayout>
    </ProtectedRoute>
  );
}
