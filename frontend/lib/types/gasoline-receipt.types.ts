import { BaseEntity } from './api.types';

export interface GasolineReceipt extends BaseEntity {
  vehicleId: number;
  vehicle?: {
    id: number;
    brand: string;
    model: string;
    licensePlate: string;
  };
  mileage: number;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  notes: string | null;
}

export interface CreateGasolineReceiptDto {
  vehicleId: number;
  mileage: number;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  notes?: string;
}

export interface UpdateGasolineReceiptDto extends Partial<CreateGasolineReceiptDto> {}
