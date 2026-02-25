import { api } from '../api';
import type {
  Employee,
  Absence,
  Overtime,
  GuardPayment,
  Discount,
  Disability,
  VacationRequest,
  EmployeeAccount,
  CreateEmployeeDto,
  CreateAbsenceDto,
  CreateOvertimeDto,
  CreateGuardPaymentDto,
  CreateDiscountDto,
  CreateDisabilityDto,
  CreateVacationRequestDto,
  UpdateEmployeeDto,
  UpdateAbsenceDto,
  UpdateOvertimeDto,
  UpdateGuardPaymentDto,
  UpdateDiscountDto,
  UpdateDisabilityDto,
  UpdateVacationRequestDto,
  EmployeeFilters,
  AbsenceFilters,
  OvertimeFilters,
  GuardPaymentFilters,
  DiscountFilters,
  DisabilityFilters,
  VacationRequestFilters,
  PaginatedResponse
} from '../types';

export const hrService = {
  // Employees

  getEmployees: (filters?: EmployeeFilters): Promise<PaginatedResponse<Employee>> => {
    return api.get<PaginatedResponse<Employee>>('/employees', filters);
  },

  getEmployeeById: (id: number): Promise<Employee> => {
    return api.get<Employee>(`/employees/${id}`);
  },

  createEmployee: (data: CreateEmployeeDto): Promise<Employee> => {
    return api.post<Employee>('/employees', data);
  },

  updateEmployee: (id: number, data: UpdateEmployeeDto): Promise<Employee> => {
    return api.put<Employee>(`/employees/${id}`, data);
  },

  deleteEmployee: (id: number): Promise<void> => {
    return api.delete(`/employees/${id}`);
  },

  updateEmployeeStatus: (id: number, status: Employee['status']): Promise<Employee> => {
    return api.patch<Employee>(`/employees/${id}/status`, { status });
  },

  // Absences

  getAbsences: (filters?: AbsenceFilters): Promise<PaginatedResponse<Absence>> => {
    return api.get<PaginatedResponse<Absence>>('/absences', filters);
  },

  getAbsenceById: (id: number): Promise<Absence> => {
    return api.get<Absence>(`/absences/${id}`);
  },

  createAbsence: (data: CreateAbsenceDto): Promise<Absence> => {
    return api.post<Absence>('/absences', data);
  },

  updateAbsence: (id: number, data: UpdateAbsenceDto): Promise<Absence> => {
    return api.put<Absence>(`/absences/${id}`, data);
  },

  deleteAbsence: (id: number): Promise<void> => {
    return api.delete(`/absences/${id}`);
  },

  justifyAbsence: (id: number, reason: string): Promise<Absence> => {
    return api.patch<Absence>(`/absences/${id}/justify`, { reason });
  },

  // Overtime

  getOvertime: (filters?: OvertimeFilters): Promise<PaginatedResponse<Overtime>> => {
    return api.get<PaginatedResponse<Overtime>>('/overtimes', filters);
  },

  getOvertimeById: (id: number): Promise<Overtime> => {
    return api.get<Overtime>(`/overtimes/${id}`);
  },

  createOvertime: (data: CreateOvertimeDto): Promise<Overtime> => {
    return api.post<Overtime>('/overtimes', data);
  },

  updateOvertime: (id: number, data: UpdateOvertimeDto): Promise<Overtime> => {
    return api.put<Overtime>(`/overtimes/${id}`, data);
  },

  deleteOvertime: (id: number): Promise<void> => {
    return api.delete(`/overtimes/${id}`);
  },

  approveOvertime: (id: number): Promise<Overtime> => {
    return api.patch<Overtime>(`/overtimes/${id}/approve`);
  },

  payOvertime: (id: number): Promise<Overtime> => {
    return api.patch<Overtime>(`/overtimes/${id}/pay`);
  },

  // Guard Payments

  getGuardPayments: (filters?: GuardPaymentFilters): Promise<PaginatedResponse<GuardPayment>> => {
    return api.get<PaginatedResponse<GuardPayment>>('/guard-payments', filters);
  },

  getGuardPaymentById: (id: number): Promise<GuardPayment> => {
    return api.get<GuardPayment>(`/guard-payments/${id}`);
  },

  createGuardPayment: (data: CreateGuardPaymentDto): Promise<GuardPayment> => {
    return api.post<GuardPayment>('/guard-payments', data);
  },

  updateGuardPayment: (id: number, data: UpdateGuardPaymentDto): Promise<GuardPayment> => {
    return api.put<GuardPayment>(`/guard-payments/${id}`, data);
  },

  deleteGuardPayment: (id: number): Promise<void> => {
    return api.delete(`/guard-payments/${id}`);
  },

  // Discounts

  getDiscounts: (filters?: DiscountFilters): Promise<PaginatedResponse<Discount>> => {
    return api.get<PaginatedResponse<Discount>>('/discounts', filters);
  },

  getDiscountById: (id: number): Promise<Discount> => {
    return api.get<Discount>(`/discounts/${id}`);
  },

  createDiscount: (data: CreateDiscountDto): Promise<Discount> => {
    return api.post<Discount>('/discounts', data);
  },

  updateDiscount: (id: number, data: UpdateDiscountDto): Promise<Discount> => {
    return api.put<Discount>(`/discounts/${id}`, data);
  },

  deleteDiscount: (id: number): Promise<void> => {
    return api.delete(`/discounts/${id}`);
  },

  pauseDiscount: (id: number): Promise<Discount> => {
    return api.patch<Discount>(`/discounts/${id}/pause`);
  },

  resumeDiscount: (id: number): Promise<Discount> => {
    return api.patch<Discount>(`/discounts/${id}/resume`);
  },

  completeDiscount: (id: number): Promise<Discount> => {
    return api.patch<Discount>(`/discounts/${id}/complete`);
  },

  // Disabilities

  getDisabilities: (filters?: DisabilityFilters): Promise<PaginatedResponse<Disability>> => {
    return api.get<PaginatedResponse<Disability>>('/disabilities', filters);
  },

  getDisabilityById: (id: number): Promise<Disability> => {
    return api.get<Disability>(`/disabilities/${id}`);
  },

  createDisability: (data: CreateDisabilityDto): Promise<Disability> => {
    return api.post<Disability>('/disabilities', data);
  },

  updateDisability: (id: number, data: UpdateDisabilityDto): Promise<Disability> => {
    return api.put<Disability>(`/disabilities/${id}`, data);
  },

  deleteDisability: (id: number): Promise<void> => {
    return api.delete(`/disabilities/${id}`);
  },

  // Vacation Requests

  getVacationRequests: (filters?: VacationRequestFilters): Promise<PaginatedResponse<VacationRequest>> => {
    return api.get<PaginatedResponse<VacationRequest>>('/vacation-requests', filters);
  },

  getVacationRequestById: (id: number): Promise<VacationRequest> => {
    return api.get<VacationRequest>(`/vacation-requests/${id}`);
  },

  createVacationRequest: (data: CreateVacationRequestDto): Promise<VacationRequest> => {
    return api.post<VacationRequest>('/vacation-requests', data);
  },

  updateVacationRequest: (id: number, data: UpdateVacationRequestDto): Promise<VacationRequest> => {
    return api.put<VacationRequest>(`/vacation-requests/${id}`, data);
  },

  deleteVacationRequest: (id: number): Promise<void> => {
    return api.delete(`/vacation-requests/${id}`);
  },

  approveVacationRequest: (id: number, approvedBy: string): Promise<VacationRequest> => {
    return api.patch<VacationRequest>(`/vacation-requests/${id}/approve`, { approvedBy });
  },

  rejectVacationRequest: (id: number, reason: string): Promise<VacationRequest> => {
    return api.patch<VacationRequest>(`/vacation-requests/${id}/reject`, { reason });
  },

  markVacationAsTaken: (id: number): Promise<VacationRequest> => {
    return api.patch<VacationRequest>(`/vacation-requests/${id}/taken`);
  },

  // Employee Accounts

  getEmployeeAccounts: (): Promise<EmployeeAccount[]> => {
    return api.get<EmployeeAccount[]>('/employee-accounts');
  },

  getEmployeeAccount: (employeeId: number): Promise<EmployeeAccount> => {
    return api.get<EmployeeAccount>(`/employee-accounts/${employeeId}`);
  },

  // Combined HR Stats
  getHrStats: (): Promise<{
    employees: {
      total: number;
      active: number;
      inactive: number;
      vacation: number;
    };
    absences: {
      total: number;
      justified: number;
      unjustified: number;
      late: number;
      thisMonth: number;
    };
    overtime: {
      total: number;
      pending: number;
      approved: number;
      paid: number;
      totalHours: number;
      totalAmount: number;
    };
    guardPayments: {
      total: number;
      totalAmount: number;
      byShift: Record<string, number>;
    };
    discounts: {
      total: number;
      active: number;
      completed: number;
      totalAmount: number;
    };
    disabilities: {
      total: number;
      active: number;
      totalDays: number;
    };
    vacationRequests: {
      total: number;
      pending: number;
      approved: number;
      taken: number;
      totalDays: number;
    };
  }> => {
    return api.get('/hr/stats');
  },

  // Employee-specific data
  getEmployeeDetails: (employeeId: number): Promise<{
    employee: Employee;
    absences: Absence[];
    overtime: Overtime[];
    guardPayments: GuardPayment[];
    discounts: Discount[];
    disabilities: Disability[];
    vacationRequests: VacationRequest[];
    account: EmployeeAccount;
  }> => {
    return api.get(`/employees/${employeeId}/details`);
  }
};