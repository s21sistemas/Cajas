import { api } from '../api';
import { 
  Vehicle, 
  CreateVehicleDto, 
  UpdateVehicleDto 
} from '../types/vehicle.types';
import { 
  Delivery, 
  CreateDeliveryDto, 
  UpdateDeliveryDto 
} from '../types/delivery.types';
import { 
  GasolineReceipt, 
  CreateGasolineReceiptDto, 
  UpdateGasolineReceiptDto 
} from '../types/gasoline-receipt.types';

function extractData<T>(response: any): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data;
  }
  return response;
}

export const logisticsService = {
  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    const response = await api.get<Vehicle[]>('/vehicles');
    return extractData(response);
  },

  async getVehicle(id: number): Promise<Vehicle> {
    const response = await api.get<Vehicle>(`/vehicles/${id}`);
    return extractData(response);
  },

  async createVehicle(data: CreateVehicleDto): Promise<Vehicle> {
    const response = await api.post<Vehicle>('/vehicles', data);
    return extractData(response);
  },

  async updateVehicle(id: number, data: UpdateVehicleDto): Promise<Vehicle> {
    const response = await api.put<Vehicle>(`/vehicles/${id}`, data);
    return extractData(response);
  },

  async deleteVehicle(id: number): Promise<void> {
    await api.delete(`/vehicles/${id}`);
  },

  // Deliveries
  async getDeliveries(): Promise<Delivery[]> {
    const response = await api.get<Delivery[]>('/deliveries');
    return extractData(response);
  },

  async getDelivery(id: number): Promise<Delivery> {
    const response = await api.get<Delivery>(`/deliveries/${id}`);
    return extractData(response);
  },

  async createDelivery(data: CreateDeliveryDto): Promise<Delivery> {
    const response = await api.post<Delivery>('/deliveries', data);
    return extractData(response);
  },

  async updateDelivery(id: number, data: UpdateDeliveryDto): Promise<Delivery> {
    const response = await api.put<Delivery>(`/deliveries/${id}`, data);
    return extractData(response);
  },

  async deleteDelivery(id: number): Promise<void> {
    await api.delete(`/deliveries/${id}`);
  },

  // Gasoline Receipts
  async getGasolineReceipts(): Promise<GasolineReceipt[]> {
    const response = await api.get<GasolineReceipt[]>('/gasoline-receipts');
    return extractData(response);
  },

  async getGasolineReceipt(id: number): Promise<GasolineReceipt> {
    const response = await api.get<GasolineReceipt>(`/gasoline-receipts/${id}`);
    return extractData(response);
  },

  async createGasolineReceipt(data: CreateGasolineReceiptDto): Promise<GasolineReceipt> {
    const response = await api.post<GasolineReceipt>('/gasoline-receipts', data);
    return extractData(response);
  },

  async updateGasolineReceipt(id: number, data: UpdateGasolineReceiptDto): Promise<GasolineReceipt> {
    const response = await api.put<GasolineReceipt>(`/gasoline-receipts/${id}`, data);
    return extractData(response);
  },

  async deleteGasolineReceipt(id: number): Promise<void> {
    await api.delete(`/gasoline-receipts/${id}`);
  },
};
