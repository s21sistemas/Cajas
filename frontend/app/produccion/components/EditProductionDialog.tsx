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
import type { CreateProductionForm, Operator, Machine } from '../types';

interface EditProductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: CreateProductionForm;
  onFormChange: (form: CreateProductionForm) => void;
  machines: Machine[];
  operators: Operator[];
  requiresMachine: boolean;
  onSave: () => void;
  saving: boolean;
}

export function EditProductionDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  machines,
  operators,
  requiresMachine,
  onSave,
  saving,
}: EditProductionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-card-foreground max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Orden de Producción</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Máquina - solo mostrar si el proceso requiere máquina */}
          {requiresMachine && (
            <div>
              <Label>Máquina</Label>
              <Select
                value={form.machineId || ''}
                onValueChange={(v) => onFormChange({ ...form, machineId: v })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar máquina" />
                </SelectTrigger>
                <SelectContent>
                  {machines.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No hay máquinas disponibles</div>
                  ) : (
                    machines.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Operador */}
          <div>
            <Label>Operador</Label>
            <Select
              value={form.operatorId || ''}
              onValueChange={(v) => onFormChange({ ...form, operatorId: v })}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Seleccionar operador" />
              </SelectTrigger>
              <SelectContent>
                {operators.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No hay operadores disponibles</div>
                ) : (
                  operators.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))
                )}
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
            <Label>Notas</Label>
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
          <Button onClick={onSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
