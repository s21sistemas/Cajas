export type OrderPedidoStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

export interface OrderPedidoItem {
  id: number;
  order_pedido_id: number;
  product_id: number | null;
  product_name: string;
  product_code: string | null;
  quantity: number;
  unit: string | null;
  created_at: string;
}

export interface OrderPedido {
  id: number;
  order_number: string;
  client_id: number | null;
  client_name: string | null;
  delivery_address: string | null;
  branch_id: number | null;
  branch_name: string | null;
  supplier_user_id: number | null;
  supplier?: {
    id: number;
    name: string;
    email: string;
  };
  status: OrderPedidoStatus;
  picked_up_at: string | null;
  delivered_at: string | null;
  delivery_photo: string | null;
  notes: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  items?: OrderPedidoItem[];
  client?: {
    id: number;
    name: string;
  };
  branch?: {
    id: number;
    name: string;
  };
}

export interface CreateOrderPedidoDto {
  client_id?: number;
  client_name?: string;
  delivery_address?: string;
  branch_id?: number;
  branch_name?: string;
  notes?: string;
  items: {
    product_id?: number;
    product_name: string;
    product_code?: string;
    quantity: number;
    unit?: string;
  }[];
}

export interface AssignOrderPedidoDto {
  supplier_user_id: number;
}

export interface PickUpOrderPedidoDto {
  picked_up_at?: string;
}

export interface DeliverOrderPedidoDto {
  delivered_at?: string;
  delivery_photo?: string;
}

export interface OrderPedidoStats {
  total: number;
  pending: number;
  assigned: number;
  picked_up: number;
  in_transit: number;
  delivered: number;
  cancelled: number;
  byStatus: Record<string, number>;
}
