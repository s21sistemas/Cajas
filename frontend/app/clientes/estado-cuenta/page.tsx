"use client";

import { useState, useEffect, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { accountStatementsService, type AccountStatement } from "@/lib/services/account-statements.service";
import { clientsService } from "@/lib/services";
import { ClientAccountStatsCards } from "./components/ClientAccountStatsCards";
import { ClientAccountTable } from "./components/ClientAccountTable";

interface ClientStats {
  totalInvoices: number;
  totalReceivable: number;
  totalOverdue: number;
  totalPaid: number;
}

export default function ClientAccountPage() {
  const [statements, setStatements] = useState<AccountStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Stats
  const [stats, setStats] = useState<ClientStats>({
    totalInvoices: 0,
    totalReceivable: 0,
    totalOverdue: 0,
    totalPaid: 0,
  });

  // Lista de clientes
  const [clientsList, setClientsList] = useState<{ id: number; name: string }[]>([]);

  // Refs
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Función para obtener statements paginados (sin stats)
  const fetchStatements = async (searchValue: string, page: number = 1) => {
    setLoading(true);
    try {
      const params: any = { page };
      
      if (searchValue && searchValue.trim()) {
        params.search = searchValue.trim();
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (clientFilter !== 'all') {
        params.client_id = clientFilter;
      }
      
      // Obtener datos paginados
      const response = await accountStatementsService.getAll(params);
      
      setStatements(response.data);
      setCurrentPage(response.currentPage);
      setLastPage(response.lastPage);
      setTotalItems(response.total);
    } catch (error) {
      console.error("Error fetching statements:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener estadísticas (solo se llama una vez al inicio)
  const fetchStats = async () => {
    try {
      const statsResponse = await accountStatementsService.getStats();
      console.log('Stats response:', statsResponse);
      setStats({
        totalInvoices: statsResponse.totalInvoices,
        totalReceivable: statsResponse.totalReceivable,
        totalOverdue: statsResponse.totalOverdue,
        totalPaid: statsResponse.totalPaid,
      });
      console.log('After setStats, current stats state:', stats); // Agregado para debug
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Función para obtener lista de clientes
  const fetchClients = async () => {
    try {
      const response = await clientsService.selectList();
      setClientsList(response || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  // Carga inicial - solo una vez al montar el componente
  useEffect(() => {
    fetchStatements("");
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
      fetchStatements(search, 1);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Cambio de filtros
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    setCurrentPage(1);
    fetchStatements(search, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, clientFilter]);

  // Cambio de página
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= lastPage) {
      fetchStatements(search, newPage);
    }
  };

  // Lista de clientes para filtro
  const clientOptions = clientsList.map(c => c.name);

  const formatCurrency = (value: number | null | undefined) => {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
  };

  return (
    <ProtectedRoute>
      <ERPLayout title="Estado de Cuenta" subtitle="Clientes">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Estado de Cuenta - Clientes</h1>
              <p className="text-muted-foreground">
                Consulta el estado de cuenta de tus clientes
              </p>
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>

          <ClientAccountStatsCards
            totalInvoices={stats.totalInvoices}
            totalReceivable={stats.totalReceivable}
            totalOverdue={stats.totalOverdue}
            totalPaid={stats.totalPaid}
            formatCurrency={formatCurrency}
          />

          <ClientAccountTable
            items={statements as any}
            search={search}
            onSearchChange={setSearch}
            loading={loading}
            currentPage={currentPage}
            lastPage={lastPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            clients={clientOptions}
            clientFilter={clientFilter}
            onClientFilterChange={setClientFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>
      </ERPLayout>
    </ProtectedRoute>
  );
}
