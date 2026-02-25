'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { CreateProductionForm, Process, Operator, Machine, WorkOrder } from '../types';

interface CreateProductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: CreateProductionForm;
  onFormChange: (form: CreateProductionForm) => void;
  processes: Process[];
  machines: Machine[];
  operators: Operator[];
  workOrders: WorkOrder[];
  onSubmit: () => void;
  saving: boolean;
}

export function CreateProductionDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  processes,
  machines,
  operators,
  workOrders,
  onSubmit,
  saving,
}: CreateProductionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-card-foreground max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Orden de Producción</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Orden de Trabajo (opcional)</Label>
            <Select
              value={form.workOrderId || ''}
              onValueChange={(v) => onFormChange({ ...form, workOrderId: v || undefined })}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Vincular a orden de trabajo" />
              </SelectTrigger>
              <SelectContent>
                {workOrders.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No hay órdenes de trabajo disponibles</div>
                ) : (
                  workOrders.map((wo) => (
                    <SelectItem key={wo.id} value={String(wo.id)}>
                      {wo.code} - {wo.product_name} ({wo.client_name})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Proceso</Label>
            <Select
              value={form.processId}
              onValueChange={(v) => onFormChange({ ...form, processId: v })}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Seleccionar proceso" />
              </SelectTrigger>
              <SelectContent>
                {processes.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} {p.requiresMachine ? '(Maquina)' : '(Manual)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Máquina (opcional)</Label>
            <Select
              value={form.machineId || ''}
              onValueChange={(v) => onFormChange({ ...form, machineId: v || undefined })}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Seleccionar máquina" />
              </SelectTrigger>
              <SelectContent>
                {machines.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Operador (opcional)</Label>
            <Select
              value={form.operatorId || ''}
              onValueChange={(v) => onFormChange({ ...form, operatorId: v || undefined })}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Seleccionar operador" />
              </SelectTrigger>
              <SelectContent>
                {operators.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cantidad objetivo</Label>
            <Input
              type="number"
              value={form.targetParts}
              onChange={(e) => onFormChange({ ...form, targetParts: parseInt(e.target.value) || 0 })}
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label>Notas (opcional)</Label>
            <Input
              value={form.notes}
              onChange={(e) => onFormChange({ ...form, notes: e.target.value })}
              placeholder="Agregar notas..."
              className="bg-secondary border-border"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Crear Orden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
