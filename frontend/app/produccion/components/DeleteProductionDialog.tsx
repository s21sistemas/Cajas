'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface DeleteProductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productionCode: string | null;
  onConfirm: () => void;
  saving: boolean;
}

export function DeleteProductionDialog({
  open,
  onOpenChange,
  productionCode,
  onConfirm,
  saving,
}: DeleteProductionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border text-card-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Orden de Producción</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar la orden {productionCode}? 
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={saving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
