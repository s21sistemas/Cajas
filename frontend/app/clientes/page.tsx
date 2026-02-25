
"use client";

import { useState, useEffect, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { clientsService, type ClientStats } from "@/lib/services";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { ClientStatsCards } from "./components/ClientStatsCards";
import { ClientTable } from "./components/ClientTable";
import { ClientFormDialog } from "./components/ClientFormDialog";
import { ClientViewDialog } from "./components/ClientViewDialog";
import type { Client } from "@/lib/types";

export default function ClientsPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState<ClientStats>({
    total: 0,
    active: 0,
    inactive: 0,
    blocked: 0,
    totalCredit: 0,
    totalBalance: 0,
  });
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  
  // Refs para controlar llamadas
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Función para obtener estadísticas
  const fetchStats = async () => {
    try {
      const statsData = await clientsService.getStats();
      setStats(statsData);
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  // Función para obtener clientes con paginación
  const fetchClients = async (searchValue: string, page: number = 1) => {    
    setLoading(true);
    
    try {
      // Solo enviar search si tiene valor
      const params: any = { page };
      if (searchValue && searchValue.trim()) {
        params.search = searchValue.trim();
      }
      
      const response = await clientsService.getAll(params);
      
      const data = Array.isArray(response?.data) ? response.data : [];
      setClients(data);
      setCurrentPage(response?.currentPage || 1);
      setLastPage(response?.lastPage || 1);
      setTotalClients(response?.total || 0);
    } catch (error: any) {
      showToast("error", "Error al cargar clientes", error?.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial - solo una vez
  useEffect(() => {
    fetchClients("");
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
      fetchClients(search, 1);
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
      fetchClients(search, newPage);
    }
  };

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      if (editingClient) {
        await clientsService.update(Number(editingClient.id), data);
        showToast("success", "Cliente actualizado", "");
      } else {
        await clientsService.create(data);
        showToast("success", "Cliente creado", "");
      }
      setModalOpen(false);
      setEditingClient(null);
      fetchClients(search, currentPage);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingClient) return;
    setSubmitting(true);
    try {
      await clientsService.delete(Number(deletingClient.id));
      showToast("success", "Cliente eliminado", "");
      setDeletingClient(null);
      fetchClients(search, currentPage);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  const formatCurrency = (value: number | null) => {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value || 0);
  };

  return (
    <ProtectedRoute>
      <ERPLayout title="Clientes" subtitle="Gestiona tu cartera de clientes">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
              <p className="text-muted-foreground">Gestiona tu cartera de clientes</p>
            </div>
            <Button onClick={() => { setEditingClient(null); setModalOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Cliente
            </Button>
          </div>

          <ClientStatsCards
            total={stats.total}
            active={stats.active}
            totalCredit={stats.totalCredit}
            totalBalance={stats.totalBalance}
            formatCurrency={formatCurrency}
          />

          <ClientTable
            clients={clients}
            search={search}
            onSearchChange={setSearch}
            onView={setViewingClient}
            onEdit={openEditModal}
            onDelete={setDeletingClient}
            formatCurrency={formatCurrency}
            loading={loading}
          />

          {/* Paginación */}
          {totalClients > 0 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {clients.length} de {totalClients} clientes
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

        <ClientFormDialog
          open={modalOpen}
          onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingClient(null); }}
          editingClient={editingClient}
          onSubmit={handleSubmit}
          loading={submitting}
        />

        <ClientViewDialog
          client={viewingClient}
          open={!!viewingClient}
          onOpenChange={() => setViewingClient(null)}
          formatCurrency={formatCurrency}
        />

        <ConfirmDialog
          open={!!deletingClient}
          onOpenChange={() => setDeletingClient(null)}
          title="Eliminar Cliente"
          description={`¿Estás seguro de eliminar a ${deletingClient?.name}? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          variant="destructive"
          onConfirm={handleDelete}
        />
      </ERPLayout>
    </ProtectedRoute>
  );
}
