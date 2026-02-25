import { api } from '../api';
import type { Operator, CreateOperatorDto, UpdateOperatorDto, PaginatedResponse } from '../types';

export interface OperatorStats {
  total: number;
  active: number;
  inactive: number;
}

export const operatorsService = {
  // Get all operators
  getAll: (filters?: any): Promise<PaginatedResponse<Operator>> => {
    return api.get<PaginatedResponse<Operator>>('/operators', filters);
  },

  // Get operator by ID
  getById: (id: number): Promise<Operator> => {
    return api.get<Operator>(`/operators/${id}`);
  },

  // Get operator statistics
  getStats: (): Promise<OperatorStats> => {
    return api.get<OperatorStats>('/operators/stats');
  },

  // Create new operator
  create: (data: CreateOperatorDto): Promise<Operator> => {
    return api.post<Operator>('/operators', data);
  },

  // Update existing operator
  update: (id: number, data: UpdateOperatorDto): Promise<Operator> => {
    return api.put<Operator>(`/operators/${id}`, data);
  },

  // Delete operator
  delete: (id: number): Promise<void> => {
    return api.delete(`/operators/${id}`);
  },
};
