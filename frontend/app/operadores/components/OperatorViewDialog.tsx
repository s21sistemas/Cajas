"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Operator } from "@/lib/types";

interface OperatorViewDialogProps {
  operator: Operator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OperatorViewDialog({ operator, open, onOpenChange }: OperatorViewDialogProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle del Operador</DialogTitle>
        </DialogHeader>
        {operator && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Código</label>
                <p className="font-medium truncate font-mono">{operator.employeeCode}</p>
              </div>
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Estado</label>
                <Badge className={operator.active 
                  ? "bg-green-500/20 text-green-400 border-green-500/30" 
                  : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                }>
                  {operator.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
            <div className="min-w-0">
              <label className="text-xs text-muted-foreground">Nombre</label>
              <p className="font-medium break-words">{operator.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Turno</label>
                <p className="font-medium truncate">{operator.shift || '-'}</p>
              </div>
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Especialidad</label>
                <p className="font-medium truncate">{operator.specialty || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Teléfono</label>
                <p className="font-medium truncate">{operator.phone || '-'}</p>
              </div>
              <div className="min-w-0">
                <label className="text-xs text-muted-foreground">Email</label>
                <p className="font-medium truncate">{operator.email || '-'}</p>
              </div>
            </div>
            <div className="min-w-0">
              <label className="text-xs text-muted-foreground">Fecha de Contratación</label>
              <p className="font-medium">{formatDate(operator.hireDate)}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
