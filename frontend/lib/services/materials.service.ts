import { api } from '@/lib/api';
import type { CreateMaterialDto, Material, MaterialsStats, PaginatedResponse } from '@/lib/types';

export const materialsService = {
  getAll: (params?: { search?: string; status?: string; per_page?: number }): Promise<PaginatedResponse<Material>> => {
    return api.get<PaginatedResponse<Material>>('/materials', params);
  },

  getById: async (id: number) => {
    return api.get<Material>(`/materials/${id}`);
  },

  create: async (data: CreateMaterialDto) => {
    return api.post<Material>('/materials', data);
  },

  update: async (id: number, data: Partial<CreateMaterialDto>) => {
    return api.put<Material>(`/materials/${id}`, data);
  },

  delete: async (id: number) => {
    return api.delete<void>(`/materials/${id}`);
  },

  getStats: async () => {
    return api.get<MaterialsStats>('/materials/stats');
  },

  selectList: async () => {
    return api.get<Material[]>('/materials/select-list-materials');
  },
};
