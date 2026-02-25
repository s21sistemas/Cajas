import type { Employee } from '@/lib/types';

export interface CreateEmployeeDto {
  code: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone?: string;
  salary: number;
  hire_date: string;
  status?: 'active' | 'inactive' | 'vacation';
  avatar?: string;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  status?: string;
}

export interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  vacation: number;
  departments: number;
  totalPayroll: number;
}
