'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { CreateProductionForm } from '../types';

interface EditProductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: CreateProductionForm;
  onFormChange: (form: CreateProductionForm) => void;
  onSave: () => void;
  saving: boolean;
}

export function EditProductionDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
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
