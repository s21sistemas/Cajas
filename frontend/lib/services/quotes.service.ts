import { api, apiClient } from '@/lib/api';

export const quotesService = {
  getByClient: async (clientId: number, withoutSale: boolean = false) => {
    const params = withoutSale ? '?without_sale=true' : '';
    return api.get<any>(`/quotes/by-client/${clientId}${params}`);
  },

  // Obtener todas las cotizaciones sin venta (para crear venta directamente)
  getWithoutSale: async () => {
    return api.get<any>('/quotes/without-sale');
  },

  getItems: async (quoteId: number) => {
    return api.get<any>(`/quotes/${quoteId}/items`);
  },

  getAll: async (params?: { search?: string; status?: string; per_page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    
    const query = searchParams.toString();
    return api.get<any>(`/quotes${query ? `?${query}` : ''}`);
  },

  getById: async (id: number) => {
    return api.get<any>(`/quotes/${id}`);
  },

  create: async (data: any) => {
    return api.post<any>('/quotes', data);
  },

  update: async (id: number, data: Partial<any>) => {
    return api.put<any>(`/quotes/${id}`, data);
  },

  delete: async (id: number) => {
    return api.delete<any>(`/quotes/${id}`);
  },

  sendEmail: async (id: number) => {
    return api.post<any>(`/quotes/${id}/send-email`);
  },

  getStats: async () => {
    return api.get<any>('/quotes/stats');
  },

  downloadPdf: async (id: number) => {
    const response = await apiClient.get(`/quotes/${id}/pdf`, {
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

  // Aprobar cotización y subir documento (para usuarios internos)
  approveDocument: async (quoteId: number, formData: FormData) => {
    return api.post<any>(`/quotes/${quoteId}/approve-document`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
