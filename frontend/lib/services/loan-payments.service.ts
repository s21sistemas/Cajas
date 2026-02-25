import { api } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";

export interface LoanPayment {
  id: number;
  loan_id: number;
  loan?: {
    id: number;
    code: string;
    type: string;
    amount: number;
    balance: number;
  };
  employee_id: number;
  employee_name?: string;
  employee?: {
    id: number;
    name: string;
    department: string;
  };
  date: string;
  amount: number;
  method: "payroll" | "cash" | "transfer" | "other";
  reference: string | null;
  notes: string | null;
  status: "pending" | "applied" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface CreateLoanPaymentDto {
  loan_id: number;
  employee_id?: number;
  date: string;
  amount: number;
  method: "payroll" | "cash" | "transfer" | "other";
  reference?: string;
  notes?: string;
}

export interface UpdateLoanPaymentDto {
  date?: string;
  amount?: number;
  method?: "payroll" | "cash" | "transfer" | "other";
  reference?: string;
  notes?: string;
  status?: "pending" | "applied" | "cancelled";
}

export interface LoanPaymentFilters {
  page?: number;
  perPage?: number;
  loan_id?: number;
  employee_id?: number;
  status?: string;
}

class LoanPaymentsService {
  private resource = "/loan-payments";

  async getAll(filters?: LoanPaymentFilters): Promise<PaginatedResponse<LoanPayment>> {
    const params = new URLSearchParams();
    if (filters?.page) params.set("page", filters.page.toString());
    if (filters?.perPage) params.set("per_page", filters.perPage.toString());
    if (filters?.loan_id) params.set("loan_id", filters.loan_id.toString());
    if (filters?.employee_id) params.set("employee_id", filters.employee_id.toString());
    if (filters?.status) params.set("status", filters.status);

    const queryString = params.toString();
    const url = queryString ? `${this.resource}?${queryString}` : this.resource;

    return await api.get<PaginatedResponse<LoanPayment>>(url);
  }

  async getById(id: number): Promise<LoanPayment> {
    return await api.get<LoanPayment>(`${this.resource}/${id}`);
  }

  async create(data: CreateLoanPaymentDto): Promise<LoanPayment> {
    return await api.post<LoanPayment>(this.resource, data);
  }

  async update(id: number, data: UpdateLoanPaymentDto): Promise<LoanPayment> {
    return await api.put<LoanPayment>(`${this.resource}/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    await api.delete(`${this.resource}/${id}`);
  }

  async cancel(id: number): Promise<LoanPayment> {
    return await api.patch<LoanPayment>(`${this.resource}/${id}/cancel`);
  }
}

export const loanPaymentsService = new LoanPaymentsService();
