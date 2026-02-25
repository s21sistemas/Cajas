import { api } from '../api';
import type {
  InventoryItem,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  InventoryFilters,
  WarehouseLocation,
  CreateWarehouseLocationDto,
  UpdateWarehouseLocationDto,
  PaginatedResponse
} from '../types';

export const inventoryService = {
  // Inventory Items

  // Get all inventory items with pagination and filters
  getAll: (filters?: InventoryFilters): Promise<PaginatedResponse<InventoryItem>> => {
    return api.get<PaginatedResponse<InventoryItem>>('/inventory-items', filters);
  },

  // Get inventory item by ID
  getById: (id: number): Promise<InventoryItem> => {
    return api.get<InventoryItem>(`/inventory-items/${id}`);
  },

  // Create new inventory item
  create: (data: CreateInventoryItemDto): Promise<InventoryItem> => {
    return api.post<InventoryItem>('/inventory-items', data);
  },

  // Update existing inventory item
  update: (id: number, data: UpdateInventoryItemDto): Promise<InventoryItem> => {
    return api.put<InventoryItem>(`/inventory-items/${id}`, data);
  },

  // Delete inventory item
  delete: (id: number): Promise<void> => {
    return api.delete(`/inventory-items/${id}`);
  },

  // Get items by category
  getByCategory: (category: InventoryItem['category'], filters?: Omit<InventoryFilters, 'category'>): Promise<PaginatedResponse<InventoryItem>> => {
    return api.get<PaginatedResponse<InventoryItem>>('/inventory-items', { ...filters, category });
  },

  // Get items by warehouse
  getByWarehouse: (warehouse: InventoryItem['warehouse'], filters?: Omit<InventoryFilters, 'warehouse'>): Promise<PaginatedResponse<InventoryItem>> => {
    return api.get<PaginatedResponse<InventoryItem>>('/inventory-items', { ...filters, warehouse });
  },

  // Get low stock items
  getLowStock: (filters?: InventoryFilters): Promise<PaginatedResponse<InventoryItem>> => {
    return api.get<PaginatedResponse<InventoryItem>>('/inventory-items/low-stock', filters);
  },

  // Update item quantity
  updateQuantity: (id: number, quantity: number, notes?: string): Promise<InventoryItem> => {
    return api.patch<InventoryItem>(`/inventory-items/${id}/quantity`, { quantity, notes });
  },

  // Record inventory movement
  recordMovement: (id: number, data: {
    type: 'in' | 'out';
    quantity: number;
    reason: string;
    reference?: string;
  }): Promise<InventoryItem> => {
    return api.post<InventoryItem>(`/inventory-items/${id}/movement`, data);
  },

  // Get inventory statistics
  getStats: (): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    byCategory: Record<string, number>;
    byWarehouse: Record<string, number>;
  }> => {
    return api.get('/inventory-items/stats');
  },

  // Warehouse Locations

  // Get all warehouse locations
  getLocations: (): Promise<WarehouseLocation[]> => {
    return api.get<WarehouseLocation[]>('/warehouse-locations');
  },

  // Get warehouse location by ID
  getLocationById: (id: number): Promise<WarehouseLocation> => {
    return api.get<WarehouseLocation>(`/warehouse-locations/${id}`);
  },

  // Create new warehouse location
  createLocation: (data: CreateWarehouseLocationDto): Promise<WarehouseLocation> => {
    return api.post<WarehouseLocation>('/warehouse-locations', data);
  },

  // Update existing warehouse location
  updateLocation: (id: number, data: UpdateWarehouseLocationDto): Promise<WarehouseLocation> => {
    return api.put<WarehouseLocation>(`/warehouse-locations/${id}`, data);
  },

  // Delete warehouse location
  deleteLocation: (id: number): Promise<void> => {
    return api.delete(`/warehouse-locations/${id}`);
  },

  // Get locations by zone
  getLocationsByZone: (zone: string): Promise<WarehouseLocation[]> => {
    return api.get<WarehouseLocation[]>('/warehouse-locations', { zone });
  },

  // Update location occupancy
  updateOccupancy: (id: number, occupancy: number): Promise<WarehouseLocation> => {
    return api.patch<WarehouseLocation>(`/warehouse-locations/${id}/occupancy`, { occupancy });
  },

  // Get warehouse statistics
  getWarehouseStats: (): Promise<{
    totalLocations: number;
    totalCapacity: number;
    totalOccupancy: number;
    utilizationPercentage: number;
    byZone: Record<string, { capacity: number; occupancy: number }>;
  }> => {
    return api.get('/warehouse-locations/stats');
  }
};