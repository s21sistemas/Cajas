"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MaintenanceOrder, CreateMaintenanceOrderDto, Machine } from "@/lib/types";

interface MantenimientoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: MaintenanceOrder | null;
  machines: Machine[];
  onSubmit: (data: CreateMaintenanceOrderDto) => void;
  loading: boolean;
}

export function MantenimientoFormDialog({
  open,
  onOpenChange,
  editingItem,
  machines,
  onSubmit,
  loading,
}: MantenimientoFormDialogProps) {
  const getInitialData = (): CreateMaintenanceOrderDto => {
    if (editingItem) {
      return {
        machineId: editingItem.machineId,
        type: editingItem.type,
        priority: editingItem.priority,
        description: editingItem.description,
        scheduledDate: editingItem.scheduledDate || "",
        technician: editingItem.technician || "",
        estimatedHours: editingItem.estimatedHours || 0,
        estimatedCost: editingItem.estimatedCost || 0,
      };
    }
    return {
      machineId: 0,
      type: "preventive",
      priority: "medium",
      description: "",
      scheduledDate: new Date().toISOString().split("T")[0],
      technician: "",
      estimatedHours: 0,
      estimatedCost: 0,
    };
  };

  const formData = getInitialData();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data: CreateMaintenanceOrderDto = {
      machineId: parseInt(form.get("machineId") as string) || 0,
      type: form.get("type") as "preventive" | "corrective" | "emergency",
      priority: form.get("priority") as "low" | "medium" | "high" | "critical",
      description: form.get("description") as string,
      scheduledDate: form.get("scheduledDate") as string,
      technician: form.get("technician") as string || undefined,
      estimatedHours: parseFloat(form.get("estimatedHours") as string) || 0,
      estimatedCost: parseFloat(form.get("estimatedCost") as string) || 0,
    };
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Editar Orden de Mantenimiento" : "Nueva Orden de Mantenimiento"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="machineId">Maquina</Label>
                <Select name="machineId" defaultValue={String(formData.machineId)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar maquina" />
                  </SelectTrigger>
                  <SelectContent>
                    {machines.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="technician">Tecnico Asignado</Label>
                <Input
                  id="technician"
                  name="technician"
                  defaultValue={formData.technician}
                  placeholder="Nombre del tecnico"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select name="type" defaultValue={formData.type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventivo</SelectItem>
                    <SelectItem value="corrective">Correctivo</SelectItem>
                    <SelectItem value="emergency">Emergencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select name="priority" defaultValue={formData.priority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="scheduledDate">Fecha Programada</Label>
                <Input
                  id="scheduledDate"
                  name="scheduledDate"
                  type="date"
                  defaultValue={formData.scheduledDate}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={formData.description}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="estimatedHours">Horas Estimadas</Label>
                <Input
                  id="estimatedHours"
                  name="estimatedHours"
                  type="number"
                  defaultValue={formData.estimatedHours}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estimatedCost">Costo Estimado ($)</Label>
                <Input
                  id="estimatedCost"
                  name="estimatedCost"
                  type="number"
                  defaultValue={formData.estimatedCost}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : editingItem ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
