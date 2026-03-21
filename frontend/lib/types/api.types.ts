// Common API types and interfaces

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Base entity interface
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// Status enums (matching Laravel enums)
export type ProductStatus = 'diseño' | 'en_producción' | 'completado' | 'active' | 'inactive' | 'discontinued';
export type MachineStatus = 'available' | 'running' | 'maintenance' | 'offline';
export type ProcessStatus = 'active' | 'inactive' | 'pending' | 'completed';
export type InventoryCategory = 'raw_material' | 'component' | 'tool' | 'consumable' | 'finished_product';
export type WarehouseType = 'materia_prima' | 'producto_terminado' | 'materials' | 'finished_product';

// Common filter and search interfaces
export interface BaseFilters {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}