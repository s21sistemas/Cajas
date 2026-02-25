import { api } from '@/lib/api';
import type { User, Role, CreateUserDto, UpdateUserDto, UserFilters } from '@/lib/types/user.types';

export const usersService = {
  getAll: async (params?: UserFilters) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.perPage) searchParams.set('per_page', params.perPage.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    
    const query = searchParams.toString();
    return api.get<{ data: User[]; total: number; current_page: number; last_page: number }>(
      `/users${query ? `?${query}` : ''}`
    );
  },

  getById: async (id: number) => {
    return api.get<User>(`/users/${id}`);
  },

  create: async (data: CreateUserDto) => {
    return api.post<User>('/users', {
      name: data.name,
      email: data.email,
      password: data.password,
      role_id: data.roleId,
    });
  },

  update: async (id: number, data: UpdateUserDto) => {
    return api.put<User>(`/users/${id}`, {
      name: data.name,
      email: data.email,
      password: data.password,
      role_id: data.roleId,
    });
  },

  delete: async (id: number) => {
    return api.delete<void>(`/users/${id}`);
  },
};

export const rolesService = {
  getAll: async () => {
    return api.get<Role[]>('/roles');
  },

  getById: async (id: number) => {
    return api.get<Role>(`/roles/${id}`);
  },

  create: async (data: { name: string; permissions: number[] }) => {
    return api.post<Role>('/roles', data);
  },

  update: async (id: number, data: { name?: string; permissions?: number[] }) => {
    return api.put<Role>(`/roles/${id}`, data);
  },

  delete: async (id: number) => {
    return api.delete<void>(`/roles/${id}`);
  },
};

export const permissionsService = {
  getAll: async () => {
    return api.get<{ id: number; name: string }[]>('/permissions');
  },
};
