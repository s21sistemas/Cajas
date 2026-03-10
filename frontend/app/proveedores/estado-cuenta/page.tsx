"use client";

import { useState, useEffect, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { suppliersService } from "@/lib/services/suppliers.service";
import { useApiQuery } from "@/hooks/use-api-query";
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

interface StatementFilters {
  supplier_id?: number;
  status?: string;
  per_page?: number;
  page?: number;
  search?: string;
}

export default function SupplierAccountPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Fetch statements
  const { data: statementsResponse, loading: statementsLoading, refetch: refetchStatements } = useApiQuery(
    (): Promise<any> => {
      const filters: StatementFilters = { page: currentPage };
      if (search.trim()) filters.search = search.trim();
      return suppliersService.getStatements(filters);
    },
    { enabled: true }
  );

  // Fetch stats from backend
  const { data: statsResponse, loading: statsLoading } = useApiQuery(
    () => suppliersService.getStatementsStats(),
    { enabled: true }
  );

  const statements: SupplierStatementResponse[] = statementsResponse?.data || [];
  const stats: SupplierStats | null = statsResponse ? {
    totalInvoices: statsResponse.totalInvoices ?? 0,
    totalPayable: statsResponse.totalPayable ?? 0,
    totalOverdue: statsResponse.totalOverdue ?? 0,
    totalPaid: statsResponse.totalPaid ?? 0,
  } : null;

  // Update pagination from response
  useEffect(() => {
    if (statementsResponse) {
      setCurrentPage(statementsResponse.currentPage || 1);
      setLastPage(statementsResponse.lastPage || 1);
      setTotalItems(statementsResponse.total || 0);
    }
  }, [statementsResponse]);

  // Refetch when page changes
  useEffect(() => {
    if (!isInitialMount.current) {
      refetchStatements();
    }
  }, [currentPage]);

  // Search with debounce
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
      refetchStatements();
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  // Page change handler
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= lastPage) {
      setCurrentPage(newPage);
    }
  };

  // Get unique suppliers for filter
  const suppliers: string[] = [...new Set(statements.map((s) => s.supplierName))];

  // Filter locally
  const filtered = statements.filter((s) => {
    const matchesSearch =
      s.code?.toLowerCase().includes(search.toLowerCase()) ||
      s.supplierName?.toLowerCase().includes(search.toLowerCase()) ||
      s.concept?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesSupplier = supplierFilter === "all" || s.supplierName === supplierFilter;
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const loading = statementsLoading || statsLoading;

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
            totalInvoices={stats?.totalInvoices ?? 0}
            totalPayable={stats?.totalPayable ?? 0}
            totalOverdue={stats?.totalOverdue ?? 0}
            totalPaid={stats?.totalPaid ?? 0}
            loading={statsLoading}
          />

          <SupplierAccountTable
            items={filtered}
            search={search}
            onSearchChange={setSearch}
            loading={statementsLoading}
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
