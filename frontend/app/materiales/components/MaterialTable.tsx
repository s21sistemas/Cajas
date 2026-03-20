"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, MoreHorizontal, Edit, Trash2, Package, ShoppingCart } from "lucide-react";
import type { Material } from "@/lib/types";

const categoryLabels: Record<string, string> = {
  raw_material: 'Materia Prima',
  component: 'Componente',
  consumable: 'Consumible',
  packing: 'Empaque',
  other: 'Otro',
};

interface MaterialTableProps {
  materials: Material[];
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
  onRestock: (material: Material) => void;
  loading?: boolean;
}

export function MaterialTable({
  materials,
  search,
  onSearchChange,
  onEdit,
  onDelete,
  onRestock,
  loading = false,
}: MaterialTableProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-foreground">Lista de Materiales</CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar materiales..."
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
                <TableHead className="text-muted-foreground">Stock</TableHead>
                <TableHead className="text-muted-foreground">Stock Mín.</TableHead>
                <TableHead className="text-muted-foreground">Precio</TableHead>
                <TableHead className="text-muted-foreground">Costo</TableHead>
                <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton loading state
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 rounded ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay materiales registrados
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((material) => (
                  <TableRow key={material.id} className="border-border">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{material.code}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{material.name}</TableCell>
                    <TableCell className="text-foreground">{categoryLabels[material.category || ''] || material.category || '-'}</TableCell>
                    <TableCell className="text-foreground">
                      <span className={material.stock <= (material.minStock ?? 0) ? "text-red-500 font-medium" : ""}>
                        {material.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{material.minStock}</TableCell>
                    <TableCell className="text-foreground">
                      {material.price ? `${Number(material.price).toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {material.cost ? `${Number(material.cost).toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onRestock(material)}
                          className="h-8 gap-1 text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Surtir
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(material)}>
                              <Edit className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(material)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
