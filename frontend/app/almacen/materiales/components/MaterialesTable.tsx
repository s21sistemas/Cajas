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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Pencil, Trash2, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft } from "lucide-react";
import type { InventoryItem } from "@/lib/types";

const categoryLabels: Record<string, string> = {
  raw_material: "Materia Prima",
  component: "Componente",
  tool: "Herramienta",
  consumable: "Consumible",
  material: "Material",
};

const categoryColors: Record<string, string> = {
  raw_material: "bg-blue-500/20 text-blue-400",
  component: "bg-purple-500/20 text-purple-400",
  tool: "bg-amber-500/20 text-amber-400",
  consumable: "bg-green-500/20 text-green-400",
  material: "bg-primary/20 text-primary",
};

interface MaterialesTableProps {
  items: InventoryItem[];
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onEntry: (item: InventoryItem) => void;
  onExit: (item: InventoryItem) => void;
  onTransfer: (item: InventoryItem) => void;
  loading?: boolean;
}

export function MaterialesTable({ 
  items, 
  search, 
  onSearchChange, 
  onEdit, 
  onDelete,
  onEntry,
  onExit,
  onTransfer,
  loading = false 
}: MaterialesTableProps) {
  const handleEdit = useCallback((item: InventoryItem) => onEdit(item), [onEdit]);
  const handleDelete = useCallback((item: InventoryItem) => onDelete(item), [onDelete]);
  const handleEntry = useCallback((item: InventoryItem) => onEntry(item), [onEntry]);
  const handleExit = useCallback((item: InventoryItem) => onExit(item), [onExit]);
  const handleTransfer = useCallback((item: InventoryItem) => onTransfer(item), [onTransfer]);

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "$0.00";
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  const getStockStatus = (quantity: number | string, minStock: number | string) => {
    const q = Number(quantity);
    const m = Number(minStock);

    if (q <= 0) return { label: "Agotado", class: "bg-red-500/20 text-red-400" };
    if (q <= m) return { label: "Bajo", class: "bg-amber-500/20 text-amber-400" };
    return { label: "OK", class: "bg-green-500/20 text-green-400" };
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-foreground">Inventario de Materiales</CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar material..."
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
                <TableHead className="text-muted-foreground">Código</TableHead>
                <TableHead className="text-muted-foreground">Nombre</TableHead>
                <TableHead className="text-muted-foreground">Categoría</TableHead>
                <TableHead className="text-right text-muted-foreground">Stock</TableHead>
                <TableHead className="text-right text-muted-foreground">Mín.</TableHead>
                <TableHead className="text-right text-muted-foreground">Costo</TableHead>
                <TableHead className="text-muted-foreground">Ubicación</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-right text-muted-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No hay materiales registrados.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const stockStatus = getStockStatus(item.quantity || 0, item.minStock || 0);
                  return (
                    <TableRow key={item.id} className="border-border">
                      <TableCell className="font-mono text-sm text-foreground">{item.code}</TableCell>
                      <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                      <TableCell>
                        <Badge className={categoryColors[item.category] || "bg-gray-500/20 text-gray-400"}>
                          {categoryLabels[item.category] || item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={(item.quantity || 0) <= (item.minStock || 0) ? "text-red-500 font-medium" : "text-foreground"}>
                          {item.quantity || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{item.minStock || 0}</TableCell>
                      <TableCell className="text-right text-foreground">{formatCurrency(item.unitCost)}</TableCell>
                      <TableCell className="text-muted-foreground">{item.location || "-"}</TableCell>
                      <TableCell>
                        <Badge className={stockStatus.class}>{stockStatus.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEntry(item)}>
                              <ArrowDownToLine className="h-4 w-4 mr-2" /> Entrada
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExit(item)}>
                              <ArrowUpFromLine className="h-4 w-4 mr-2" /> Salida
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTransfer(item)}>
                              <ArrowRightLeft className="h-4 w-4 mr-2" /> Transferencia
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Pencil className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item)}>
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
      </CardContent>
    </Card>
  );
}
