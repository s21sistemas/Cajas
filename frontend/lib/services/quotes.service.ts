import { api } from '@/lib/api';
import type { 
  CreateQuoteDto, 
  UpdateQuoteDto,
  Quote, 
  QuoteItem,
  CreateQuoteItemDto,
  UpdateQuoteItemDto,
  QuoteStats,
  QuoteFilters
} from '@/lib/types';

export type { QuoteStats };

export const quotesService = {
  // Quotes CRUD
  getAll: async (params?: QuoteFilters) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.clientId) searchParams.set('client_id', params.clientId.toString());
    if (params?.perPage) searchParams.set('per_page', params.perPage.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    
    const query = searchParams.toString();
    return api.get<{ data: Quote[]; total: number; currentPage: number; lastPage: number }>(
      `/quotes${query ? `?${query}` : ''}`
    );
  },

  getById: async (id: number): Promise<Quote> => {
    return api.get<Quote>(`/quotes/${id}`);
  },

  create: async (data: CreateQuoteDto): Promise<Quote> => {
    return api.post<Quote>('/quotes', data);
  },

  update: async (id: number, data: UpdateQuoteDto): Promise<Quote> => {
    return api.put<Quote>(`/quotes/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return api.delete<void>(`/quotes/${id}`);
  },

  getStats: async (): Promise<QuoteStats> => {
    return api.get<QuoteStats>('/quotes/stats');
  },

  exportPdf: async (id: number): Promise<Blob> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/quotes/${id}/pdf`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    if (!response.ok) throw new Error('Error al generar PDF');
    return response.blob();
  },

  // Quote Items CRUD
  getItems: async (quoteId: number): Promise<QuoteItem[]> => {
    const quote = await api.get<Quote & { items: QuoteItem[] }>(`/quotes/${quoteId}`);
    return quote.items || [];
  },

  addItem: async (quoteId: number, data: CreateQuoteItemDto): Promise<QuoteItem> => {
    return api.post<QuoteItem>(`/quotes/${quoteId}/items`, data);
  },

  updateItem: async (quoteId: number, itemId: number, data: UpdateQuoteItemDto): Promise<QuoteItem> => {
    return api.put<QuoteItem>(`/quotes/${quoteId}/items/${itemId}`, data);
  },

  deleteItem: async (quoteId: number, itemId: number): Promise<void> => {
    return api.delete<void>(`/quotes/${quoteId}/items/${itemId}`);
  },
};
