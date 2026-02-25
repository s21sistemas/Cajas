import { BaseEntity, BaseFilters } from './api.types';

export interface User extends BaseEntity {
  name: string;
  email: string;
  photo: string | null;
  roles: string[];
  directPermissions: string[];
  allPermissions: string[];
}

export interface Role {
  id: number;
  name: string;
  guardName: string;
  permissions: { id: number; name: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  roleId?: number;
  photo?: File;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  // Make fields optional for update
}

export interface UserFilters extends BaseFilters {
  role?: string;
  search?: string;
}
