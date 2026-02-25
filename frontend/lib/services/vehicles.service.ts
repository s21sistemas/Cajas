import { api } from '@/lib/api';
import type { Vehicle, CreateVehicleDto, UpdateVehicleDto } from '@/lib/types/vehicle.types';

export const vehiclesService = {
  getAll: async () => {
    return api.get<Vehicle[]>('/vehicles');
  },

  getById: async (id: number) => {
    return api.get<Vehicle>(`/vehicles/${id}`);
  },

  create: async (data: CreateVehicleDto) => {
    return api.post<Vehicle>('/vehicles', data);
  },

  update: async (id: number, data: UpdateVehicleDto) => {
    return api.put<Vehicle>(`/vehicles/${id}`, data);
  },

  delete: async (id: number) => {
    return api.delete<void>(`/vehicles/${id}`);
  },
};
