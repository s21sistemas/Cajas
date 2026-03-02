"use client";

import { useState, useEffect, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { processesService } from "@/lib/services";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { ProcessStatsCards } from "./components/ProcessStatsCards";
import { ProcessTable } from "./components/ProcessTable";
import { ProcessFormDialog } from "./components/ProcessFormDialog";
import type { CreateProcessDto, Process, ProcessStats } from "@/lib/types";

export default function ProcesosPage() {
  return (
    <ProtectedRoute requiredPermission="processes.view">
      <ProcesosPageInner />
    </ProtectedRoute>
  );
}

function ProcesosPageInner() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [deletingProcess, setDeletingProcess] = useState<Process | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [stats, setStats] = useState<ProcessStats>({
    total: 0,
    active: 0,
    inactive: 0,
    byType: {},
    withMachine: 0,
    withoutMachine: 0,
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalProcesses, setTotalProcesses] = useState(0);

  // Refs para controlar llamadas
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);
  const isFetchingRef = useRef(false);
  const hasInitialLoadRef = useRef(false);

  // Función para obtener estadísticas
  const fetchStats = async () => {
    try {
      const statsData = await processesService.getStats();
      setStats(statsData);
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  // Función para obtener procesos con paginación
  const fetchProcesses = async (searchValue: string, page: number = 1) => {
    // Evitar múltiples llamadas simultáneas
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);

    try {
      const params: any = { page };
      if (searchValue && searchValue.trim()) {
        params.search = searchValue.trim();
      }

      const response = await processesService.getAll(params);

      const data = Array.isArray(response?.data) ? response.data : [];
      setProcesses(data);
      setCurrentPage(response?.currentPage || 1);
      setLastPage(response?.lastPage || 1);
      setTotalProcesses(response?.total || 0);
    } catch (error: any) {
      showToast("error", "Error al cargar procesos", error?.message || "Error desconocido");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Carga inicial - solo una vez
  useEffect(() => {
    if (hasInitialLoadRef.current) return;
    hasInitialLoadRef.current = true;
    
    fetchProcesses("");
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    if (!hasInitialLoadRef.current) return;
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1); // Reset a página 1 al buscar
      fetchProcesses(search, 1);
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
      fetchProcesses(search, newPage);
    }
  };

  const handleSubmit = async (data: CreateProcessDto) => {
    setSubmitting(true);
    setFormErrors({});
    try {
      if (editingProcess) {
        await processesService.update(Number(editingProcess.id), data);
        showToast("success", "Proceso actualizado", "");
      } else {
        await processesService.create(data);
        showToast("success", "Proceso creado", "");
      }
      setModalOpen(false);
      setEditingProcess(null);
      fetchProcesses(search, currentPage);
      fetchStats();
    } catch (error: any) {
      const errors = error?.errors;
      if (errors) {
        setFormErrors(errors);
        const errorMessages = Object.entries(errors).map(([field, msgs]: [string, any]) => `${field}: ${msgs.join(', ')}`);
        showToast("error", "Error de validación", errorMessages.join('\n'));
      } else {
        const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
        showToast("error", "Error", errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProcess) return;
    setSubmitting(true);
    try {
      await processesService.delete(Number(deletingProcess.id));
      showToast("success", "Proceso eliminado", "");
      setDeletingProcess(null);
      fetchProcesses(search, currentPage);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (process: Process) => {
    setEditingProcess(process);
    setModalOpen(true);
  };

  return (
    <ERPLayout title="Procesos" subtitle="Gestión de procesos de producción">
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Procesos</h1>
            <p className="text-muted-foreground">Gestión de procesos de producción</p>
          </div>
          <Button onClick={() => { setEditingProcess(null); setModalOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Proceso
          </Button>
        </div>

        <ProcessStatsCards
          total={stats.total}
          active={stats.active}
          inactive={stats.inactive}
          withMachine={stats.withMachine}
        />

        <ProcessTable
          processes={processes}
          search={search}
          onSearchChange={setSearch}
          onEdit={openEditModal}
          onDelete={setDeletingProcess}
          loading={loading}
        />

        {/* Paginación */}
        {totalProcesses > 0 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {processes.length} de {totalProcesses} procesos
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

      <ProcessFormDialog
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) { setEditingProcess(null); setFormErrors({}); } }}
        editingProcess={editingProcess}
        onSubmit={handleSubmit}
        loading={submitting}
        errors={formErrors}
      />

      <ConfirmDialog
        open={!!deletingProcess}
        onOpenChange={() => setDeletingProcess(null)}
        title="Eliminar Proceso"
        description={`¿Estás seguro de eliminar el proceso "${deletingProcess?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </ERPLayout>
  );
}
