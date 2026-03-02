"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VehicleForm } from "@/components/forms/VehicleForm";
import type { Vehicle, CreateVehicleDto } from "@/lib/types/vehicle.types";

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingVehicle: Vehicle | null;
  onSubmit: (data: CreateVehicleDto) => Promise<void>;
  loading: boolean;
  errors?: Record<string, string[]>;
}

export function VehicleFormDialog({
  open,
  onOpenChange,
  editingVehicle,
  onSubmit,
  loading,
  errors,
}: VehicleFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </DialogTitle>
        </DialogHeader>
        <VehicleForm
          onSubmit={onSubmit}
          isLoading={loading}
          errors={errors}
          defaultValues={editingVehicle ? {
            typeVehicle: editingVehicle.typeVehicle,
            brand: editingVehicle.brand,
            model: editingVehicle.model,
            color: editingVehicle.color,
            licensePlate: editingVehicle.licensePlate,
            status: editingVehicle.status,
            vehiclePhotos: editingVehicle.vehiclePhotos,
            labeled: editingVehicle.labeled,
            gps: editingVehicle.gps,
            taxesPaid: editingVehicle.taxesPaid,
            insuranceCompany: editingVehicle.insuranceCompany,
            insuranceCompanyPhone: editingVehicle.insuranceCompanyPhone,
            insuranceFile: editingVehicle.insuranceFile,
            policyNumber: editingVehicle.policyNumber,
            expirationDate: editingVehicle.expirationDate,
          } : undefined}
        />
      </DialogContent>
    </Dialog>
  );
}
