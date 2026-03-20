import { BaseEntity } from './api.types';

export type VehicleType = 'car' | 'motorcycle';
export type VehicleStatus = 'Available' | 'Assigned' | 'Under repair' | 'Out of service' | 'Accident' | 'Stolen' | 'Sold';
export type YesNo = 'YES' | 'NO';

export interface Vehicle extends BaseEntity {
  typeVehicle: VehicleType;
  brand: string;
  model: string;
  color?: string;
  licensePlate: string;
  status: VehicleStatus;
  vehiclePhotos?: string;
  labeled?: YesNo;
  gps?: YesNo;
  taxesPaid?: YesNo;
  insuranceCompany?: string;
  insuranceCompanyPhone?: string;
  insuranceFile?: string;
  policyNumber?: string;
  expirationDate?: string;
  notes?: string;
}

export interface CreateVehicleDto {
  typeVehicle: VehicleType;
  brand: string;
  model: string;
  licensePlate: string;
  color?: string | null;
  status?: VehicleStatus;
  vehiclePhotos?: string;
  labeled?: YesNo | null;
  gps?: YesNo | null;
  taxesPaid?: YesNo | null;
  insuranceCompany?: string | null;
  insuranceCompanyPhone?: string | null;
  insuranceFile?: string;
  policyNumber?: string | null;
  expirationDate?: string | null;
}

export interface UpdateVehicleDto extends Partial<CreateVehicleDto> {}
