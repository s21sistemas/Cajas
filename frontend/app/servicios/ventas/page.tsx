"use client";

import { useState, useEffect, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { serviceOrdersService, salesService } from "@/lib/services";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { SaleStatsCards } from "./components/SaleStatsCards";
import { SaleTable } from "./components/SaleTable";
import { SaleFormDialog } from "./components/SaleFormDialog";
import { SaleViewDialog } from "./components/SaleViewDialog";
import type { Sale } from "@/lib/types/service-order.types";

export default function VentasPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [deletingSale, setDeletingSale] = useState<Sale | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    total: 0,
    pending: 0,
    paid: 0,
    totalAmount: 0,
    totalPaid: 0,
  });
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalSales, setTotalSales] = useState(0);
  
  // Refs para controlar llamadas
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Función para obtener estadísticas
  const fetchStats = async () => {
    try {
      const statsData = await salesService.getStats();
      setStats(statsData);
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error?.message || error);
      // Usar valores por defecto si falla
      setStats({
        total: 0,
        pending: 0,
        paid: 0,
        totalAmount: 0,
        totalPaid: 0,
      });
    }
  };

  // Función para obtener ventas con paginación
  const fetchSales = async (searchValue: string, page: number = 1) => {    
    setLoading(true);
    
    try {
      const params: any = { page };
      if (searchValue && searchValue.trim()) {
        params.search = searchValue.trim();
      }
      
      const response = await serviceOrdersService.getSales(params);
      
      const data = Array.isArray(response?.data) ? response.data : [];
      setSales(data);
      setCurrentPage((response as any)?.current_page || 1);
      setLastPage((response as any)?.last_page || 1);
      setTotalSales(response?.total || 0);
    } catch (error: any) {
      showToast("error", "Error al cargar ventas", error?.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial - solo una vez
  useEffect(() => {
    fetchSales("");
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
      setCurrentPage(1);
      fetchSales(search, 1);
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
      fetchSales(search, newPage);
    }
  };

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (editingSale) {
        await salesService.update(editingSale.id, data);
        showToast("success", "Venta actualizada", "");
      } else {
        await salesService.create(data);
        showToast("success", "Venta creada", "");
      }
      setModalOpen(false);
      setEditingSale(null);
      fetchSales(search, currentPage);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      // Check if it's a validation error with field errors
      if (error?.response?.data?.errors) {
        setSubmitError(error);
        // Don't close modal, show field errors
      } else {
        showToast("error", "Error", errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSale) return;
    setSubmitting(true);
    try {
      await salesService.delete(deletingSale.id);
      showToast("success", "Venta eliminada", "");
      setDeletingSale(null);
      fetchSales(search, currentPage);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async (sale: Sale) => {
    try {
      const blob = await salesService.exportPdf(sale.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `venta-${sale.code}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast("success", "PDF descargado", "");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error al descargar PDF";
      showToast("error", "Error", errorMessage);
    }
  };

  const openEditModal = (sale: Sale) => {
    setEditingSale(sale);
    setModalOpen(true);
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
  };

  return (
    <ProtectedRoute>
      <ERPLayout title="Ventas" subtitle="Gestiona las ventas">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Ventas</h1>
              <p className="text-muted-foreground">Gestiona las ventas</p>
            </div>
            <Button onClick={() => { setEditingSale(null); setModalOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Venta
            </Button>
          </div>

          <SaleStatsCards
            total={stats.total || sales.length}
            totalAmount={stats.totalAmount || sales.reduce((sum, s) => sum + (s.total || 0), 0)}
            formatCurrency={formatCurrency}
          />

          <SaleTable
            sales={sales}
            search={search}
            onSearchChange={setSearch}
            onView={setViewingSale}
            onEdit={openEditModal}
            onDelete={setDeletingSale}
            onDownloadPdf={handleDownloadPdf}
            formatCurrency={formatCurrency}
            loading={loading}
          />

          {/* Paginación */}
          {totalSales > 0 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {sales.length} de {totalSales} ventas
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

        <SaleFormDialog
          open={modalOpen}
          onOpenChange={(open) => { setModalOpen(open); if (!open) { setEditingSale(null); setSubmitError(null); } }}
          editingSale={editingSale}
          onSubmit={handleSubmit}
          loading={submitting}
          error={submitError}
        />

        <SaleViewDialog
          sale={viewingSale}
          open={!!viewingSale}
          onOpenChange={() => setViewingSale(null)}
          formatCurrency={formatCurrency}
        />

        <ConfirmDialog
          open={!!deletingSale}
          onOpenChange={() => setDeletingSale(null)}
          title="Eliminar Venta"
          description={`¿Estás seguro de eliminar la venta "${deletingSale?.code}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          variant="destructive"
          onConfirm={handleDelete}
        />
      </ERPLayout>
    </ProtectedRoute>
  );
}
