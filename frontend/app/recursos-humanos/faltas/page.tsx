"use client";

import { useState, useEffect, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, FileText, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { hrService } from "@/lib/services";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { AbsenceTable } from "./components/AbsenceTable";
import { AbsenceFormDialog } from "./components/AbsenceFormDialog";
import type { Absence } from "@/lib/types/hr.types";

export default function AbsencesPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState<Absence | null>(null);
  const [deletingAbsence, setDeletingAbsence] = useState<Absence | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Stats calculated from data
  const [stats, setStats] = useState({
    total: 0,
    justified: 0,
    unjustified: 0,
    totalDeduction: 0,
  });
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Refs para controlar llamadas
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Función para obtener estadísticas
  const fetchStats = (data: Absence[]) => {
    setStats({
      total: data.length,
      justified: data.filter((a) => a.status === "justified").length,
      unjustified: data.filter((a) => a.status === "registered" || a.status === "discounted").length,
      totalDeduction: data.reduce((sum, a) => sum + (a.deduction || 0), 0),
    });
  };

  // Función para obtener faltas con paginación
  const fetchAbsences = async (searchValue: string, page: number = 1) => {    
    setLoading(true);
    
    try {
      const params: any = { page };
      if (searchValue && searchValue.trim()) {
        params.search = searchValue.trim();
      }
      
      const response = await hrService.getAbsences(params);
      
      const data = Array.isArray(response?.data) ? response.data : [];
      setAbsences(data);
      setCurrentPage(response?.currentPage || 1);
      setLastPage(response?.lastPage || 1);
      setTotalItems(response?.total || 0);
      fetchStats(data);
    } catch (error: any) {
      console.error("Error fetching absences:", error);
      showToast("error", "Error", "No se pudieron cargar las faltas");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial - solo una vez
  useEffect(() => {
    fetchAbsences("");
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
      fetchAbsences(search, 1);
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
      fetchAbsences(search, newPage);
    }
  };

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      if (editingAbsence) {
        await hrService.updateAbsence(editingAbsence.id, data);
        showToast("success", "Éxito", "Falta actualizada correctamente");
      } else {
        await hrService.createAbsence(data);
        showToast("success", "Éxito", "Falta registrada correctamente");
      }
      setModalOpen(false);
      setEditingAbsence(null);
      fetchAbsences(search, currentPage);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAbsence) return;
    setSubmitting(true);
    try {
      await hrService.deleteAbsence(deletingAbsence.id);
      showToast("success", "Éxito", "Falta eliminada correctamente");
      setDeletingAbsence(null);
      fetchAbsences(search, currentPage);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (absence: Absence) => {
    setEditingAbsence(absence);
    setModalOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  return (
    <ERPLayout title="Faltas y Retardos" subtitle="Control de ausencias de empleados">
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Faltas y Retardos</h1>
            <p className="text-muted-foreground">Control de ausencias de empleados</p>
          </div>
          <Button onClick={() => { setEditingAbsence(null); setModalOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Registrar Falta
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-foreground truncate">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Faltas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-green-500 truncate">{stats.justified}</p>
                  <p className="text-xs text-muted-foreground">Justificadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-red-500 truncate">{stats.unjustified}</p>
                  <p className="text-xs text-muted-foreground">Sin Justificar</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-foreground truncate">{formatCurrency(stats.totalDeduction)}</p>
                  <p className="text-xs text-muted-foreground">Total Descuentos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <AbsenceTable
          absences={absences}
          search={search}
          onSearchChange={setSearch}
          onEdit={openEditModal}
          onDelete={setDeletingAbsence}
          loading={loading}
        />

        {/* Paginación */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {absences.length} de {totalItems} faltas
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

      <AbsenceFormDialog
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingAbsence(null); }}
        editingAbsence={editingAbsence}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      <ConfirmDialog
        open={!!deletingAbsence}
        onOpenChange={() => setDeletingAbsence(null)}
        title="Eliminar Falta"
        description={`¿Estás seguro de eliminar la falta de ${deletingAbsence?.employeeName}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </ERPLayout>
  );
}
