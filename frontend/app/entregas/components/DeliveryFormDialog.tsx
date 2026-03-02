"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeliveryForm } from "@/components/forms/DeliveryForm";
import type { Delivery, CreateDeliveryDto } from "@/lib/types/delivery.types";
import type { Vehicle } from "@/lib/types/vehicle.types";

interface DeliveryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDelivery: Delivery | null;
  vehicles: Vehicle[];
  onSubmit: (data: CreateDeliveryDto) => Promise<void>;
  loading: boolean;
  errors?: Record<string, string[]>;
}

export function DeliveryFormDialog({
  open,
  onOpenChange,
  editingDelivery,
  vehicles,
  onSubmit,
  loading,
  errors,
}: DeliveryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingDelivery ? 'Editar Entrega' : 'Nueva Entrega'}
          </DialogTitle>
        </DialogHeader>
        <DeliveryForm
          vehicles={vehicles}
          onSubmit={onSubmit}
          isLoading={loading}
          errors={errors}
          defaultValues={editingDelivery ? {
            vehicleId: editingDelivery.vehicleId || undefined,
            driver: editingDelivery.driver,
            originAddress: editingDelivery.originAddress,
            status: editingDelivery.status,
            startedAt: editingDelivery.startedAt || undefined,
            completedAt: editingDelivery.completedAt || undefined,
          } : undefined}
        />
      </DialogContent>
    </Dialog>
  );
}
