import { api } from '../api';
import type { Process, CreateProcessDto, UpdateProcessDto, PaginatedResponse, ProcessStats } from '../types';

export type { ProcessStats };

export const processesService = {
  // Get all processes
  getAll: (filters?: any): Promise<PaginatedResponse<Process>> => {
    return api.get<PaginatedResponse<Process>>('/processes', filters);
  },

  // Get process by ID
  getById: (id: number): Promise<Process> => {
    return api.get<Process>(`/processes/${id}`);
  },

  // Create new process
  create: (data: CreateProcessDto): Promise<Process> => {
    return api.post<Process>('/processes', data);
  },

  // Update existing process
  update: (id: number, data: UpdateProcessDto): Promise<Process> => {
    return api.put<Process>(`/processes/${id}`, data);
  },

  // Delete process
  delete: (id: number): Promise<void> => {
    return api.delete(`/processes/${id}`);
  },

  // Get stats
  getStats: () => {
    return api.get('/processes/stats');
  },

  // Get processes for select list
  selectList: (): Promise<Process[]> => {
    return api.get<Process[]>('/processes/select-list');
  },
};
