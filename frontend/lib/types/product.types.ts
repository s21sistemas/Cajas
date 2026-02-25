import { BaseEntity, ProductStatus, BaseFilters } from './api.types';
import { Material } from './material.types';

export interface Product extends BaseEntity {
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  cost: number | null;
  unit: string | null;
  stock: number;
  minStock: number;
  status: ProductStatus;
  materials?: ProductMaterial[];
  processes?: ProductProcess[];
}

export interface ProductMaterial {
  id: number;
  productId: number;
  materialId: number;
  material?: Material;
  quantity: number;
}

export interface ProductProcess {
  id: number;
  productId: number;
  code: string;
  name: string;
  processType: string;
  description: string | null;
  machineId: number | null;
  machine?: Machine;
  sequence: number;
  estimatedTimeMin: number | null;
  status: string;
  requiresMachine: boolean;
}

export interface Machine {
  id: number;
  code: string;
  name: string;
  status: string;
}

export interface CreateProductDto {
  code: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  cost?: number;
  unit?: string;
  stock?: number;
  minStock?: number;
  status?: ProductStatus;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ProductFilters extends BaseFilters {
  status?: ProductStatus;
  category?: string;
  minStock?: number;
  maxStock?: number;
}