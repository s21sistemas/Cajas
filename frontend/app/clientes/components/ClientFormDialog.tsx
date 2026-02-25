"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientForm } from "@/components/forms/ClientForm";
import type { Client } from "@/lib/types";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingClient: Client | null;
  onSubmit: (data: any) => void;
  loading: boolean;
}

export function ClientFormDialog({ open, onOpenChange, editingClient, onSubmit, loading }: ClientFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingClient ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
          <DialogDescription>{editingClient ? "Modifica los datos del cliente" : "Completa los datos del cliente"}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <ClientForm
            key={editingClient?.id || 'new'}
            client={editingClient}
            onSubmit={onSubmit}
            loading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}