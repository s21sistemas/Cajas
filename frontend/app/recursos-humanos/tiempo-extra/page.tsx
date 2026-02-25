"use client";

import { useState, useEffect, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Clock, DollarSign } from "lucide-react";
import { hrService } from "@/lib/services";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { OvertimeTable } from "./components/OvertimeTable";
import { OvertimeFormDialog } from "./components/OvertimeFormDialog";
import type { Overtime } from "@/lib/types/hr.types";

export default function OvertimePage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [overtime, setOvertime] = useState<Overtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOvertime, setEditingOvertime] = useState<Overtime | null>(null);
  const [deletingOvertime, setDeletingOvertime] = useState<Overtime | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Stats calculated from data
  const [stats, setStats] = useState({
    total: 0,
    totalHours: 0,
    totalAmount: 0,
    pending: 0,
  });
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Refs para controlar llamadas
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Función para obtener estadísticas
  const fetchStats = (data: Overtime[]) => {
    setStats({
      total: data.length,
      totalHours: data.reduce((sum, o) => sum + (o.hours || 0), 0),
      totalAmount: data.reduce((sum, o) => sum + (o.amount || 0), 0),
      pending: data.filter((o) => o.status === "pending").length,
    });
  };

  // Función para obtener tiempo extra con paginación
  const fetchOvertime = async (searchValue: string, page: number = 1) => {    
    setLoading(true);
    
    try {
      const params: any = { page };
      if (searchValue && searchValue.trim()) {
        params.search = searchValue.trim();
      }
      
      const response = await hrService.getOvertime(params);
      
      const data = Array.isArray(response?.data) ? response.data : [];
      setOvertime(data);
      setCurrentPage(response?.currentPage || 1);
      setLastPage(response?.lastPage || 1);
      setTotalItems(response?.total || 0);
      fetchStats(data);
    } catch (error: any) {
      console.error("Error fetching overtime:", error);
      showToast("error", "Error", "No se pudieron cargar los registros de tiempo extra");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial - solo una vez
  useEffect(() => {
    fetchOvertime("");
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
      fetchOvertime(search, 1);
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
      fetchOvertime(search, newPage);
    }
  };

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      if (editingOvertime) {
        await hrService.updateOvertime(editingOvertime.id, data);
        showToast("success", "Éxito", "Tiempo extra actualizado correctamente");
      } else {
        await hrService.createOvertime(data);
        showToast("success", "Éxito", "Tiempo extra registrado correctamente");
      }
      setModalOpen(false);
      setEditingOvertime(null);
      fetchOvertime(search, currentPage);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingOvertime) return;
    setSubmitting(true);
    try {
      await hrService.deleteOvertime(deletingOvertime.id);
      showToast("success", "Éxito", "Tiempo extra eliminado correctamente");
      setDeletingOvertime(null);
      fetchOvertime(search, currentPage);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (overtime: Overtime) => {
    setEditingOvertime(overtime);
    setModalOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  return (
    <ERPLayout title="Tiempo Extra" subtitle="Gestiona las horas extra del personal">
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tiempo Extra</h1>
            <p className="text-muted-foreground">Gestiona las horas extra del personal</p>
          </div>
          <Button onClick={() => { setEditingOvertime(null); setModalOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Registrar Tiempo Extra
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-foreground truncate">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Registros</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-foreground truncate">{stats.totalHours}</p>
                  <p className="text-xs text-muted-foreground">Total Horas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-green-500 truncate">{formatCurrency(stats.totalAmount)}</p>
                  <p className="text-xs text-muted-foreground">Total Monto</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-yellow-500 truncate">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <OvertimeTable
          overtime={overtime}
          search={search}
          onSearchChange={setSearch}
          onEdit={openEditModal}
          onDelete={setDeletingOvertime}
          loading={loading}
        />

        {/* Paginación */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {overtime.length} de {totalItems} registros
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

      <OvertimeFormDialog
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingOvertime(null); }}
        editingOvertime={editingOvertime}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      <ConfirmDialog
        open={!!deletingOvertime}
        onOpenChange={() => setDeletingOvertime(null)}
        title="Eliminar Tiempo Extra"
        description={`¿Estás seguro de eliminar el registro de tiempo extra de ${deletingOvertime?.employeeName}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </ERPLayout>
  );
}
