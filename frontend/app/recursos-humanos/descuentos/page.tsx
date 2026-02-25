"use client";

import { useState, useEffect, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { hrService } from "@/lib/services";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { DiscountTable } from "./components/DiscountTable";
import { DiscountFormDialog } from "./components/DiscountFormDialog";
import type { Discount } from "@/lib/types/hr.types";

export default function DiscountsPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [deletingDiscount, setDeletingDiscount] = useState<Discount | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Stats calculated from data
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    active: 0,
    paused: 0,
  });
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Refs para controlar llamadas
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Función para obtener estadísticas
  const fetchStats = (data: Discount[]) => {
    setStats({
      total: data.length,
      totalAmount: data.reduce((sum, d) => sum + (d.amount || 0), 0),
      active: data.filter((d) => d.status === "active").length,
      paused: data.filter((d) => d.status === "paused").length,
    });
  };

  // Función para obtener descuentos con paginación
  const fetchDiscounts = async (searchValue: string, page: number = 1) => {    
    setLoading(true);
    
    try {
      const params: any = { page };
      if (searchValue && searchValue.trim()) {
        params.search = searchValue.trim();
      }
      
      const response = await hrService.getDiscounts(params);
      
      const data = Array.isArray(response?.data) ? response.data : [];
      setDiscounts(data);
      setCurrentPage(response?.currentPage || 1);
      setLastPage(response?.lastPage || 1);
      setTotalItems(response?.total || 0);
      fetchStats(data);
    } catch (error: any) {
      console.error("Error fetching discounts:", error);
      showToast("error", "Error", "No se pudieron cargar los descuentos");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial - solo una vez
  useEffect(() => {
    fetchDiscounts("");
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
      setCurrentPage(1);
      fetchDiscounts(search, 1);
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
      fetchDiscounts(search, newPage);
    }
  };

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      if (editingDiscount) {
        await hrService.updateDiscount(editingDiscount.id, data);
        showToast("success", "Éxito", "Descuento actualizado correctamente");
      } else {
        await hrService.createDiscount(data);
        showToast("success", "Éxito", "Descuento creado correctamente");
      }
      setModalOpen(false);
      setEditingDiscount(null);
      fetchDiscounts(search, currentPage);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDiscount) return;
    setSubmitting(true);
    try {
      await hrService.deleteDiscount(deletingDiscount.id);
      showToast("success", "Éxito", "Descuento eliminado correctamente");
      setDeletingDiscount(null);
      fetchDiscounts(search, currentPage);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePause = async (id: number) => {
    try {
      await hrService.pauseDiscount(id);
      showToast("success", "Éxito", "Descuento pausado correctamente");
      fetchDiscounts(search, currentPage);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    }
  };

  const handleResume = async (id: number) => {
    try {
      await hrService.resumeDiscount(id);
      showToast("success", "Éxito", "Descuento reanudado correctamente");
      fetchDiscounts(search, currentPage);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await hrService.completeDiscount(id);
      showToast("success", "Éxito", "Descuento marcado como completado");
      fetchDiscounts(search, currentPage);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    }
  };

  const openEditModal = (discount: Discount) => {
    setEditingDiscount(discount);
    setModalOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  return (
    <ERPLayout title="Descuentos y Préstamos" subtitle="Gestiona los descuentos de nómina del personal">
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Descuentos y Préstamos</h1>
            <p className="text-muted-foreground">Gestiona los descuentos de nómina del personal</p>
          </div>
          <Button onClick={() => { setEditingDiscount(null); setModalOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Descuento
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Descuentos</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Monto Total</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.totalAmount)}</p>
          </div>
          <div className="bg-card border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Activos</p>
            <p className="text-2xl font-bold text-green-400">{stats.active}</p>
          </div>
          <div className="bg-card border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Pausados</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.paused}</p>
          </div>
        </div>

        <DiscountTable
          discounts={discounts}
          search={search}
          onSearchChange={setSearch}
          onEdit={openEditModal}
          onDelete={setDeletingDiscount}
          onPause={handlePause}
          onResume={handleResume}
          onComplete={handleComplete}
          loading={loading}
        />

        {/* Paginación */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {discounts.length} de {totalItems} descuentos
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

      <DiscountFormDialog
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingDiscount(null); }}
        editingDiscount={editingDiscount}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      <ConfirmDialog
        open={!!deletingDiscount}
        onOpenChange={() => setDeletingDiscount(null)}
        title="Eliminar Descuento"
        description={`¿Estás seguro de eliminar el descuento de ${deletingDiscount?.employeeName}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </ERPLayout>
  );
}
