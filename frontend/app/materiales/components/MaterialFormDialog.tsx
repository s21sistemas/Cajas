"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MaterialForm } from "@/components/forms/MaterialForm";
import type { Material } from "@/lib/types";

interface MaterialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMaterial: Material | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MaterialFormDialog({
  open,
  onOpenChange,
  editingMaterial,
  onSuccess,
  onCancel,
}: MaterialFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingMaterial ? "Editar Material" : "Nuevo Material"}
          </DialogTitle>
          <DialogDescription>
            {editingMaterial 
              ? "Actualiza los datos del material" 
              : "Agrega un nuevo material al inventario"}
          </DialogDescription>
        </DialogHeader>
        <MaterialForm
          material={editingMaterial || undefined}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
