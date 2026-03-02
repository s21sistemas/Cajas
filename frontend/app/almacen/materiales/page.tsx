"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { inventoryService } from "@/lib/services/inventory.service";
import type { InventoryItem, CreateInventoryItemDto } from "@/lib/types";

import { MaterialesStatsCards } from "./components/MaterialesStatsCards";
import { MaterialesTable } from "./components/MaterialesTable";
import { MaterialesFormDialog } from "./components/MaterialesFormDialog";
import { MaterialesMovimientoDialog } from "./components/MaterialesMovimientoDialog";

export default function MaterialesPage() {
  const { showToast } = useToast();
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Movement dialog
  const [movementOpen, setMovementOpen] = useState(false);
  const [movementItem, setMovementItem] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<"entry" | "exit">("entry");
  
  // Stats
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    byCategory: {} as Record<string, number>,
  });

  // Refs
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Fetch items
  const fetchItems = useCallback(async (searchValue: string = "") => {
    setLoading(true);
    try {
      const params: any = { per_page: 100, category: "raw_material" };
      if (searchValue && searchValue.trim()) {
        params.search = searchValue.trim();
      }
      const response = await inventoryService.getAll(params);
      const data = response?.data || [];
      setItems(data);
    } catch (error: any) {
      console.error("Error cargando materiales:", error);
      showToastRef.current("error", "Error", "No se pudieron cargar los materiales");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await inventoryService.getStats();
      setStats({
        totalItems: statsData.totalItems || 0,
        totalValue: statsData.totalValue || 0,
        lowStockItems: statsData.lowStockItems || 0,
        byCategory: statsData.byCategory || {},
      });
    } catch (error: any) {
      console.error("Error cargando estadísticas:", error);
    }
  }, []);

  // Initial load - only once with isInitialMount ref
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchItems();
      fetchStats();
    }
  }, [fetchItems, fetchStats]);

  // Search with debounce - solo se ejecuta cuando search cambia despues del primer render
  useEffect(() => {
    // Skip inicial
    if (search === "") return;

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
  }, [search, fetchItems]);

  // Handlers
  const handleSubmit = async (data: CreateInventoryItemDto) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        await inventoryService.update(Number(editingItem.id), data);
        showToast("success", "Material actualizado", "");
      } else {
        await inventoryService.create(data);
        showToast("success", "Material creado", "");
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

  const handleDelete = async () => {
    if (!deletingItem) return;
    setSubmitting(true);
    try {
      await inventoryService.delete(Number(deletingItem.id));
      showToast("success", "Material eliminado", "");
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

  const handleMovement = async (data: { quantity: number; reference?: string; notes?: string }) => {
    if (!movementItem) return;
    setSubmitting(true);
    try {
      await inventoryService.recordMovement(Number(movementItem.id), {
        type: movementType === "entry" ? "in" : "out",
        quantity: data.quantity,
        reason: data.notes || data.reference || (movementType === "entry" ? "Entrada de material" : "Salida de material"),
        reference: data.reference,
      });
      showToast("success", 
        movementType === "entry" ? "Entrada registrada" : "Salida registrada", 
        ""
      );
      setMovementOpen(false);
      setMovementItem(null);
      fetchItems(search);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const openEntryModal = (item: InventoryItem) => {
    setMovementItem(item);
    setMovementType("entry");
    setMovementOpen(true);
  };

  const openExitModal = (item: InventoryItem) => {
    setMovementItem(item);
    setMovementType("exit");
    setMovementOpen(true);
  };

  return (
    <ERPLayout title="Almacén de Materiales" subtitle="Gestión de inventario de materiales">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Materiales</h1>
            <p className="text-muted-foreground">
              Administra el inventario de materias primas, componentes y consumibles
            </p>
          </div>
          <Button onClick={() => { setEditingItem(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Material
          </Button>
        </div>

        <MaterialesStatsCards
          totalItems={stats.totalItems}
          totalValue={stats.totalValue}
          lowStockItems={stats.lowStockItems}
          byCategory={stats.byCategory}
        />

        <MaterialesTable
          items={items}
          search={search}
          onSearchChange={setSearch}
          onEdit={openEditModal}
          onDelete={setDeletingItem}
          onEntry={openEntryModal}
          onExit={openExitModal}
          loading={loading}
        />

        <MaterialesFormDialog
          open={modalOpen}
          onOpenChange={setModalOpen}
          defaultValues={editingItem || undefined}
          onSubmit={handleSubmit}
          isLoading={submitting}
        />

        <MaterialesMovimientoDialog
          open={movementOpen}
          onOpenChange={setMovementOpen}
          item={movementItem}
          type={movementType}
          onSubmit={handleMovement}
          isLoading={submitting}
        />

        <ConfirmDialog
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          onConfirm={handleDelete}
          title="Eliminar Material"
          description={`¿Estás seguro de que deseas eliminar "${deletingItem?.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          variant="destructive"
        />
      </div>
    </ERPLayout>
  );
}
