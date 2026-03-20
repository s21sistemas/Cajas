import { BaseEntity, BaseFilters } from './api.types';

export interface Employee extends BaseEntity {
  code: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string | null;
  salary: number;
  hireDate: string;
  status: 'active' | 'inactive' | 'vacation';
  avatar: string | null;
}

export interface Absence extends BaseEntity {
  employeeId: number;
  employeeName: string;
  department: string;
  date: string;
  type: 'justified' | 'unjustified' | 'late';
  reason: string | null;
  status: 'registered' | 'justified' | 'discounted';
  deduction: number;
  employee?: Employee;
}

export interface Overtime extends BaseEntity {
  employeeId: number;
  employeeName: string;
  department: string;
  date: string;
  hours: number;
  type: 'simple' | 'double' | 'triple';
  rate: number;
  amount: number;
  status: 'pending' | 'approved' | 'paid';
  reason: string | null;
  employee?: Employee;
}

export interface GuardPayment extends BaseEntity {
  employeeId: number;
  employeeName: string;
  department: string;
  date: string;
  shift: 'day' | 'night' | 'weekend' | 'holiday';
  hours: number;
  rate: number;
  amount: number;
  status: string;
  notes: string | null;
  employee?: Employee;
}

export interface Discount extends BaseEntity {
  employeeId: number;
  employeeName: string;
  department: string;
  type: 'loan' | 'infonavit' | 'fonacot' | 'alimony' | 'other';
  description: string;
  amount: number;
  period: string;
  status: 'active' | 'completed' | 'paused';
  startDate: string;
  endDate: string | null;
  employee?: Employee;
}

export interface Disability extends BaseEntity {
  employeeId: number;
  employeeName: string;
  department: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  folio: string;
  status: string;
  description: string | null;
  employee?: Employee;
}

export interface VacationRequest extends BaseEntity {
  employeeId: number;
  employeeName: string;
  department: string;
  startDate: string;
  endDate: string;
  days: number;
  daysAvailable: number;
  type: 'vacation' | 'personal' | 'medical';
  status: 'pending' | 'approved' | 'rejected' | 'taken';
  reason: string | null;
  approvedBy: string | null;
  employee?: Employee;
}

export interface EmployeeAccount extends BaseEntity {
  employeeId: number;
  balance: number;
  lastMovement: string | null;
  employee?: Employee;
}

// DTOs for creating/updating
export interface CreateEmployeeDto {
  code: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone?: string;
  salary: number;
  hireDate: string;
  status?: Employee['status'];
  avatar?: string;
}

export interface CreateAbsenceDto {
  employeeId: number;
  date: string;
  type: Absence['type'];
  reason?: string;
  status?: Absence['status'];
  deduction?: number;
}

export interface CreateOvertimeDto {
  employeeId: number;
  date: string;
  hours: number;
  type: Overtime['type'];
  rate: number;
  amount: number;
  status?: Overtime['status'];
  reason?: string;
}

export interface CreateGuardPaymentDto {
  employeeId: number;
  date: string;
  shift: GuardPayment['shift'];
  hours: number;
  rate: number;
  amount: number;
  status?: string;
  notes?: string;
}

export interface CreateDiscountDto {
  employeeId: number;
  type: Discount['type'];
  description: string;
  amount: number;
  period: string;
  status?: Discount['status'];
  startDate: string;
  endDate?: string;
}

export interface CreateDisabilityDto {
  employeeId: number;
  type: Disability['type'];
  startDate: string;
  endDate: string;
  days: number;
  folio: string;
  status?: string;
  description?: string;
}

export interface CreateVacationRequestDto {
  employeeId: number;
  startDate: string;
  endDate: string;
  days: number;
  daysAvailable: number;
  type: VacationRequest['type'];
  status?: VacationRequest['status'];
  reason?: string;
  approvedBy?: string;
}

// Update DTOs
export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;
export type UpdateAbsenceDto = Partial<CreateAbsenceDto>;
export type UpdateOvertimeDto = Partial<CreateOvertimeDto>;
export type UpdateGuardPaymentDto = Partial<CreateGuardPaymentDto>;
export type UpdateDiscountDto = Partial<CreateDiscountDto>;
export type UpdateDisabilityDto = Partial<CreateDisabilityDto>;
export type UpdateVacationRequestDto = Partial<CreateVacationRequestDto>;

// Filters
export interface EmployeeFilters extends BaseFilters {
  status?: Employee['status'];
  department?: string;
  position?: string;
}

export interface AbsenceFilters extends BaseFilters {
  employeeId?: number;
  type?: Absence['type'];
  status?: Absence['status'];
  date?: string;
}

export interface OvertimeFilters extends BaseFilters {
  employeeId?: number;
  type?: Overtime['type'];
  status?: Overtime['status'];
  date?: string;
}

export interface GuardPaymentFilters extends BaseFilters {
  employeeId?: number;
  shift?: GuardPayment['shift'];
  status?: string;
  date?: string;
}

export interface DiscountFilters extends BaseFilters {
  employeeId?: number;
  type?: Discount['type'];
  status?: Discount['status'];
}

export interface DisabilityFilters extends BaseFilters {
  employeeId?: number;
  type?: Disability['type'];
  status?: string;
}

export interface VacationRequestFilters extends BaseFilters {
  employeeId?: number;
  type?: VacationRequest['type'];
  status?: VacationRequest['status'];
}