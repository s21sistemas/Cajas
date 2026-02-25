"use client";

import { useState, useEffect, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { clientsService, type BranchStats } from "@/lib/services";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { BranchStatsCards } from "./components/BranchStatsCards";
import { BranchTable } from "./components/BranchTable";
import { BranchFormDialog } from "./components/BranchFormDialog";
import type { Branch, Client } from "@/lib/types";

export default function BranchesPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState<BranchStats>({
    total: 0,
    active: 0,
    inactive: 0,
    cities: 0,
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalBranches, setTotalBranches] = useState(0);

  // Refs
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Función para obtener estadísticas
  const fetchStats = async () => {
    try {
      const statsData = await clientsService.getBranchStats();
      setStats(statsData);
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  // Función para obtener clientes (para el select)
  const fetchClients = async () => {
    try {
      const response = await clientsService.getAll({});
      const data = Array.isArray(response?.data) ? response.data : [];
      setClients(data);
    } catch (error: any) {
      console.error("Error al cargar clientes:", error);
    }
  };

  // Función para obtener sucursales con paginación
  const fetchBranches = async (searchValue: string, page: number = 1) => {
    setLoading(true);

    try {
      // Solo enviar search si tiene valor
      const params: any = { page };
      if (searchValue && searchValue.trim()) {
        params.search = searchValue.trim();
      }

      const response = await clientsService.getBranches(params);

      const data = Array.isArray(response?.data) ? response.data : [];
      setBranches(data);
      setCurrentPage(response?.currentPage || 1);
      setLastPage(response?.lastPage || 1);
      setTotalBranches(response?.total || 0);
    } catch (error: any) {
      showToast("error", "Error al cargar sucursales", error?.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    fetchBranches("");
    fetchStats();
    fetchClients();
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
      fetchBranches(search, 1);
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
      fetchBranches(search, newPage);
    }
  };

  const handleCreate = () => {
    setEditingBranch(null);
    setModalOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingBranch) return;
    setSubmitting(true);
    try {
      await clientsService.deleteBranch(deletingBranch.id);
      showToast("success", "Sucursal eliminada", "");
      setDeletingBranch(null);
      fetchBranches(search, currentPage);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (data: any) => {
    if (data.clientId === 0) {
      showToast("error", "Error", "Debes seleccionar un cliente");
      return;
    }

    setSubmitting(true);
    try {
      if (editingBranch) {
        await clientsService.updateBranch(editingBranch.id, data);
        showToast("success", "Sucursal actualizada", "");
      } else {
        await clientsService.createBranch(data);
        showToast("success", "Sucursal creada", "");
      }
      setModalOpen(false);
      setEditingBranch(null);
      fetchBranches(search, currentPage);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <ERPLayout title="Sucursales" subtitle="Gestiona las sucursales de clientes">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sucursales</h1>
              <p className="text-muted-foreground">Gestiona las sucursales de clientes</p>
            </div>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Sucursal
            </Button>
          </div>

          <BranchStatsCards
            total={stats.total}
            active={stats.active}
            inactive={stats.inactive}
            cities={stats.cities}
          />

          <BranchTable
            branches={branches}
            search={search}
            onSearchChange={setSearch}
            onEdit={handleEdit}
            onDelete={setDeletingBranch}
            loading={loading}
            currentPage={currentPage}
            lastPage={lastPage}
            totalBranches={totalBranches}
            onPageChange={handlePageChange}
          />
        </div>

        <BranchFormDialog
          open={modalOpen}
          onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingBranch(null); }}
          editingBranch={editingBranch}
          clients={clients}
          onSubmit={handleSubmit}
          loading={submitting}
        />

        <ConfirmDialog
          open={!!deletingBranch}
          onOpenChange={() => setDeletingBranch(null)}
          title="Eliminar Sucursal"
          description={`¿Estás seguro de eliminar la sucursal "${deletingBranch?.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          variant="destructive"
          onConfirm={handleDelete}
        />
      </ERPLayout>
    </ProtectedRoute>
  );
}
