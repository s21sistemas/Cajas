"use client";

import { useState, useEffect, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { maintenanceService, machinesService } from "@/lib/services";
import { useToast } from "@/components/erp/action-toast";
import { MantenimientoStatsCards } from "./components/MantenimientoStatsCards";
import { MantenimientoTable } from "./components/MantenimientoTable";
import { MantenimientoFormDialog } from "./components/MantenimientoFormDialog";
import { MantenimientoViewDialog } from "./components/MantenimientoViewDialog";
import type { MaintenanceOrder, CreateMaintenanceOrderDto, Machine } from "@/lib/types";

interface MaintenanceStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  totalCost: number;
}

export default function MantenimientoPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [items, setItems] = useState<MaintenanceOrder[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<MaintenanceOrder | null>(null);
  const [editingItem, setEditingItem] = useState<MaintenanceOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState<MaintenanceStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalCost: 0,
  });

  // Refs
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Función para obtener estadísticas desde el backend
  const fetchStats = async () => {
    try {
      const statsData = await maintenanceService.getStats();
      setStats({
        total: statsData.total || 0,
        pending: statsData.pending || 0,
        inProgress: statsData.inProgress || 0,
        completed: statsData.completed || 0,
        totalCost: statsData.totalCost || 0,
      });
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  // Función para obtener máquinas
  const fetchMachines = async () => {
    try {
      const response = await machinesService.getAll();
      const data = Array.isArray(response?.data) ? response.data : [];
      setMachines(data);
    } catch (error: any) {
      console.error("Error al cargar máquinas:", error);
    }
  };

  // Función para obtener items
  const fetchItems = async () => {
    setLoading(true);

    try {
      const response = await maintenanceService.getAll();

      const data = Array.isArray(response?.data) ? response.data : [];
      setItems(data);
    } catch (error: any) {
      showToast("error", "Error al cargar ordenes", error?.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    fetchItems();
    fetchStats();
    fetchMachines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      // La búsqueda se hace en cliente para este módulo
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Filtrado en cliente
  const filteredItems = items.filter((o) => {
    const matchesSearch =
      o.code?.toLowerCase().includes(search.toLowerCase()) ||
      o.machineName?.toLowerCase().includes(search.toLowerCase()) ||
      o.technician?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    const matchesType = filterType === "all" || o.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleView = (item: MaintenanceOrder) => {
    setViewingItem(item);
  };

  const handleEdit = (item: MaintenanceOrder) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleStart = async (item: MaintenanceOrder) => {
    try {
      await maintenanceService.start(item.id);
      showToast("info", "Mantenimiento iniciado", item.code);
      fetchItems();
      fetchStats();
    } catch (error: any) {
      showToast("error", "Error", error?.message || "No se pudo iniciar");
    }
  };

  const handleComplete = async (item: MaintenanceOrder) => {
    try {
      await maintenanceService.complete(item.id);
      showToast("success", "Mantenimiento completado", item.code);
      fetchItems();
      fetchStats();
    } catch (error: any) {
      showToast("error", "Error", error?.message || "No se pudo completar");
    }
  };

  const handleCancel = async (item: MaintenanceOrder) => {
    try {
      await maintenanceService.updateStatus(item.id, "cancelled");
      showToast("warning", "Orden cancelada", item.code);
      fetchItems();
      fetchStats();
    } catch (error: any) {
      showToast("error", "Error", error?.message || "No se pudo cancelar");
    }
  };

  const handleSubmit = async (data: CreateMaintenanceOrderDto) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        await maintenanceService.update(editingItem.id, data);
        showToast("success", "Orden actualizada", "");
      } else {
        await maintenanceService.create(data);
        showToast("success", "Orden creada", "");
      }
      setModalOpen(false);
      setEditingItem(null);
      fetchItems();
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <ERPLayout title="Mantenimiento" subtitle="Gestión de ordenes de mantenimiento">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mantenimiento</h1>
              <p className="text-muted-foreground">Gestión de mantenimiento preventivo, correctivo y predictivo</p>
            </div>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Orden
            </Button>
          </div>

          <MantenimientoStatsCards
            total={stats.total}
            pending={stats.pending}
            inProgress={stats.inProgress}
            completed={stats.completed}
            totalCost={stats.totalCost}
          />

          <MantenimientoTable
            items={filteredItems}
            search={search}
            filterStatus={filterStatus}
            filterType={filterType}
            onSearchChange={setSearch}
            onFilterStatusChange={setFilterStatus}
            onFilterTypeChange={setFilterType}
            onView={handleView}
            onEdit={handleEdit}
            onStart={handleStart}
            onComplete={handleComplete}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>

        <MantenimientoFormDialog
          open={modalOpen}
          onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingItem(null); }}
          editingItem={editingItem}
          machines={machines}
          onSubmit={handleSubmit}
          loading={submitting}
        />

        <MantenimientoViewDialog
          open={!!viewingItem}
          onOpenChange={(open) => { if (!open) setViewingItem(null); }}
          item={viewingItem}
        />
      </ERPLayout>
    </ProtectedRoute>
  );
}
