import { BaseEntity, InventoryCategory, WarehouseType, BaseFilters } from './api.types';

export interface InventoryItem extends BaseEntity {
  code: string;
  name: string;
  category: InventoryCategory;
  warehouse: WarehouseType | null;
  quantity: number;
  minStock: number;
  maxStock: number | null;
  unitCost: number;
  unit: string | null;
  location: string | null;
  lastMovement: string | null;
}

export interface CreateInventoryItemDto {
  code: string;
  name: string;
  category: InventoryCategory;
  warehouse?: WarehouseType;
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  unitCost: number;
  unit?: string;
  location?: string;
  lastMovement?: string;
}

export interface UpdateInventoryItemDto extends Partial<CreateInventoryItemDto> {}

export interface InventoryFilters extends BaseFilters {
  category?: InventoryCategory;
  warehouse?: WarehouseType;
  minStock?: number;
  maxStock?: number;
  location?: string;
}

export interface WarehouseLocation extends BaseEntity {
  name: string;
  zone: string;
  type: string;
  capacity: number;
  occupancy: number;
}

export interface CreateWarehouseLocationDto {
  name: string;
  zone: string;
  type: string;
  capacity: number;
  occupancy?: number;
}

export interface UpdateWarehouseLocationDto extends Partial<CreateWarehouseLocationDto> {}