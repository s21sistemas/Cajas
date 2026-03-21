import { BaseEntity, InventoryCategory, WarehouseType, BaseFilters } from './api.types';

export interface InventoryItem extends BaseEntity {
  code: string;
  name: string;
  category: InventoryCategory;
  warehouse: WarehouseType | null;
  warehouse_location_id: number | null;
  warehouseLocation?: WarehouseLocation | null;
  quantity: number;
  minStock: number;
  maxStock: number | null;
  unitCost: number;
  unit: string | null;
  lastMovement: string | null;
}

export interface CreateInventoryItemDto {
  code: string;
  name: string;
  category: InventoryCategory;
  warehouse?: WarehouseType;
  warehouse_location_id?: number;
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  unitCost: number;
  unit?: string;
  lastMovement?: string;
}

export interface UpdateInventoryItemDto extends Partial<CreateInventoryItemDto> {}

export interface InventoryFilters extends BaseFilters {
  category?: InventoryCategory;
  warehouse?: WarehouseType;
  minStock?: number;
  maxStock?: number;
  warehouse_location_id?: number;
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

export interface WarehouseMovement {
  id: number;
  inventory_item_id: number;
  movementType: "income" | "expense" | "adjustment" | "transfer";
  quantity: number;
  warehouse_location_id: number | null;
  warehouse_location_to_id: number | null;
  referenceType: string | null;
  reference_id: number | null;
  notes: string | null;
  performed_by: string | null;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  inventoryItem?: {
    id: number;
    code: string;
    name: string;
    unit: string;
  };
  warehouseLocation?: {
    id: number;
    name: string;
    zone: string;
  };
  warehouseLocationTo?: {
    id: number;
    name: string;
    zone: string;
  };
}

export interface CreateWarehouseMovementDto {
  inventory_item_id: number;
  movement_type: "income" | "expense" | "adjustment" | "transfer";
  quantity: number;
  warehouse_location_id?: number;
  warehouse_location_to_id?: number;
  reference_type?: string;
  reference_id?: number;
  notes?: string;
  performed_by?: string;
  status?: "pending" | "completed" | "cancelled";
}

export interface WarehouseMovementFilters {
  movement_type?: string;
  inventory_item_id?: number;
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface WarehouseMovementStats {
  total_income: number;
  total_expense: number;
  net_movement: number;
  total_adjustments: number;
  pending_movements: number;
}