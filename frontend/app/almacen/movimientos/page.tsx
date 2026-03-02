"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { api } from "@/lib/api";
import { useToast } from "@/components/erp/action-toast";

import { MovimientosStatsCards } from "./components/MovimientosStatsCards";
import { MovimientosTable } from "./components/MovimientosTable";

interface WarehouseMovement {
  id: number;
  inventory_item_id: number;
  movement_type: "income" | "expense" | "adjustment" | "transfer";
  quantity: number;
  warehouse_location_id: number | null;
  warehouse_location_to_id: number | null;
  reference_type: string | null;
  reference_id: number | null;
  notes: string | null;
  performed_by: string | null;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
  inventoryItem?: {
    id: number;
    code: string;
    name: string;
    unit: string;
  };
  warehouseLocation?: {
    id: number;
    name: string;
    zone: string;
  };
}

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
      const params: any = { page, per_page: 15 };
      if (search && search.trim()) {
        params.search = search.trim();
      }
      if (typeFilter && typeFilter !== "all") {
        params.movement_type = typeFilter;
      }
      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter;
      }
      
      const response = await api.get<any>("/warehouse-movements", params);
      const data = response?.data?.data || response?.data || [];
      setMovements(data);
      setCurrentPage(response?.data?.current_page || page);
      setLastPage(response?.data?.last_page || 1);
      setTotalMovements(response?.data?.total || 0);
      
      // Calculate stats from all data
      const allMovements = response?.data?.data || [];
      const totalIn = allMovements.filter((m: WarehouseMovement) => m.movement_type === "income").length;
      const totalOut = allMovements.filter((m: WarehouseMovement) => m.movement_type === "expense").length;
      const transfers = allMovements.filter((m: WarehouseMovement) => m.movement_type === "transfer").length;
      const pending = allMovements.filter((m: WarehouseMovement) => m.status === "pending").length;
      
      setStats({ totalIn, totalOut, transfers, pending });
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
