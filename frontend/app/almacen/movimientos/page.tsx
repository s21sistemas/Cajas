"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { inventoryService } from "@/lib/services/inventory.service";
import { useToast } from "@/components/erp/action-toast";
import type { WarehouseMovement, WarehouseMovementStats } from "@/lib/types";

import { MovimientosStatsCards } from "./components/MovimientosStatsCards";
import { MovimientosTable } from "./components/MovimientosTable";

export default function MovimientosAlmacenPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [movements, setMovements] = useState<WarehouseMovement[]>([]);
  
  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalMovements, setTotalMovements] = useState(0);
  
  // Stats
  const [stats, setStats] = useState({
    totalIn: 0,
    totalOut: 0,
    transfers: 0,
    pending: 0,
  });

  // Refs
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  const fetchMovements = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const filters: any = { page, per_page: 15 };
      if (search && search.trim()) {
        filters.search = search.trim();
      }
      if (typeFilter && typeFilter !== "all") {
        filters.movement_type = typeFilter;
      }
      if (statusFilter && statusFilter !== "all") {
        filters.status = statusFilter;
      }
      
      const response = await inventoryService.getMovements(filters);
      // Laravel devuelve la paginación en formato snake_case
      const data = response?.data || [];
      setMovements(data);
      setCurrentPage((response as any)?.currentPage || (response as any)?.current_page || page);
      setLastPage((response as any)?.lastPage || (response as any)?.last_page || 1);
      setTotalMovements((response as any)?.total || 0);
      
      // Fetch stats
      const statsData = await inventoryService.getMovementStats();
      setStats({
        totalIn: statsData.total_income || 0,
        totalOut: statsData.total_expense || 0,
        transfers: statsData.total_adjustments || 0,
        pending: statsData.pending_movements || 0,
      });
    } catch (error: any) {
      console.error("Error fetching movements:", error);
      showToast("error", "Error", "No se pudieron cargar los movimientos");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, showToast]);

  // Initial load - only once with isInitialMount ref
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchMovements();
    }
  }, [fetchMovements]);

  // Search and filter with debounce
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
      fetchMovements(1);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search, typeFilter, statusFilter]);

  const handlePageChange = (page: number) => {
    fetchMovements(page);
  };

  return (
    <ERPLayout title="Almacén" subtitle="Movimientos de Inventario">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Movimientos de Almacén</h1>
            <p className="text-muted-foreground">
              Historial de entradas, salidas y transferencias de inventario
            </p>
          </div>
        </div>

        <MovimientosStatsCards
          totalIn={stats.totalIn}
          totalOut={stats.totalOut}
          transfers={stats.transfers}
          pending={stats.pending}
        />

        <MovimientosTable
          movements={movements}
          search={search}
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          onSearchChange={setSearch}
          onTypeFilterChange={setTypeFilter}
          onStatusFilterChange={setStatusFilter}
          currentPage={currentPage}
          lastPage={lastPage}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>
    </ERPLayout>
  );
}
