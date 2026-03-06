"use client";

import { memo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { WarehouseMovement } from "@/lib/types";

interface MovimientosTableProps {
  movements: WarehouseMovement[];
  search: string;
  typeFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const typeLabels: Record<string, { label: string; class: string }> = {
  income: { label: "Entrada", class: "bg-green-500/20 text-green-400" },
  expense: { label: "Salida", class: "bg-red-500/20 text-red-400" },
  transfer: { label: "Transferencia", class: "bg-blue-500/20 text-blue-400" },
  adjustment: { label: "Ajuste", class: "bg-amber-500/20 text-amber-400" },
};

const statusLabels: Record<string, { label: string; class: string }> = {
  pending: { label: "Pendiente", class: "bg-amber-500/20 text-amber-400" },
  completed: { label: "Completado", class: "bg-green-500/20 text-green-400" },
  cancelled: { label: "Cancelado", class: "bg-gray-500/20 text-gray-400" },
};

export function MovimientosTable({ 
  movements, 
  search,
  typeFilter,
  statusFilter,
  onSearchChange,
  onTypeFilterChange,
  onStatusFilterChange,
  currentPage,
  lastPage,
  onPageChange,
  loading = false 
}: MovimientosTableProps) {
  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-foreground">Historial de Movimientos</CardTitle>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 bg-input border-border"
              />
            </div>
            <Select value={typeFilter} onValueChange={onTypeFilterChange}>
              <SelectTrigger className="w-full md:w-40 bg-secondary border-border">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="income">Entrada</SelectItem>
                <SelectItem value="expense">Salida</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="adjustment">Ajuste</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full md:w-40 bg-secondary border-border">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Fecha</TableHead>
                <TableHead className="text-muted-foreground">Tipo</TableHead>
                <TableHead className="text-muted-foreground">Producto</TableHead>
                <TableHead className="text-right text-muted-foreground">Cantidad</TableHead>
                <TableHead className="text-muted-foreground">Origen</TableHead>
                <TableHead className="text-muted-foreground">Destino</TableHead>
                <TableHead className="text-muted-foreground">Referencia</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay movimientos registrados.
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((movement) => {
                  const typeInfo = typeLabels[movement.movement_type] || { label: movement.movement_type, class: "bg-gray-500/20 text-gray-400" };
                  const statusInfo = statusLabels[movement.status] || { label: movement.status, class: "bg-gray-500/20 text-gray-400" };
                  const quantityPrefix = movement.movement_type === "income" ? "+" : movement.movement_type === "expense" ? "-" : "";
                  
                  return (
                    <TableRow key={movement.id} className="border-border">
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {formatDate(movement.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge className={typeInfo.class}>{typeInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div>
                          <p className="font-medium">{movement.inventoryItem?.name || "-"}</p>
                          <p className="text-xs text-muted-foreground">{movement.inventoryItem?.code}</p>
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${movement.movement_type === 'income' ? 'text-green-400' : movement.movement_type === 'expense' ? 'text-red-400' : 'text-foreground'}`}>
                        {quantityPrefix}{movement.quantity}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {movement.warehouseLocation?.name || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {movement.warehouseLocationTo?.name || (movement.warehouse_location_to_id ? "Transferencia" : "-")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {movement.reference_type || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusInfo.class}>{statusInfo.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Página {currentPage} de {lastPage}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= lastPage}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
