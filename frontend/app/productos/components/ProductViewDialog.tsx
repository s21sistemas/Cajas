"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, Settings } from "lucide-react";
import type { Product } from "@/lib/types";

const statusConfig: Record<string, { label: string; class: string }> = {
  diseño: { label: "Diseño", class: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  en_producción: { label: "En Producción", class: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  completado: { label: "Completado", class: "bg-green-500/20 text-green-400 border-green-500/30" },
  active: { label: "Activo", class: "bg-green-500/20 text-green-400 border-green-500/30" },
  inactive: { label: "Inactivo", class: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  discontinued: { label: "Descontinuado", class: "bg-red-500/20 text-red-400 border-red-500/30" },
};

interface ProductViewDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatCurrency: (value: number | null | undefined) => string;
}

export function ProductViewDialog({ product, open, onOpenChange, formatCurrency }: ProductViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle del Producto</DialogTitle>
        </DialogHeader>
        {product && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Código</label>
                <p className="font-medium truncate font-mono">{product.code}</p>
              </div>
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Categoría</label>
                <p className="font-medium truncate">{product.category || '-'}</p>
              </div>
            </div>
            <div className="min-w-0">
              <label className="text-xs text-muted-foreground">Nombre</label>
              <p className="font-medium break-words">{product.name}</p>
            </div>
            <div className="min-w-0">
              <label className="text-xs text-muted-foreground">Descripción</label>
              <p className="font-medium break-words text-sm">{product.description || '-'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Precio</label>
                <p className="font-medium truncate">{formatCurrency(product.price)}</p>
              </div>
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Costo</label>
                <p className="font-medium truncate">{formatCurrency(product.cost)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Stock</label>
                <p className="font-medium truncate">{product.stock}</p>
              </div>
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Stock Mínimo</label>
                <p className="font-medium truncate">{product.minStock}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Unidad</label>
                <p className="font-medium truncate">{product.unit || '-'}</p>
              </div>
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Estado</label>
                <Badge className={statusConfig[product.status]?.class}>
                  {statusConfig[product.status]?.label}
                </Badge>
              </div>
            </div>

            {/* Lista de Materiales (BOM) */}
            {product.materials && product.materials.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4" />
                  <label className="text-sm font-medium">Materiales (BOM)</label>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.materials.map((pm) => (
                      <TableRow key={pm.id}>
                        <TableCell>{pm.material?.name || pm.materialId}</TableCell>
                        <TableCell className="text-right">{pm.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Lista de Procesos */}
            {product.processes && product.processes.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4" />
                  <label className="text-sm font-medium">Procesos</label>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Orden</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Tiempo (min)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.processes.map((pp) => (
                      <TableRow key={pp.id}>
                        <TableCell>{pp.sequence}</TableCell>
                        <TableCell>{pp.name}</TableCell>
                        <TableCell>{pp.processType}</TableCell>
                        <TableCell className="text-right">{pp.estimatedTimeMin || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
