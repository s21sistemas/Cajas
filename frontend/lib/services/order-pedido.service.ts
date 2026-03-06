import { api } from '@/lib/api';
import type { 
  OrderPedido, 
  CreateOrderPedidoDto, 
  AssignOrderPedidoDto,
  PickUpOrderPedidoDto,
  DeliverOrderPedidoDto,
  OrderPedidoStats 
} from '@/lib/types/order-pedido.types';

export const orderPedidoService = {
  getAll: async (params?: { 
    status?: string;
    supplier_user_id?: number;
    client_id?: number;
    date_from?: string;
    date_to?: string;
    per_page?: number;
    page?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.supplier_user_id) searchParams.set('supplier_user_id', params.supplier_user_id.toString());
    if (params?.client_id) searchParams.set('client_id', params.client_id.toString());
    if (params?.date_from) searchParams.set('date_from', params.date_from);
    if (params?.date_to) searchParams.set('date_to', params.date_to);
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    
    const query = searchParams.toString();
    return api.get<{ data: OrderPedido[], meta: any }>(`/order-pedidos${query ? `?${query}` : ''}`);
  },

  getById: async (id: number) => {
    return api.get<OrderPedido>(`/order-pedidos/${id}`);
  },

  getStats: async () => {
    return api.get<OrderPedidoStats>('/order-pedidos/stats');
  },

  getAvailable: async (params?: { per_page?: number; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    
    const query = searchParams.toString();
    return api.get<{ data: OrderPedido[], meta: any }>(`/order-pedidos/available${query ? `?${query}` : ''}`);
  },

  getMyOrders: async (params?: { status?: string; per_page?: number; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    
    const query = searchParams.toString();
    return api.get<{ data: OrderPedido[], meta: any }>(`/order-pedidos/my-orders${query ? `?${query}` : ''}`);
  },

  create: async (data: CreateOrderPedidoDto) => {
    return api.post<OrderPedido>('/order-pedidos', data);
  },

  update: async (id: number, data: Partial<CreateOrderPedidoDto>) => {
    return api.put<OrderPedido>(`/order-pedidos/${id}`, data);
  },

  delete: async (id: number) => {
    return api.delete<void>(`/order-pedidos/${id}`);
  },

  assign: async (id: number, data: AssignOrderPedidoDto) => {
    return api.post<OrderPedido>(`/order-pedidos/${id}/assign`, data);
  },

  pickUp: async (id: number, data?: PickUpOrderPedidoDto) => {
    return api.post<OrderPedido>(`/order-pedidos/${id}/pick-up`, data || {});
  },

  deliver: async (id: number, data?: DeliverOrderPedidoDto) => {
    return api.post<OrderPedido>(`/order-pedidos/${id}/deliver`, data || {});
  },
};
