import { BaseEntity } from './api.types';

export type DeliveryStatus = 'pending' | 'assigned' | 'in_transit' | 'completed' | 'cancelled';

export interface Delivery extends BaseEntity {
  vehicleId: number | null;
  vehicle?: {
    id: number;
    brand: string;
    model: string;
    licensePlate: string;
  };
  driver: string;
  originAddress: string;
  status: DeliveryStatus;
  startedAt: string | null;
  completedAt: string | null;
}

export interface CreateDeliveryDto {
  vehicleId?: number;
  driver: string;
  originAddress: string;
  status?: DeliveryStatus;
  startedAt?: string;
  completedAt?: string;
}

export interface UpdateDeliveryDto extends Partial<CreateDeliveryDto> {}
