import { api } from "@/lib/api";

export interface DiscountType {
  id: number;
  code: string;
  name: string;
  description: string;
  category: "legal" | "voluntary" | "company";
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDiscountTypeDto {
  code: string;
  name: string;
  description?: string;
  category: "legal" | "voluntary" | "company";
  status?: "active" | "inactive";
}

export interface UpdateDiscountTypeDto {
  code?: string;
  name?: string;
  description?: string;
  category?: "legal" | "voluntary" | "company";
  status?: "active" | "inactive";
}

class DiscountTypesService {
  private resource = "/discount-types";

  async getAll(): Promise<DiscountType[]> {
    return await api.get<DiscountType[]>(this.resource);
  }

  async getById(id: number): Promise<DiscountType> {
    return await api.get<DiscountType>(`${this.resource}/${id}`);
  }

  async create(data: CreateDiscountTypeDto): Promise<DiscountType> {
    return await api.post<DiscountType>(this.resource, data);
  }

  async update(id: number, data: UpdateDiscountTypeDto): Promise<DiscountType> {
    return await api.put<DiscountType>(`${this.resource}/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    await api.delete(`${this.resource}/${id}`);
  }
}

export const discountTypesService = new DiscountTypesService();
