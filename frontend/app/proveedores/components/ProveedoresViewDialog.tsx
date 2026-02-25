"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Supplier, SupplierStatus } from "@/lib/types";

// Status configuration
const statusConfig: Record<SupplierStatus, { label: string; class: string }> = {
  active: { label: "Activo", class: "bg-green-500/20 text-green-400 border-green-500/30" },
  inactive: { label: "Inactivo", class: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  pending: { label: "Pendiente", class: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
};

const formatCurrency = (value: number | null) => {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value || 0);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

interface ProveedoresViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Supplier | null;
}

export function ProveedoresViewDialog({
  open,
  onOpenChange,
  item,
}: ProveedoresViewDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle del Proveedor</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Código</label>
              <p className="font-medium">{item.code}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">RFC</label>
              <p className="font-medium">{item.rfc || '-'}</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Razón Social</label>
            <p className="font-medium">{item.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <p className="font-medium">{item.email || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Teléfono</label>
              <p className="font-medium">{item.phone || '-'}</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Contacto</label>
            <p className="font-medium">{item.contact || '-'}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Dirección</label>
            <p className="font-medium">{item.address || '-'}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Ciudad</label>
            <p className="font-medium">{item.city || '-'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Categoría</label>
              <p className="font-medium">{item.category || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Lead Time</label>
              <p className="font-medium">{item.lead_time} días</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Saldo</label>
              <p className="font-medium">{formatCurrency(item.balance)}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Estado</label>
              <div className="mt-1">
                <Badge className={statusConfig[item.status]?.class}>
                  {statusConfig[item.status]?.label}
                </Badge>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Fecha de Alta</label>
            <p className="font-medium">{formatDate(item.createdAt)}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
