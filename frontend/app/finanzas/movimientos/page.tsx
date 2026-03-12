"use client";

import { useState, useEffect } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { financeService } from "@/lib/services/finance.service";
import type { Movement } from "@/lib/types/finance.types";
import { MovementStatsCards } from "./components/MovementStatsCards";
import { MovementTable } from "./components/MovementTable";
import { MovementFormDialog } from "./components/MovementFormDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function MovementsPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const response = await financeService.getAllMovements();
      // El servicio devuelve { data: [...], total: number, ... }
      setMovements(response.data || response || []);
    } catch (error) {
      console.error("Error loading movements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const filtered = movements.filter((m: Movement) => {
    const matchesSearch =
      m.description?.toLowerCase().includes(search.toLowerCase()) ||
      m.reference?.toLowerCase().includes(search.toLowerCase()) ||
      m.category?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency,
    }).format(Math.abs(amount));
  };

  const openNewModal = () => {
    setEditingMovement(null);
    setIsModalOpen(true);
  };

  const openEditModal = (movement: Movement) => {
    setEditingMovement(movement);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    await financeService.deleteMovement(id);
    await fetchMovements();
  };

  return (
    <ERPLayout title="Finanzas" subtitle="Movimientos y flujo de efectivo">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Movimientos Financieros</h1>
            <p className="text-muted-foreground">
              Registra y consulta los movimientos de las cuentas bancarias
            </p>
          </div>
          <Button onClick={openNewModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Movimiento
          </Button>
        </div>

        <MovementStatsCards 
          movements={movements} 
          formatCurrency={formatCurrency} 
        />

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Historial de Movimientos</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar movimientos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-secondary border-border"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40 bg-secondary border-border">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="income">Ingresos</SelectItem>
                    <SelectItem value="expense">Gastos</SelectItem>
                    <SelectItem value="transfer">Transferencias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <MovementTable 
                movements={filtered} 
                formatCurrency={formatCurrency}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>

        <MovementFormDialog
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          editingMovement={editingMovement}
          onSave={fetchMovements}
        />
      </div>
    </ERPLayout>
  );
}
