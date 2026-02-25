"use client";

import { useState, useEffect, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { hrService } from "@/lib/services";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { DisabilityStatsCards } from "./components/DisabilityStatsCards";
import { DisabilityTable } from "./components/DisabilityTable";
import { DisabilityFormDialog } from "./components/DisabilityFormDialog";
import type { Disability } from "@/lib/types/hr.types";

export default function DisabilitiesPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [disabilities, setDisabilities] = useState<Disability[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDisability, setEditingDisability] = useState<Disability | null>(null);
  const [deletingDisability, setDeletingDisability] = useState<Disability | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Stats calculated from data
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    totalDays: 0,
  });
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Refs para controlar llamadas
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Función para obtener estadísticas
  const fetchStats = (data: Disability[]) => {
    setStats({
      total: data.length,
      active: data.filter((d) => d.status === "active").length,
      pending: data.filter((d) => d.status === "pending").length,
      totalDays: data.reduce((sum, d) => sum + (d.days || 0), 0),
    });
  };

  // Función para obtener incapacidades con paginación
  const fetchDisabilities = async (searchValue: string, page: number = 1) => {    
    setLoading(true);
    
    try {
      const params: any = { page };
      if (searchValue && searchValue.trim()) {
        params.search = searchValue.trim();
      }
      
      const response = await hrService.getDisabilities(params);
      
      const data = Array.isArray(response?.data) ? response.data : [];
      setDisabilities(data);
      setCurrentPage(response?.currentPage || 1);
      setLastPage(response?.lastPage || 1);
      setTotalItems(response?.total || 0);
      fetchStats(data);
    } catch (error: any) {
      console.error("Error fetching disabilities:", error);
      showToast("error", "Error", "No se pudieron cargar las incapacidades");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial - solo una vez
  useEffect(() => {
    fetchDisabilities("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    // Skip en el montaje inicial
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchDisabilities(search, 1);
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
      fetchDisabilities(search, newPage);
    }
  };

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      if (editingDisability) {
        await hrService.updateDisability(editingDisability.id, data);
        showToast("success", "Éxito", "Incapacidad actualizada correctamente");
      } else {
        await hrService.createDisability(data);
        showToast("success", "Éxito", "Incapacidad creada correctamente");
      }
      setModalOpen(false);
      setEditingDisability(null);
      fetchDisabilities(search, currentPage);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDisability) return;
    setSubmitting(true);
    try {
      await hrService.deleteDisability(deletingDisability.id);
      showToast("success", "Éxito", "Incapacidad eliminada correctamente");
      setDeletingDisability(null);
      fetchDisabilities(search, currentPage);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (disability: Disability) => {
    setEditingDisability(disability);
    setModalOpen(true);
  };

  return (
    <ERPLayout title="Incapacidades" subtitle="Gestiona las incapacidades del personal">
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Incapacidades</h1>
            <p className="text-muted-foreground">Gestiona las incapacidades del personal</p>
          </div>
          <Button onClick={() => { setEditingDisability(null); setModalOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Incapacidad
          </Button>
        </div>

        <DisabilityStatsCards
          total={stats.total}
          active={stats.active}
          pending={stats.pending}
          totalDays={stats.totalDays}
        />

        <DisabilityTable
          disabilities={disabilities}
          search={search}
          onSearchChange={setSearch}
          onEdit={openEditModal}
          onDelete={setDeletingDisability}
          loading={loading}
        />

        {/* Paginación */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {disabilities.length} de {totalItems} incapacidades
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

      <DisabilityFormDialog
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingDisability(null); }}
        editingDisability={editingDisability}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      <ConfirmDialog
        open={!!deletingDisability}
        onOpenChange={() => setDeletingDisability(null)}
        title="Eliminar Incapacidad"
        description={`¿Estás seguro de eliminar la incapacidad ${deletingDisability?.folio}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </ERPLayout>
  );
}
