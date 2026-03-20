export type OrderPedidoStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

export interface OrderPedidoItem {
  id: number;
  order_pedido_id: number;
  productId: number | null;
  productName: string;
  productCode: string | null;
  quantity: number;
  unit: string | null;
  created_at: string;
}

export interface OrderPedido {
  id: number;
  orderNumber: string;
  clientId: number | null;
  clientName: string | null;
  deliveryAddress: string | null;
  branchId: number | null;
  branchName: string | null;
  status: OrderPedidoStatus;
  picked_up_at: string | null;
  deliveredAt: string | null;
  deliveryPhoto: string | null;
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
  saleId?: number;
  sale?: {
    id: number;
    code: string;
  };
}

export interface CreateOrderPedidoDto {
  client_id?: number;
  client_name?: string;
  delivery_address?: string;
  branch_id?: number;
  branch_name?: string;
  sale_id?: number;
  notes?: string;
  pickup_date?: string;
  delivery_date?: string;
  supplier_name?: string;
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
