"use client";

import { useState, useEffect, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { materialsService, purchaseOrdersService, suppliersService } from "@/lib/services";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { MaterialTable } from "./components/MaterialTable";
import { MaterialFormDialog } from "./components/MaterialFormDialog";
import { PurchaseOrderForm } from "@/components/forms/PurchaseOrderForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Material } from "@/lib/types";

export default function MaterialesPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Estado para diálogo de orden de compra (surtir)
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);
  const [restockMaterial, setRestockMaterial] = useState<Material | null>(null);

  // Estado para suppliers y materials del formulario
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [materialsForOrder, setMaterialsForOrder] = useState<any[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);
  const [materialsLoading, setMaterialsLoading] = useState(true);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalMaterials, setTotalMaterials] = useState(0);

  // Refs para controlar llamadas
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFetchingRef = useRef(false);
  const hasInitialLoadRef = useRef(false);

  // Función para obtener materiales con paginación
  const fetchMaterials = async (searchValue: string, page: number = 1) => {
    // Evitar múltiples llamadas simultáneas
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);

    try {
      const params: any = { page };
      if (searchValue && searchValue.trim()) {
        params.search = searchValue.trim();
      }

      const response = await materialsService.getAll(params);

      const data = Array.isArray(response?.data) ? response.data : [];
      setMaterials(data);
      setCurrentPage(response?.currentPage || 1);
      setLastPage(response?.lastPage || 1);
      setTotalMaterials(response?.total || 0);
    } catch (error: any) {
      showToast("error", "Error al cargar materiales", error?.message || "Error desconocido");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Carga inicial - solo una vez
  useEffect(() => {
    if (hasInitialLoadRef.current) return;
    hasInitialLoadRef.current = true;
    
    fetchMaterials("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar suppliers y materials para el formulario de orden de compra
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [suppliersRes, materialsRes] = await Promise.all([
          suppliersService.selectList(),
          materialsService.selectList(),
        ]);
        setSuppliers(suppliersRes || []);
        setMaterialsForOrder(materialsRes || []);
      } catch (error) {
        console.error("Error loading form data:", error);
      } finally {
        setSuppliersLoading(false);
        setMaterialsLoading(false);
      }
    };
    fetchFormData();
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    if (!hasInitialLoadRef.current) return;
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1); // Reset a página 1 al buscar
      fetchMaterials(search, 1);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Cambio de página
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= lastPage) {
      fetchMaterials(search, newPage);
    }
  };

  const handleDelete = async () => {
    if (!deletingMaterial) return;
    setSubmitting(true);
    try {
      await materialsService.delete(Number(deletingMaterial.id));
      showToast("success", "Material eliminado", "");
      setDeletingMaterial(null);
      fetchMaterials(search, currentPage);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (material: Material) => {
    setEditingMaterial(material);
    setModalOpen(true);
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    setEditingMaterial(null);
    fetchMaterials(search, currentPage);
  };

  const handleFormCancel = () => {
    setModalOpen(false);
    setEditingMaterial(null);
  };

  // Abrir diálogo de surtir (crear orden de compra)
  const handleRestock = (material: Material) => {
    setRestockMaterial(material);
    setRestockDialogOpen(true);
  };

  // Crear orden de compra
  const [creatingOrder, setCreatingOrder] = useState(false);

  const handlePurchaseOrderSubmit = async (data: any) => {
    setCreatingOrder(true);
    try {
      await purchaseOrdersService.create(data);
      showToast("success", "Orden creada", "La orden de compra se ha creado correctamente");
      setRestockDialogOpen(false);
      setRestockMaterial(null);
    } catch (error: any) {
      const errorMessage = error?.message || "No se pudo crear la orden";
      showToast("error", "Error", errorMessage);
    } finally {
      setCreatingOrder(false);
    }
  };

  return (
    <ERPLayout title="Materiales" subtitle="Gestión de materiales del inventario">
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Materiales</h1>
            <p className="text-muted-foreground">Gestión de materiales del inventario</p>
          </div>
          <Button onClick={() => { setEditingMaterial(null); setModalOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Material
          </Button>
        </div>

        <MaterialTable
          materials={materials}
          search={search}
          onSearchChange={setSearch}
          onEdit={openEditModal}
          onDelete={setDeletingMaterial}
          onRestock={handleRestock}
          loading={loading}
        />

        {/* Paginación */}
        {totalMaterials > 0 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {materials.length} de {totalMaterials} materiales
            </p>
            {lastPage > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  Página {currentPage} de {lastPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === lastPage || loading}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <MaterialFormDialog
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingMaterial(null); }}
        editingMaterial={editingMaterial}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />

      <ConfirmDialog
        open={!!deletingMaterial}
        onOpenChange={() => setDeletingMaterial(null)}
        title="Eliminar Material"
        description={`¿Estás seguro de eliminar el material "${deletingMaterial?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
      />

      {/* Dialog para crear orden de compra (surtir) */}
      <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Surtir Material</DialogTitle>
            <DialogDescription>
              Crear orden de compra para el material: {restockMaterial?.name}
            </DialogDescription>
          </DialogHeader>
          <PurchaseOrderForm
            defaultValues={{
              material_id: restockMaterial?.id,
              material_name: restockMaterial?.name,
              unit_price: restockMaterial?.cost || 0,
              quantity: 1,
              iva_percentage: 16,
            }}
            onSubmit={handlePurchaseOrderSubmit}
            isLoading={creatingOrder}
            suppliers={suppliers}
            materials={materialsForOrder}
            suppliersLoading={suppliersLoading}
            materialsLoading={materialsLoading}
          />
        </DialogContent>
      </Dialog>
    </ERPLayout>
  );
}
