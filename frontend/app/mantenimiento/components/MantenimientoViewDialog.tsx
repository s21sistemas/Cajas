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
import type { MaintenanceOrder } from "@/lib/types";

// Status configuration
const typeLabels: Record<string, { label: string; class: string }> = {
  preventive: { label: "Preventivo", class: "bg-blue-500/20 text-blue-400" },
  corrective: { label: "Correctivo", class: "bg-orange-500/20 text-orange-400" },
  emergency: { label: "Emergencia", class: "bg-red-500/20 text-red-400" },
};

const priorityLabels: Record<string, { label: string; class: string }> = {
  low: { label: "Baja", class: "bg-gray-500/20 text-gray-400" },
  medium: { label: "Media", class: "bg-yellow-500/20 text-yellow-400" },
  high: { label: "Alta", class: "bg-orange-500/20 text-orange-400" },
  critical: { label: "Urgente", class: "bg-red-500/20 text-red-400" },
};

const statusLabels: Record<string, { label: string; class: string }> = {
  scheduled: { label: "Pendiente", class: "bg-gray-500/20 text-gray-400" },
  "in-progress": { label: "En Progreso", class: "bg-yellow-500/20 text-yellow-400" },
  completed: { label: "Completado", class: "bg-green-500/20 text-green-400" },
  cancelled: { label: "Cancelado", class: "bg-gray-500/20 text-gray-400" },
};

const formatDate = (date: string | null) => {
  if (!date) return "-";
  return date;
};

interface MantenimientoViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MaintenanceOrder | null;
}

export function MantenimientoViewDialog({
  open,
  onOpenChange,
  item,
}: MantenimientoViewDialogProps) {
  if (!item) return null;

  const getTypeBadge = (type: string) => {
    const config = typeLabels[type] || { label: type, class: "bg-gray-500/20 text-gray-400" };
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const config = priorityLabels[priority] || { label: priority, class: "bg-gray-500/20 text-gray-400" };
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config = statusLabels[status] || { label: status, class: "bg-gray-500/20 text-gray-400" };
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalle de Orden {item.code}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Maquina</p>
              <p className="font-medium">{item.machineName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tecnico</p>
              <p className="font-medium">{item.technician || "-"}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tipo</p>
              {getTypeBadge(item.type)}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prioridad</p>
              {getPriorityBadge(item.priority || "medium")}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              {getStatusBadge(item.status)}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Descripcion</p>
            <p>{item.description}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Fecha Programada</p>
              <p>{formatDate(item.scheduledDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha Inicio</p>
              <p>{formatDate(item.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha Fin</p>
              <p>{formatDate(item.endDate)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground">Horas</p>
              <p className="text-lg font-bold">
                {item.actualHours || 0} / {item.estimatedHours || 0}h
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground">Costo</p>
              <p className="text-lg font-bold">
                ${((item.actualCost || item.estimatedCost) || 0).toLocaleString()}
              </p>
            </div>
          </div>
          {item.notes && (
            <div>
              <p className="text-sm text-muted-foreground">Notas</p>
              <p>{item.notes}</p>
            </div>
          )}
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
