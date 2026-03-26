import { api } from '../api';
import type {
  InventoryItem,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  InventoryFilters,
  WarehouseLocation,
  CreateWarehouseLocationDto,
  UpdateWarehouseLocationDto,
  PaginatedResponse,
  WarehouseMovement,
  CreateWarehouseMovementDto,
  WarehouseMovementFilters,
  WarehouseMovementStats
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

  // Get locations with pagination
  getLocationsPaginated: (params?: {
    page?: number;
    perPage?: number;
    search?: string;
    zone?: string;
    type?: string;
  }): Promise<{
    data: WarehouseLocation[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> => {
    const { page, perPage, search, ...filters } = params || {};
    return api.get('/warehouse-locations', {
      page,
      per_page: perPage,
      search,
      ...filters
    });
  },

  // Update location occupancy
  updateOccupancy: (id: number, occupancy: number): Promise<WarehouseLocation> => {
    return api.patch<WarehouseLocation>(`/warehouse-locations/${id}/occupancy`, { occupancy });
  },

  // Get warehouse statistics
  getWarehouseStats: (): Promise<{
    total: number;
    totalCapacity: number;
    totalOccupancy: number;
    averageOccupancy: number;
    byZone: Record<string, { capacity: number; occupancy: number }>;
  }> => {
    return api.get('/warehouse-locations/stats');
  },

  // Select Lists

  // Get inventory items as select list (id + name)
  selectList: async (category?: string): Promise<{ value: string; label: string }[]> => {
    const response = await api.get<PaginatedResponse<InventoryItem>>('/inventory-items', { 
      per_page: 1000,
      ...(category && { category })
    });
    return (response.data || []).map(item => ({
      value: item.id.toString(),
      label: `${item.code} - ${item.name}`
    }));
  },

  // Get materials as select list (returns full objects for autocomplete)
  selectListMaterials: async (): Promise<InventoryItem[]> => {
    const response = await api.get<PaginatedResponse<InventoryItem>>('/inventory-items', { 
      per_page: 1000,
      category: 'raw_material'
    });
    return response.data || [];
  },

  // Get finished products as select list (returns full objects for autocomplete)
  selectListFinishedProducts: async (): Promise<InventoryItem[]> => {
    const response = await api.get<PaginatedResponse<InventoryItem>>('/inventory-items', { 
      per_page: 1000,
      category: 'finished_product'
    });
    return response.data || [];
  },

  // Get warehouse locations as select list
  selectListLocations: async (): Promise<{ value: string; label: string }[]> => {
    const response = await api.get<WarehouseLocation[]>('/warehouse-locations/select-list');
    return (response || []).map(location => ({
      value: location.id.toString(),
      label: `${location.name} (${location.zone})`
    }));
  },

  // Warehouse Movements

  // Get all warehouse movements with pagination and filters
  getMovements: (filters?: WarehouseMovementFilters & { page?: number; per_page?: number }): Promise<PaginatedResponse<WarehouseMovement>> => {
    return api.get<PaginatedResponse<WarehouseMovement>>('/warehouse-movements', filters);
  },

  // Get warehouse movement by ID
  getMovementById: (id: number): Promise<WarehouseMovement> => {
    return api.get<WarehouseMovement>(`/warehouse-movements/${id}`);
  },

  // Create new warehouse movement
  createMovement: (data: CreateWarehouseMovementDto): Promise<WarehouseMovement> => {
    return api.post<WarehouseMovement>('/warehouse-movements', data);
  },

  // Update warehouse movement
  updateMovement: (id: number, data: Partial<CreateWarehouseMovementDto>): Promise<WarehouseMovement> => {
    return api.put<WarehouseMovement>(`/warehouse-movements/${id}`, data);
  },

  // Delete warehouse movement
  deleteMovement: (id: number): Promise<void> => {
    return api.delete(`/warehouse-movements/${id}`);
  },

  // Register income (entrada)
  registerIncome: (data: {
    inventory_item_id: number;
    quantity: number;
    warehouse_location_id?: number;
    reference_type?: string;
    reference_id?: number;
    notes?: string;
    performed_by?: string;
  }): Promise<WarehouseMovement> => {
    return api.post<WarehouseMovement>('/warehouse-movements/income', data);
  },

  // Register expense (salida)
  registerExpense: (data: {
    inventory_item_id: number;
    quantity: number;
    warehouse_location_id?: number;
    reference_type?: string;
    reference_id?: number;
    notes?: string;
    performed_by?: string;
  }): Promise<WarehouseMovement> => {
    return api.post<WarehouseMovement>('/warehouse-movements/expense', data);
  },

  // Register transfer (transferencia entre ubicaciones)
  registerTransfer: (data: {
    inventory_item_id: number;
    quantity: number;
    warehouse_location_id: number;
    warehouse_location_to_id: number;
    reference_type?: string;
    reference_id?: number;
    notes?: string;
    performed_by?: string;
  }): Promise<WarehouseMovement> => {
    return api.post<WarehouseMovement>('/warehouse-movements', {
      ...data,
      movement_type: 'transfer'
    });
  },

  // Get movements by inventory item
  getMovementsByInventoryItem: (inventoryItemId: number, filters?: { page?: number; per_page?: number }): Promise<PaginatedResponse<WarehouseMovement>> => {
    return api.get<PaginatedResponse<WarehouseMovement>>(`/warehouse-movements/item/${inventoryItemId}`, filters);
  },

  // Get warehouse movement statistics
  getMovementStats: (): Promise<WarehouseMovementStats> => {
    return api.get<WarehouseMovementStats>('/warehouse-movements/stats');
  },

  // Sync stock from inventory items to products/materials
  syncStock: (): Promise<{ message: string; result: { products: number; materials: number; not_found: number } }> => {
    return api.post<{ message: string; result: { products: number; materials: number; not_found: number } }>('/warehouse-movements/sync-stock');
  }
};