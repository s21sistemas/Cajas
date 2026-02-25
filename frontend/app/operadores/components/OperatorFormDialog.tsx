"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OperatorForm } from "@/components/forms/OperatorForm";
import type { Operator } from "@/lib/types";

interface OperatorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOperator: Operator | null;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

export function OperatorFormDialog({ open, onOpenChange, editingOperator, onSubmit, loading }: OperatorFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingOperator ? "Editar Operador" : "Nuevo Operador"}</DialogTitle>
          <DialogDescription>{editingOperator ? "Modifica los datos del operador" : "Completa los datos del operador"}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <OperatorForm
            key={editingOperator?.id || 'new'}
            defaultValues={editingOperator || undefined}
            onSubmit={onSubmit}
            isLoading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
