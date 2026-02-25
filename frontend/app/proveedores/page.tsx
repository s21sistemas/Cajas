"use client";

import { useState, useEffect, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { suppliersService } from "@/lib/services";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { ProveedoresStatsCards } from "./components/ProveedoresStatsCards";
import { ProveedoresTable } from "./components/ProveedoresTable";
import { ProveedoresFormDialog } from "./components/ProveedoresFormDialog";
import { ProveedoresViewDialog } from "./components/ProveedoresViewDialog";
import type { Supplier, CreateSupplierDto } from "@/lib/types";

interface SupplierStats {
  total: number;
  active: number;
  totalBalance: number;
  avgLeadTime: number;
}

export default function ProveedoresPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<Supplier | null>(null);
  const [editingItem, setEditingItem] = useState<Supplier | null>(null);
  const [deletingItem, setDeletingItem] = useState<Supplier | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState<SupplierStats>({
    total: 0,
    active: 0,
    totalBalance: 0,
    avgLeadTime: 0,
  });

  // Refs
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Función para obtener estadísticas desde el backend
  const fetchStats = async () => {
    try {
      const statsData = await suppliersService.getStats();
      setStats({
        total: statsData.total || 0,
        active: statsData.active || 0,
        totalBalance: statsData.totalBalance || 0,
        avgLeadTime: statsData.avgLeadTime || 0,
      });
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  // Función para obtener items
  const fetchItems = async (searchValue: string) => {
    setLoading(true);

    try {
      const params: any = {};
      if (searchValue && searchValue.trim()) {
        params.search = searchValue.trim();
      }

      const response = await suppliersService.getAll(params);

      const data = Array.isArray(response?.data) ? response.data : [];
      setItems(data);
    } catch (error: any) {
      showToast("error", "Error al cargar proveedores", error?.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    fetchItems("");
    fetchStats();
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
      fetchItems(search);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleView = (item: Supplier) => {
    setViewingItem(item);
  };

  const handleEdit = (item: Supplier) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setSubmitting(true);
    try {
      await suppliersService.delete(deletingItem.id);
      showToast("success", "Proveedor eliminado", "");
      setDeletingItem(null);
      fetchItems(search);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (data: CreateSupplierDto) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        await suppliersService.update(editingItem.id, data);
        showToast("success", "Proveedor actualizado", "");
      } else {
        await suppliersService.create(data);
        showToast("success", "Proveedor creado", "");
      }
      setModalOpen(false);
      setEditingItem(null);
      fetchItems(search);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ERPLayout title="Proveedores" subtitle="Gestiona tus proveedores y sus condiciones">
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Proveedores</h1>
            <p className="text-muted-foreground">Gestiona tus proveedores y sus condiciones</p>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Proveedor
          </Button>
        </div>

        <ProveedoresStatsCards
          total={stats.total}
          active={stats.active}
          totalBalance={stats.totalBalance}
          avgLeadTime={stats.avgLeadTime}
        />

        <ProveedoresTable
          items={items}
          search={search}
          onSearchChange={setSearch}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={setDeletingItem}
          loading={loading}
        />
      </div>

      <ProveedoresFormDialog
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingItem(null); }}
        editingItem={editingItem}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      <ProveedoresViewDialog
        open={!!viewingItem}
        onOpenChange={(open) => { if (!open) setViewingItem(null); }}
        item={viewingItem}
      />

      <ConfirmDialog
        open={!!deletingItem}
        onOpenChange={() => setDeletingItem(null)}
        title="Eliminar Proveedor"
        description={`¿Estás seguro de eliminar "${deletingItem?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </ERPLayout>
  );
}
