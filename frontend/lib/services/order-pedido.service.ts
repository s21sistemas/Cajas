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

  create: async (data: CreateOrderPedidoDto & { evidenceFile?: File }) => {
    // Check if there's an evidence file to upload
    if (data.evidenceFile) {
      const formData = new FormData();
      
      // Add regular fields to form data
      if (data.client_id) formData.append('client_id', data.client_id.toString());
      if (data.delivery_address) formData.append('delivery_address', data.delivery_address);
      if (data.notes) formData.append('notes', data.notes);
      if (data.sale_id) formData.append('sale_id', data.sale_id.toString());
      if (data.branch_id) formData.append('branch_id', data.branch_id.toString());
      if (data.pickup_date) formData.append('pickup_date', data.pickup_date);
      if (data.delivery_date) formData.append('delivery_date', data.delivery_date);
      if (data.supplier_name) formData.append('supplier_name', data.supplier_name);
      
      // Add items
      if (data.items && data.items.length > 0) {
        data.items.forEach((item, index) => {
          formData.append(`items[${index}][product_id]`, item.product_id?.toString() || '');
          formData.append(`items[${index}][product_name]`, item.product_name);
          formData.append(`items[${index}][product_code]`, item.product_code || '');
          formData.append(`items[${index}][quantity]`, item.quantity.toString());
          formData.append(`items[${index}][unit]`, item.unit || '');
        });
      }
      
      // Add the evidence file
      formData.append('evidence', data.evidenceFile);
      
      return api.post<OrderPedido>('/order-pedidos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    
    return api.post<OrderPedido>('/order-pedidos', data);
  },

  update: async (id: number, data: Partial<CreateOrderPedidoDto> & { evidenceFile?: File }) => {
    // Check if there's an evidence file to upload
    if (data.evidenceFile) {
      const formData = new FormData();
      
      // Add regular fields to form data
      if (data.client_id) formData.append('client_id', data.client_id.toString());
      if (data.delivery_address) formData.append('delivery_address', data.delivery_address);
      if (data.notes) formData.append('notes', data.notes);
      if (data.sale_id) formData.append('sale_id', data.sale_id.toString());
      if (data.branch_id) formData.append('branch_id', data.branch_id.toString());
      if (data.pickup_date) formData.append('pickup_date', data.pickup_date);
      if (data.delivery_date) formData.append('delivery_date', data.delivery_date);
      if (data.supplier_name) formData.append('supplier_name', data.supplier_name);
      // if (data.status) formData.append('status', data.status);
      
      // Add items
      if (data.items && data.items.length > 0) {
        data.items.forEach((item, index) => {
          formData.append(`items[${index}][product_id]`, item.product_id?.toString() || '');
          formData.append(`items[${index}][product_name]`, item.product_name);
          formData.append(`items[${index}][product_code]`, item.product_code || '');
          formData.append(`items[${index}][quantity]`, item.quantity.toString());
          formData.append(`items[${index}][unit]`, item.unit || '');
        });
      }
      
      // Add the evidence file
      formData.append('evidence', data.evidenceFile);
      
      return api.post<OrderPedido>(`/order-pedidos/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    
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
