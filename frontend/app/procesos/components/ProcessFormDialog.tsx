"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProcessForm } from "@/components/forms/ProcessForm";
import type { Process, CreateProcessDto } from "@/lib/types";

interface ProcessFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProcess: Process | null;
  onSubmit: (data: CreateProcessDto) => Promise<void>;
  loading?: boolean;
}

export function ProcessFormDialog({
  open,
  onOpenChange,
  editingProcess,
  onSubmit,
  loading = false,
}: ProcessFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingProcess ? "Editar Proceso" : "Crear Nuevo Proceso"}
          </DialogTitle>
          <DialogDescription>
            {editingProcess
              ? "Modifique los datos del proceso."
              : "Complete los datos del proceso a registrar."}
          </DialogDescription>
        </DialogHeader>
        <ProcessForm
          defaultValues={editingProcess || undefined}
          onSubmit={onSubmit}
          isLoading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
