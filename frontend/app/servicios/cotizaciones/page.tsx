"use client";

import { useState, useEffect, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Upload } from "lucide-react";
import { quotesService, type QuoteStats } from "@/lib/services";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { QuoteStatsCards } from "./components/QuoteStatsCards";
import { QuoteTable } from "./components/QuoteTable";
import { QuoteFormDialog } from "./components/QuoteFormDialog";
import { QuoteViewDialog } from "./components/QuoteViewDialog";
import type { Quote } from "@/lib/types";

export default function CotizacionesPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [viewingQuote, setViewingQuote] = useState<Quote | null>(null);
  const [deletingQuote, setDeletingQuote] = useState<Quote | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [approvingQuote, setApprovingQuote] = useState<Quote | null>(null);
  const [uploadingQuote, setUploadingQuote] = useState<Quote | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState("");
  const [stats, setStats] = useState<QuoteStats>({
    total: 0,
    draft: 0,
    sent: 0,
    approved: 0,
    rejected: 0,
    expired: 0,
    totalValue: 0,
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalQuotes, setTotalQuotes] = useState(0);

  // Refs
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Función para obtener estadísticas
  const fetchStats = async () => {
    try {
      const statsData = await quotesService.getStats();
      setStats(statsData);
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  // Función para obtener cotizaciones con paginación
  const fetchQuotes = async (searchValue: string, page: number = 1) => {
    setLoading(true);

    try {
      const params: any = { page };
      if (searchValue && searchValue.trim()) {
        params.search = searchValue.trim();
      }

      const response = await quotesService.getAll(params);

      const data = Array.isArray(response?.data) ? response.data : [];
      setQuotes(data);
      setCurrentPage(response?.currentPage || 1);
      setLastPage(response?.lastPage || 1);
      setTotalQuotes(response?.total || 0);
    } catch (error: any) {
      showToast("error", "Error al cargar cotizaciones", error?.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    fetchQuotes("");
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
      fetchQuotes(search, 1);
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
      fetchQuotes(search, newPage);
    }
  };

  const handleCreate = () => {
    setEditingQuote(null);
    setModalOpen(true);
  };

  const handleView = async (quote: Quote) => {
    try {
      // Cargar la cotización completa con items
      const fullQuote = await quotesService.getById(quote.id);
      setViewingQuote(fullQuote);
    } catch (error: any) {
      showToast("error", "Error al cargar cotización", error?.message || "Error desconocido");
    }
  };

  const handleEdit = async (quote: Quote) => {
    try {
      // Cargar la cotización completa con items
      const fullQuote = await quotesService.getById(quote.id);
      setEditingQuote(fullQuote);
      setModalOpen(true);
    } catch (error: any) {
      showToast("error", "Error al cargar cotización", error?.message || "Error desconocido");
    }
  };

  const handleDelete = async () => {
    if (!deletingQuote) return;
    setSubmitting(true);
    try {
      await quotesService.delete(deletingQuote.id);
      showToast("success", "Cotización eliminada", "");
      setDeletingQuote(null);
      fetchQuotes(search, currentPage);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      if (editingQuote) {
        await quotesService.update(editingQuote.id, data);
        showToast("success", "Cotización actualizada", "");
      } else {
        await quotesService.create(data);
        showToast("success", "Cotización creada", "");
      }
      setModalOpen(false);
      setEditingQuote(null);
      fetchQuotes(search, currentPage);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendEmail = async (quote: Quote) => {
    setSubmitting(true);
    try {
      await quotesService.sendEmail(quote.id);
      showToast("success", "Cotización enviada", "Se ha enviado la cotización al correo del cliente");
      fetchQuotes(search, currentPage);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error al enviar", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async (quote: Quote) => {
    try {
      await quotesService.downloadPdf(quote.id);
      showToast("success", "PDF descargado", "La cotización se ha descargado correctamente");
    } catch (error: any) {
      const errorMessage = error?.message || "Error desconocido";
      showToast("error", "Error al descargar", errorMessage);
    }
  };

  const handleApprove = async (quote: Quote) => {
    setApprovingQuote(quote);
  };

  const handleConfirmApprove = async () => {
    if (!approvingQuote) return;
    setSubmitting(true);
    try {
      await quotesService.update(approvingQuote.id, { status: 'approved' });
      showToast("success", "Cotización aprobada", "La cotización ha sido aprobada correctamente");
      setApprovingQuote(null);
      fetchQuotes(search, currentPage);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error al aprobar", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadDocument = (quote: Quote) => {
    setUploadingQuote(quote);
    setUploadFile(null);
    setUploadNotes("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleSubmitUpload = async () => {
    if (!uploadingQuote || !uploadFile) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('document', uploadFile);
      formData.append('notes', uploadNotes);
      
      await quotesService.approveDocument(uploadingQuote.id, formData);
      showToast("success", "Documento subido", "El documento se ha subido correctamente y la cotización ha sido aprobada");
      setUploadingQuote(null);
      setUploadFile(null);
      setUploadNotes("");
      fetchQuotes(search, currentPage);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error al subir documento", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number | null) => {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value || 0);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    // Parse date as YYYY-MM-DD format to avoid timezone issues
    const [year, month, day] = dateStr.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <ProtectedRoute>
      <ERPLayout title="Cotizaciones" subtitle="Gestión de cotizaciones">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Cotizaciones</h1>
              <p className="text-muted-foreground">Gestión de cotizaciones</p>
            </div>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Cotización
            </Button>
          </div>

          <QuoteStatsCards
            total={stats.total}
            draft={stats.draft}
            sent={stats.sent}
            approved={stats.approved}
            rejected={stats.rejected}
            totalValue={stats.totalValue}
            formatCurrency={formatCurrency}
          />

          <QuoteTable
            quotes={quotes}
            search={search}
            onSearchChange={setSearch}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={setDeletingQuote}
            onSendEmail={handleSendEmail}
            onDownloadPdf={handleDownloadPdf}
            onApprove={handleApprove}
            onUploadDocument={handleUploadDocument}
            loading={loading}
            currentPage={currentPage}
            lastPage={lastPage}
            totalQuotes={totalQuotes}
            onPageChange={handlePageChange}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </div>

        <QuoteFormDialog
          open={modalOpen}
          onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingQuote(null); }}
          editingQuote={editingQuote}
          onSubmit={handleSubmit}
          loading={submitting}
        />

        <QuoteViewDialog
          open={!!viewingQuote}
          onOpenChange={() => setViewingQuote(null)}
          quote={viewingQuote}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />

        <ConfirmDialog
          open={!!deletingQuote}
          onOpenChange={() => setDeletingQuote(null)}
          title="Eliminar Cotización"
          description={`¿Estás seguro de eliminar la cotización "${deletingQuote?.code}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          variant="destructive"
          onConfirm={handleDelete}
        />

        <ConfirmDialog
          open={!!approvingQuote}
          onOpenChange={() => setApprovingQuote(null)}
          title="Aprobar Cotización"
          description={`¿Estás seguro de aprobar la cotización "${approvingQuote?.code}"? Esta acción cambiará el estado a aprobado.`}
          confirmText="Aprobar"
          onConfirm={handleConfirmApprove}
        />

        <Dialog open={!!uploadingQuote} onOpenChange={() => setUploadingQuote(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subir Documento de Aprobación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="document">Documento (PDF, JPG, PNG)</Label>
                <Input
                  id="document"
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={handleFileChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Input
                  id="notes"
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="Notas adicionales"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadingQuote(null)} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitUpload} disabled={!uploadFile || submitting}>
                {submitting ? 'Subiendo...' : 'Subir y Aprobar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ERPLayout>
    </ProtectedRoute>
  );
}
