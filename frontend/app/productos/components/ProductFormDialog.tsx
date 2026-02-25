"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/forms/ProductForm";
import type { Product } from "@/lib/types";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Product | null;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

export function ProductFormDialog({ open, onOpenChange, editingProduct, onSubmit, loading }: ProductFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          <DialogDescription>{editingProduct ? "Modifica los datos del producto" : "Completa los datos del producto"}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <ProductForm
            key={editingProduct?.id || 'new'}
            defaultValues={editingProduct || undefined}
            onSubmit={onSubmit}
            isLoading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
