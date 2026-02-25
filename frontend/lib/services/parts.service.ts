import { api } from '@/lib/api';
import type { CreatePartDto, Part, PartsStats } from '@/lib/types';

export const partsService = {
  getAll: async (params?: { search?: string; status?: string; per_page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    
    const query = searchParams.toString();
    return api.get<{ data: Part[]; total: number; current_page: number; last_page: number }>(
      `/parts${query ? `?${query}` : ''}`
    );
  },

  getById: async (id: number) => {
    return api.get<Part>(`/parts/${id}`);
  },

  create: async (data: CreatePartDto) => {
    return api.post<Part>('/parts', data);
  },

  update: async (id: number, data: Partial<CreatePartDto>) => {
    return api.put<Part>(`/parts/${id}`, data);
  },

  delete: async (id: number) => {
    return api.delete<void>(`/parts/${id}`);
  },

  getStats: async () => {
    return api.get<PartsStats>('/parts/stats');
  },
};
