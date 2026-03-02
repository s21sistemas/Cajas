"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, AlertTriangle, Package, Layers, MapPin, TrendingUp } from "lucide-react";
import { inventoryService } from "@/lib/services/inventory.service";
import type { WarehouseLocation, CreateWarehouseLocationDto, UpdateWarehouseLocationDto } from "@/lib/types/inventory.types";
import { UbicacionesStatsCards } from "./components/UbicacionesStatsCards";
import { UbicacionesTable } from "./components/UbicacionesTable";
import { UbicacionesFormDialog } from "./components/UbicacionesFormDialog";

interface StatsData {
  total: number;
  totalCapacity: number;
  totalOccupancy: number;
  averageOccupancy: number;
}

export default function AlmacenUbicacionesPage() {
  const { showToast } = useToast();
  
  // Data states
  const [items, setItems] = useState<WarehouseLocation[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    totalCapacity: 0,
    totalOccupancy: 0,
    averageOccupancy: 0,
  });
  
  // Loading states
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Filter states
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  
  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseLocation | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  
  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<WarehouseLocation | null>(null);

  // Load data
  const loadItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      const response = await inventoryService.getLocationsPaginated({
        page,
        perPage,
        search: search || undefined,
      });
      setItems(response.data || []);
      setTotalItems(response.meta?.total || 0);
      setLastPage(response.meta?.last_page || 1);
    } catch (error) {
      console.error("Error loading locations:", error);
      showToast("error", "Error", "No se pudieron cargar las ubicaciones.");
    } finally {
      setLoadingItems(false);
    }
  }, [page, perPage, search, showToast]);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const response = await inventoryService.getWarehouseStats();
      setStats({
        total: response.totalLocations || 0,
        totalCapacity: response.totalCapacity || 0,
        totalOccupancy: response.totalOccupancy || 0,
        averageOccupancy: response.utilizationPercentage || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Initial load - only once
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadItems();
      loadStats();
    }
  }, [loadItems, loadStats]);

  // Handle search with debounce
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) return;
    
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Handlers
  const handleCreate = () => {
    setEditingItem(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const handleEdit = (item: WarehouseLocation) => {
    setEditingItem(item);
    setFormMode("edit");
    setFormOpen(true);
  };

  const handleDelete = (item: WarehouseLocation) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: CreateWarehouseLocationDto | UpdateWarehouseLocationDto) => {
    try {
      if (formMode === "create") {
        await inventoryService.createLocation(data as CreateWarehouseLocationDto);
        showToast("success", "Éxito", "Ubicación creada correctamente.");
      } else if (editingItem) {
        await inventoryService.updateLocation(editingItem.id, data as UpdateWarehouseLocationDto);
        showToast("success", "Éxito", "Ubicación actualizada correctamente.");
      }
      loadItems();
      loadStats();
    } catch (error) {
      console.error("Error saving location:", error);
      showToast("error", "Error", "No se pudo guardar la ubicación.");
      throw error;
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    
    try {
      await inventoryService.deleteLocation(deletingItem.id);
      showToast("success", "Éxito", "Ubicación eliminada correctamente.");
      loadItems();
      loadStats();
    } catch (error) {
      console.error("Error deleting location:", error);
      showToast("error", "Error", "No se pudo eliminar la ubicación.");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingItem(null);
    }
  };

  return (
    <ERPLayout title="Almacén - Ubicaciones" subtitle="Gestión de ubicaciones de almacén">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ubicaciones de Almacén</h1>
            <p className="text-muted-foreground">
              Administra las ubicaciones de tu almacén
            </p>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Ubicación
          </Button>
        </div>

        {/* Stats Cards */}
        {loadingStats ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-4">
                  <Skeleton className="h-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <UbicacionesStatsCards
            total={stats.total}
            totalCapacity={stats.totalCapacity}
            totalOccupancy={stats.totalOccupancy}
            averageOccupancy={stats.averageOccupancy}
          />
        )}

        {/* Table */}
        <UbicacionesTable
          items={items}
          search={search}
          onSearchChange={setSearch}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loadingItems}
          currentPage={page}
          lastPage={lastPage}
          totalItems={totalItems}
          onPageChange={setPage}
        />

        {/* Form Dialog */}
        <UbicacionesFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={handleFormSubmit}
          initialData={editingItem}
          mode={formMode}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          title="¿Estás seguro de eliminar esta ubicación?"
          description={`Esta acción no se puede deshacer. La ubicación "${deletingItem?.name}" será eliminada permanentemente.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="destructive"
        />
      </div>
    </ERPLayout>
  );
}
