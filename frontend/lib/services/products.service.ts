import { api } from '../api';
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductFilters,
  ProductPart,
  ProductProcess,
  Material,
  PaginatedResponse
} from '../types';

export const productsService = {
  // Get all products with pagination and filters
  getAll: (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    return api.get<PaginatedResponse<Product>>('/products', filters);
  },

  // Get product by ID
  getById: (id: number): Promise<Product> => {
    return api.get<Product>(`/products/${id}`);
  },

  // Get product with details (parts and processes)
  getWithDetails: (id: number): Promise<Product> => {
    return api.get<Product>(`/products/${id}/details`);
  },

  // Create new product
  create: (data: CreateProductDto): Promise<Product> => {
    return api.post<Product>('/products', data);
  },

  // Update existing product
  update: (id: number, data: UpdateProductDto): Promise<Product> => {
    return api.put<Product>(`/products/${id}`, data);
  },

  // Delete product
  delete: (id: number): Promise<void> => {
    return api.delete(`/products/${id}`);
  },

  // Get products by category
  getByCategory: (category: string, filters?: Omit<ProductFilters, 'category'>): Promise<PaginatedResponse<Product>> => {
    return api.get<PaginatedResponse<Product>>('/products', { ...filters, category });
  },

  // Get low stock products
  getLowStock: (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    return api.get<PaginatedResponse<Product>>('/products/low-stock', filters);
  },

  // Update product stock
  updateStock: (id: number, stock: number): Promise<Product> => {
    return api.patch<Product>(`/products/${id}/stock`, { stock });
  },

  // Get product statistics
  getStats: (): Promise<{
    total: number;
    active: number;
    inactive: number;
    lowStock: number;
  }> => {
    return api.get('/products/stats');
  },

  // Get materials of a product
  getParts: (productId: number): Promise<ProductPart[]> => {
    return api.get<ProductPart[]>(`/products/${productId}/materials`);
  },

  // Add material to product
  addPart: (productId: number, materialId: number, quantity: number): Promise<Product> => {
    return api.post<Product>(`/products/${productId}/materials`, { material_id: materialId, quantity });
  },

  // Update material quantity
  updatePart: (productId: number, materialId: number, quantity: number): Promise<Product> => {
    return api.put<Product>(`/products/${productId}/materials/${materialId}`, { quantity });
  },

  // Remove material from product
  removePart: (productId: number, materialId: number): Promise<Product> => {
    return api.delete<Product>(`/products/${productId}/materials/${materialId}`);
  },

  // === PROCESOS DEL PRODUCTO ===

  // Get processes of a product
  getProcesses: (productId: number): Promise<ProductProcess[]> => {
    return api.get<ProductProcess[]>(`/products/${productId}/processes`);
  },

  // Add process to product
  addProcess: (productId: number, data: {
    name: string;
    process_type: string;
    description?: string;
    machine_id?: number;
    sequence: number;
    estimated_time_min?: number;
  }): Promise<ProductProcess> => {
    return api.post<ProductProcess>(`/products/${productId}/processes`, data);
  },

  // Update process of product
  updateProcess: (productId: number, processId: number, data: {
    name?: string;
    process_type?: string;
    description?: string;
    machine_id?: number;
    sequence?: number;
    estimated_time_min?: number;
    status?: string;
  }): Promise<ProductProcess> => {
    return api.put<ProductProcess>(`/products/${productId}/processes/${processId}`, data);
  },

  // Remove process from product
  removeProcess: (productId: number, processId: number): Promise<void> => {
    return api.delete(`/products/${productId}/processes/${processId}`);
  }
};