import { api } from '../api';
import type { Client, Branch, CreateClientDto, UpdateClientDto, CreateBranchDto, UpdateBranchDto, ClientFilters, PaginatedResponse } from '../types';

export interface ClientStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
  totalCredit: number;
  totalBalance: number;
}

export interface BranchStats {
  total: number;
  active: number;
  inactive: number;
  cities: number;
}

export interface ClientPaginationParams extends ClientFilters {
  page?: number;
  perPage?: number;
}

export interface BranchPaginationParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  clientId?: number;
}

export const clientsService = {
  // Clientes
  getAll: (params?: ClientPaginationParams): Promise<PaginatedResponse<Client>> => {
    return api.get<PaginatedResponse<Client>>('/clients', params);
  },

  getById: (id: number): Promise<Client> => {
    return api.get<Client>(`/clients/${id}`);
  },

  getStats: (): Promise<ClientStats> => {
    return api.get<ClientStats>('/clients/stats');
  },

  selectList: (): Promise<Client[]> => {
    return api.get<Client[]>('/clients/select-list-client');
  },

  create: (data: CreateClientDto): Promise<Client> => {
    return api.post<Client>('/clients', data);
  },

  update: (id: number, data: UpdateClientDto): Promise<Client> => {
    return api.put<Client>(`/clients/${id}`, data);
  },

  delete: (id: number): Promise<void> => {
    return api.delete(`/clients/${id}`);
  },

  // Sucursales
  getBranches: (params?: BranchPaginationParams): Promise<PaginatedResponse<Branch>> => {
    return api.get<PaginatedResponse<Branch>>('/branches', params);
  },

  getBranchesList: (): Promise<Branch[]> => {
     return api.get<Branch[]>('/branches');
  },

  getBranchSelectList: (clientId?: number): Promise<Branch[]> => {
    const queryParams = clientId ? `?client_id=${clientId}` : '';
    return api.get<Branch[]>(`/branches/select-list${queryParams}`);
  },

  getBranchById: (id: number): Promise<Branch> => {
    return api.get<Branch>(`/branches/${id}`);
  },

  getBranchStats: (): Promise<BranchStats> => {
    return api.get<BranchStats>('/branches/stats');
  },

  createBranch: (data: CreateBranchDto): Promise<Branch> => {
    return api.post<Branch>('/branches', data);
  },

  updateBranch: (id: number, data: UpdateBranchDto): Promise<Branch> => {
    return api.put<Branch>(`/branches/${id}`, data);
  },

  deleteBranch: (id: number): Promise<void> => {
    return api.delete(`/branches/${id}`);
  },
};