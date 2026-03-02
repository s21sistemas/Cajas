import { api } from "@/lib/api";

export interface LoanType {
  id: number;
  code: string;
  name: string;
  description: string;
  maxAmount: number;
  maxTermMonths: number;
  interestRate: number;
  requirements: string;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLoanTypeDto {
  code: string;
  name: string;
  description?: string;
  maxAmount: number;
  maxTermMonths: number;
  interestRate: number;
  requirements?: string;
  status?: "active" | "inactive";
}

export interface UpdateLoanTypeDto {
  code?: string;
  name?: string;
  description?: string;
  maxAmount?: number;
  maxTermMonths?: number;
  interestRate?: number;
  requirements?: string;
  status?: "active" | "inactive";
}

class LoanTypesService {
  private resource = "/loan-types";

  async getAll(): Promise<LoanType[]> {
    return await api.get<LoanType[]>(this.resource);
  }

  async getById(id: number): Promise<LoanType> {
    return await api.get<LoanType>(`${this.resource}/${id}`);
  }

  async create(data: CreateLoanTypeDto): Promise<LoanType> {
    return await api.post<LoanType>(this.resource, data);
  }

  async update(id: number, data: UpdateLoanTypeDto): Promise<LoanType> {
    return await api.put<LoanType>(`${this.resource}/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    await api.delete(`${this.resource}/${id}`);
  }
}

export const loanTypesService = new LoanTypesService();
