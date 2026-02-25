import { BaseEntity } from './api.types';

export interface Operator extends BaseEntity {
  employeeCode: string;
  name: string;
  shift: string | null;
  specialty: string | null;
  active: boolean;
  phone: string | null;
  email: string | null;
  hireDate: string | null;
}

export interface CreateOperatorDto {
  employeeCode: string;
  name: string;
  shift?: string;
  specialty?: string;
  active?: boolean;
  phone?: string;
  email?: string;
  hireDate?: string;
}

export interface UpdateOperatorDto extends Partial<CreateOperatorDto> {}

export interface OperatorFilters {
  search?: string;
  shift?: string;
  specialty?: string;
  active?: boolean;
}
