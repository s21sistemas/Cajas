"use client";

import { useState, useEffect, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { operatorsService, type OperatorStats } from "@/lib/services";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { OperatorStatsCards } from "./components/OperatorStatsCards";
import { OperatorTable } from "./components/OperatorTable";
import { OperatorFormDialog } from "./components/OperatorFormDialog";
import { OperatorViewDialog } from "./components/OperatorViewDialog";
import type { Operator, CreateOperatorDto } from "@/lib/types";

export default function OperadoresPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [viewingOperator, setViewingOperator] = useState<Operator | null>(null);
  const [deletingOperator, setDeletingOperator] = useState<Operator | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState<OperatorStats>({
    total: 0,
    active: 0,
    inactive: 0,
  });
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalOperators, setTotalOperators] = useState(0);
  
  // Refs para controlar llamadas
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Función para obtener estadísticas
  const fetchStats = async () => {
    try {
      const statsData = await operatorsService.getStats();
      setStats(statsData);
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  // Función para obtener operadores con paginación
  const fetchOperators = async (searchValue: string, page: number = 1) => {    
    setLoading(true);
    
    try {
      const params: any = { page };
      if (searchValue && searchValue.trim()) {
        params.search = searchValue.trim();
      }
      
      const response = await operatorsService.getAll(params);
      
      const data = Array.isArray(response?.data) ? response.data : [];
      setOperators(data);
      setCurrentPage(response?.currentPage || 1);
      setLastPage(response?.lastPage || 1);
      setTotalOperators(response?.total || 0);
    } catch (error: any) {
      showToast("error", "Error al cargar operadores", error?.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial - solo una vez
  useEffect(() => {
    fetchOperators("");
    fetchStats();
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
      setCurrentPage(1); // Reset a página 1 al buscar
      fetchOperators(search, 1);
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
      fetchOperators(search, newPage);
    }
  };

  const handleSubmit = async (data: CreateOperatorDto) => {
    setSubmitting(true);
    try {
      if (editingOperator) {
        await operatorsService.update(Number(editingOperator.id), data);
        showToast("success", "Operador actualizado", "");
      } else {
        await operatorsService.create(data);
        showToast("success", "Operador creado", "");
      }
      setModalOpen(false);
      setEditingOperator(null);
      fetchOperators(search, currentPage);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingOperator) return;
    setSubmitting(true);
    try {
      await operatorsService.delete(Number(deletingOperator.id));
      showToast("success", "Operador eliminado", "");
      setDeletingOperator(null);
      fetchOperators(search, currentPage);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (operator: Operator) => {
    setEditingOperator(operator);
    setModalOpen(true);
  };

  return (
    <ProtectedRoute requiredPermission="operators.view">
      <ERPLayout title="Operadores" subtitle="Gestión de operadores de producción">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Operadores</h1>
              <p className="text-muted-foreground">Gestión de operadores de producción</p>
            </div>
            <Button onClick={() => { setEditingOperator(null); setModalOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Operador
            </Button>
          </div>

          <OperatorStatsCards
            total={stats.total}
            active={stats.active}
          />

          <OperatorTable
            operators={operators}
            search={search}
            onSearchChange={setSearch}
            onView={setViewingOperator}
            onEdit={openEditModal}
            onDelete={setDeletingOperator}
            loading={loading}
            currentPage={currentPage}
            lastPage={lastPage}
            totalItems={totalOperators}
            onPageChange={handlePageChange}
          />

          {/* Paginación */}
          {totalOperators > 0 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {operators.length} de {totalOperators} operadores
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

        <OperatorFormDialog
          open={modalOpen}
          onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingOperator(null); }}
          editingOperator={editingOperator}
          onSubmit={handleSubmit}
          loading={submitting}
        />

        <OperatorViewDialog
          operator={viewingOperator}
          open={!!viewingOperator}
          onOpenChange={() => setViewingOperator(null)}
        />

        <ConfirmDialog
          open={!!deletingOperator}
          onOpenChange={() => setDeletingOperator(null)}
          title="Eliminar Operador"
          description={`¿Estás seguro de eliminar al operador "${deletingOperator?.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          variant="destructive"
          onConfirm={handleDelete}
        />
      </ERPLayout>
    </ProtectedRoute>
  );
}
