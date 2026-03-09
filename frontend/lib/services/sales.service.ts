import { api, apiClient } from '@/lib/api';

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

  recordPayment: async (id: number, data: { amount: number; payment_method: string; bank_account_id: number; reference?: string; payment_date: string }) => {
    return api.post<any>(`/sales/${id}/payment`, data);
  },

  getPayments: async (saleId: number) => {
    return api.get<any[]>(`/sales/${saleId}/payments`);
  },

  complete: async (id: number, data: { payment_type?: string; credit_days?: number; bank_account_id?: number }) => {
    return api.post<any>(`/sales/${id}/complete`, data);
  },

  getItems: async (saleId: number) => {
    return api.get<any[]>(`/sales/${saleId}/items`);
  },

  addItem: async (saleId: number, data: any) => {
    return api.post<any>(`/sales/${saleId}/items`, data);
  },

  updateItem: async (saleId: number, itemId: number, data: Partial<any>) => {
    return api.put<any>(`/sales/${saleId}/items/${itemId}`, data);
  },

  deleteItem: async (saleId: number, itemId: number) => {
    return api.delete<void>(`/sales/${saleId}/items/${itemId}`);
  },

  exportPdf: async (id: number): Promise<Blob> => {    
      const response = await apiClient.get(`/sales/${id}/pdf`, {
        responseType: 'blob',
      });
      
      // Crear un blob URL para descargar el PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cotizacion-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return response;
    
  },

  getStats: (): Promise<{
    total: number;
    totalAmount: number;
  }> => {
    return api.get('/sales/stats');
  },

  // Get sales by client ID
  getByClient: async (clientId: number): Promise<{ data: any[]; success: boolean }> => {
    return api.get<{ data: any[]; success: boolean }>(`/sales/by-client/${clientId}`);
  },

  // Get all sales for select list (with client info)
  getSelectList: async (): Promise<any[]> => {
    return api.get<any[]>('/sales/select-list');
  }
};
