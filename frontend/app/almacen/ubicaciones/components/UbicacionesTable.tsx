"use client";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Pencil, Trash2, MapPin } from "lucide-react";
import type { WarehouseLocation } from "@/lib/types/inventory.types";

interface UbicacionesTableProps {
  items: WarehouseLocation[];
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (item: WarehouseLocation) => void;
  onDelete: (item: WarehouseLocation) => void;
  loading?: boolean;
  currentPage: number;
  lastPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function UbicacionesTable({
  items,
  search,
  onSearchChange,
  onEdit,
  onDelete,
  loading = false,
  currentPage,
  lastPage,
  totalItems,
  onPageChange,
}: UbicacionesTableProps) {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("es-MX").format(value || 0);
  };

  const getOccupancyPercent = (occupancy: number, capacity: number) => {
    if (!capacity || capacity === 0) return 0;
    return (occupancy / capacity) * 100;
  };

  const getOccupancyColor = (percent: number) => {
    if (percent >= 80) return "text-red-500";
    if (percent >= 50) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-foreground">Lista de Ubicaciones</CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ubicaciones..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-input border-border"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Nombre</TableHead>
                <TableHead className="text-muted-foreground">Zona</TableHead>
                <TableHead className="text-muted-foreground">Tipo</TableHead>
                <TableHead className="text-muted-foreground text-right">Capacidad</TableHead>
                <TableHead className="text-muted-foreground text-right">Ocupación</TableHead>
                <TableHead className="text-muted-foreground text-right">%</TableHead>
                <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <MapPin className="h-8 w-8 opacity-50" />
                      <p>No hay ubicaciones registradas.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const occupancyPercent = getOccupancyPercent(item.occupancy, item.capacity);
                  return (
                    <TableRow key={item.id} className="border-border">
                      <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.zone || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-border">
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-foreground">{formatNumber(item.capacity)}</TableCell>
                      <TableCell className="text-right text-foreground">{formatNumber(item.occupancy)}</TableCell>
                      <TableCell className={`text-right font-medium ${getOccupancyColor(occupancyPercent)}`}>
                        {occupancyPercent.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                              <Pencil className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(item)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between border-t pt-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {items.length} de {totalItems} ubicaciones
            </p>
            {lastPage > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  Página {currentPage} de {lastPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === lastPage || loading}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
