import { BaseEntity, BaseFilters } from './api.types';

export type SupplierStatus = 'active' | 'inactive' | 'pending';

export interface Supplier extends BaseEntity {
  code: string;
  name: string;
  rfc: string | null;
  email: string | null;
  phone: string | null;
  address: string;
  city: string;
  state: string | null;
  contact: string | null;
  category: string | null;
  lead_time: number;
  rating: number;
  balance: number;
  status: SupplierStatus;
}

export interface CreateSupplierDto {
  code: string;
  name: string;
  rfc?: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  state?: string;
  contact?: string;
  category?: string;
  lead_time?: number;
  rating?: number;
  status?: SupplierStatus;
}

export type UpdateSupplierDto = Partial<CreateSupplierDto>;

export interface SupplierFilters extends BaseFilters {
  status?: SupplierStatus;
  category?: string;
  city?: string;
}
