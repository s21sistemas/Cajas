"use client";

import { useState, useEffect, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { suppliersService } from "@/lib/services/suppliers.service";
import { SupplierAccountStatsCards } from "./components/SupplierAccountStatsCards";
import { SupplierAccountTable } from "./components/SupplierAccountTable";

interface SupplierStatementResponse {
  id: number;
  code: string;
  supplierId: number;
  supplierName: string;
  date: string;
  dueDate: string;
  amount: number;
  paid: number;
  balance: number;
  status: "paid" | "pending" | "overdue" | "partial";
  concept: string;
}

interface SupplierStats {
  totalInvoices: number;
  totalPayable: number;
  totalOverdue: number;
  totalPaid: number;
}

export default function SupplierAccountPage() {
  const [statements, setStatements] = useState<SupplierStatementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Stats
  const [stats, setStats] = useState<SupplierStats>({
    totalInvoices: 0,
    totalPayable: 0,
    totalOverdue: 0,
    totalPaid: 0,
  });

  // Refs
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Función para obtener statements
  const fetchStatements = async (searchValue: string, page: number = 1) => {
    setLoading(true);
    try {
      const params: any = { page };
      if (searchValue && searchValue.trim()) {
        params.search = searchValue.trim();
      }
      const response = await suppliersService.getStatements(params);
      const statementsData = response.data || response;
      setStatements(statementsData);
      setCurrentPage(response?.currentPage || 1);
      setLastPage(response?.lastPage || 1);
      setTotalItems(response?.total || 0);
    } catch (error) {
      console.error("Error fetching statements:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener estadísticas
  const fetchStats = async () => {
    try {
      const allStatements = await suppliersService.getStatements({});
      const data = allStatements.data || allStatements;
      setStats({
        totalInvoices: data.length,
        totalPayable: data.reduce((sum: number, s: SupplierStatementResponse) => sum + s.balance, 0),
        totalOverdue: data.filter((s: SupplierStatementResponse) => s.status === "overdue").reduce((sum: number, s: SupplierStatementResponse) => sum + s.balance, 0),
        totalPaid: data.reduce((sum: number, s: SupplierStatementResponse) => sum + s.paid, 0),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Carga inicial
  useEffect(() => {
    fetchStatements("");
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
      fetchStatements(search, 1);
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
      fetchStatements(search, newPage);
    }
  };

  // Obtener proveedores únicos para el filtro
  const suppliers = [...new Set(statements.map((s) => s.supplierName))];

  // Filtrar datos localmente
  const filtered = statements.filter((s) => {
    const matchesSearch =
      s.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.supplierName?.toLowerCase().includes(search.toLowerCase()) ||
      s.concept?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesSupplier = supplierFilter === "all" || s.supplierName === supplierFilter;
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  return (
    <ProtectedRoute>
      <ERPLayout title="Estado de Cuenta" subtitle="Proveedores">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Estado de Cuenta - Proveedores</h1>
              <p className="text-muted-foreground">
                Consulta el estado de cuenta con tus proveedores
              </p>
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>

          <SupplierAccountStatsCards
            totalInvoices={stats.totalInvoices}
            totalPayable={stats.totalPayable}
            totalOverdue={stats.totalOverdue}
            totalPaid={stats.totalPaid}
          />

          <SupplierAccountTable
            items={filtered}
            search={search}
            onSearchChange={setSearch}
            loading={loading}
            currentPage={currentPage}
            lastPage={lastPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            suppliers={suppliers}
            supplierFilter={supplierFilter}
            onSupplierFilterChange={setSupplierFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>
      </ERPLayout>
    </ProtectedRoute>
  );
}
