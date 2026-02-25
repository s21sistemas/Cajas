import { api } from '@/lib/api';
import type { Delivery, CreateDeliveryDto, UpdateDeliveryDto } from '@/lib/types/delivery.types';

export const deliveriesService = {
  getAll: async (params?: { vehicleId?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.vehicleId) searchParams.set('vehicle_id', params.vehicleId.toString());
    
    const query = searchParams.toString();
    return api.get<Delivery[]>(`/deliveries${query ? `?${query}` : ''}`);
  },

  getById: async (id: number) => {
    return api.get<Delivery>(`/deliveries/${id}`);
  },

  create: async (data: CreateDeliveryDto) => {
    return api.post<Delivery>('/deliveries', data);
  },

  update: async (id: number, data: UpdateDeliveryDto) => {
    return api.put<Delivery>(`/deliveries/${id}`, data);
  },

  delete: async (id: number) => {
    return api.delete<void>(`/deliveries/${id}`);
  },
};
