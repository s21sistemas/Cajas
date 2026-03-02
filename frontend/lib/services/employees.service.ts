import { api } from '@/lib/api';

export const employeesService = {
  getAll: async (params?: { search?: string; department?: string; status?: string; per_page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.department) searchParams.set('department', params.department);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    
    const query = searchParams.toString();
    return api.get<{ data: any[]; total: number; current_page: number; last_page: number }>(
      `/employees${query ? `?${query}` : ''}`
    );
  },

  getById: async (id: number) => {
    return api.get<any>(`/employees/${id}`);
  },

  create: async (data: any) => {
    return api.post<any>('/employees', data);
  },

  update: async (id: number, data: Partial<any>) => {
    return api.put<any>(`/employees/${id}`, data);
  },

  delete: async (id: number) => {
    return api.delete<void>(`/employees/${id}`);
  },

  getStats: async () => {
    return api.get<any>('/employees/stats');
  },

  getDepartments: async () => {
    return api.get<string[]>('/employees/departments');
  },

  getSelectList: async () => {
    return api.get<any[]>('/employees/select-list');
  }
};
