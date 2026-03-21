import { api } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";

export interface Loan {
  id: number;
  code: string;
  employee_id: number;
  employee_name?: string;
  employee?: {
    id: number;
    name: string;
    department: string;
  };
  loan_type_id: number | null;
  loan_type_name?: string;
  type: string;
  amount: number;
  paid: number;
  balance: number;
  installments: number;
  paid_installments: number;
  installment_amount: number;
  start_date: string;
  end_date: string | null;
  status: "pending" | "active" | "completed" | "cancelled";
  reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLoanDto {
  employee_id: number;
  loan_type_id?: number;
  type: string;
  amount: number;
  installments: number;
  start_date: string;
  end_date?: string;
  reason?: string;
  notes?: string;
}

export interface UpdateLoanDto {
  loan_type_id?: number;
  type?: string;
  amount?: number;
  installments?: number;
  start_date?: string;
  end_date?: string;
  status?: "pending" | "active" | "completed" | "cancelled";
  reason?: string;
  notes?: string;
}

export interface LoanFilters {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  employee_id?: number;
}

export interface LoanStats {
  total: number;
  pending: number;
  active: number;
  completed: number;
  totalAmount: number;
  totalPaid: number;
  totalBalance: number;
}

class LoansService {
  private resource = "/loans";

  async getAll(filters?: LoanFilters): Promise<PaginatedResponse<Loan>> {
    const params = new URLSearchParams();
    if (filters?.page) params.set("page", filters.page.toString());
    if (filters?.perPage) params.set("per_page", filters.perPage.toString());
    if (filters?.search) params.set("search", filters.search);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.employee_id) params.set("employee_id", filters.employee_id.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.resource}?${queryString}` : this.resource;

    return await api.get<PaginatedResponse<Loan>>(url);
  }

  async getById(id: number): Promise<Loan> {
    return await api.get<Loan>(`${this.resource}/${id}`);
  }

  async create(data: CreateLoanDto): Promise<Loan> {
    return await api.post<Loan>(this.resource, data);
  }

  async update(id: number, data: UpdateLoanDto): Promise<Loan> {
    return await api.put<Loan>(`${this.resource}/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    await api.delete(`${this.resource}/${id}`);
  }

  async stats(): Promise<LoanStats> {
    return await api.get<LoanStats>(`${this.resource}/stats`);
  }

  async activate(id: number): Promise<Loan> {
    return await api.patch<Loan>(`${this.resource}/${id}/activate`);
  }

  async cancel(id: number): Promise<Loan> {
    return await api.patch<Loan>(`${this.resource}/${id}/cancel`);
  }
}

export const loansService = new LoansService();
