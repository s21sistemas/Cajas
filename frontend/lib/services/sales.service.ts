import { api } from '@/lib/api';

export const salesService = {
  getAll: async (params?: { search?: string; status?: string; per_page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    
    const query = searchParams.toString();
    return api.get<{ data: any[]; total: number; current_page: number; last_page: number }>(
      `/sales${query ? `?${query}` : ''}`
    );
  },

  getById: async (id: number) => {
    return api.get<any>(`/sales/${id}`);
  },

  create: async (data: any) => {
    return api.post<any>('/sales', data);
  },

  update: async (id: number, data: Partial<any>) => {
    return api.put<any>(`/sales/${id}`, data);
  },

  delete: async (id: number) => {
    return api.delete<void>(`/sales/${id}`);
  },

  recordPayment: async (id: number, data: { amount: number; payment_method: string }) => {
    return api.post<any>(`/sales/${id}/record-payment`, data);
  },

  getStats: async () => {
    return api.get<any>('/sales/stats');
  },
};
