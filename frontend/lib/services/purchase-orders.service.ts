import { api } from '@/lib/api';

export const purchaseOrdersService = {
  getAll: async (params?: { search?: string; status?: string; priority?: string; per_page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.priority) searchParams.set('priority', params.priority);
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    
    const query = searchParams.toString();
    return api.get<{ data: any[]; total: number; current_page: number; last_page: number }>(
      `/purchase-orders${query ? `?${query}` : ''}`
    );
  },

  getById: async (id: number) => {
    return api.get<any>(`/purchase-orders/${id}`);
  },

  create: async (data: any) => {
    return api.post<any>('/purchase-orders', data);
  },

  update: async (id: number, data: Partial<any>) => {
    return api.put<any>(`/purchase-orders/${id}`, data);
  },

  delete: async (id: number) => {
    return api.delete<void>(`/purchase-orders/${id}`);
  },

  getStats: async () => {
    return api.get<any>('/purchase-orders/stats');
  },

  recordPayment: async (id: number, data: { amount: number; payment_method: string; bank_account_id: number; reference?: string; payment_date: string }) => {
    return api.post<any>(`/purchase-orders/${id}/payment`, data);
  },

  getPayments: async (orderId: number) => {
    return api.get<any[]>(`/purchase-orders/${orderId}/payments`);
  },
};
