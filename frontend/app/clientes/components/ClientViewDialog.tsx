"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Client } from "@/lib/types";

const statusConfig: Record<string, { label: string; class: string }> = {
  active: { label: "Activo", class: "bg-green-500/20 text-green-400 border-green-500/30" },
  inactive: { label: "Inactivo", class: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  blocked: { label: "Bloqueado", class: "bg-red-500/20 text-red-400 border-red-500/30" },
};

interface ClientViewDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatCurrency: (value: number | null) => string;
}

export function ClientViewDialog({ client, open, onOpenChange, formatCurrency }: ClientViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle del Cliente</DialogTitle>
        </DialogHeader>
        {client && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Código</label>
                <p className="font-medium truncate">{client.code}</p>
              </div>
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">RFC</label>
                <p className="font-medium truncate">{client.rfc}</p>
              </div>
            </div>
            <div className="min-w-0">
              <label className="text-xs text-muted-foreground">Razón Social</label>
              <p className="font-medium break-words">{client.name}</p>
            </div>
            <div className="min-w-0">
              <label className="text-xs text-muted-foreground">Email</label>
              <p className="font-medium break-all text-sm">{client.email || "-"}</p>
            </div>
            <div className="min-w-0">
              <label className="text-xs text-muted-foreground">Teléfono</label>
              <p className="font-medium">{client.phone || "-"}</p>
            </div>
            <div className="min-w-0">
              <label className="text-xs text-muted-foreground">WhatsApp</label>
              <p className="font-medium">{client.whatsapp || "-"}</p>
            </div>
            <div className="min-w-0">
              <label className="text-xs text-muted-foreground">Contacto</label>
              <p className="font-medium">{client.contacto || "-"}</p>
            </div>
            <div className="min-w-0">
              <label className="text-xs text-muted-foreground">Dirección</label>
              <p className="font-medium break-words">{client.address}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Ciudad</label>
                <p className="font-medium truncate">{client.city}</p>
              </div>
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Estado</label>
                <p className="font-medium truncate">{client.state}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Límite de Crédito</label>
                <p className="font-medium truncate">{formatCurrency(client.creditLimit)}</p>
              </div>
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Saldo</label>
                <p className="font-medium truncate">{formatCurrency(client.balance)}</p>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Estado</label>
              <Badge className={statusConfig[client.status]?.class}>
                {statusConfig[client.status]?.label}
              </Badge>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}