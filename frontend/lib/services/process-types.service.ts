import { api } from "@/lib/api";

export interface ProcessType {
  id: number;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProcessTypeDto {
  name: string;
  description?: string;
}

export interface UpdateProcessTypeDto {
  name?: string;
  description?: string;
}

class ProcessTypesService {
  private resource = "/process-types";

  async getAll(): Promise<ProcessType[]> {
    return await api.get<ProcessType[]>(this.resource);
  }

  async getById(id: number): Promise<ProcessType> {
    return await api.get<ProcessType>(`${this.resource}/${id}`);
  }

  async create(data: CreateProcessTypeDto): Promise<ProcessType> {
    return await api.post<ProcessType>(this.resource, data);
  }

  async update(id: number, data: UpdateProcessTypeDto): Promise<ProcessType> {
    return await api.put<ProcessType>(`${this.resource}/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    await api.delete(`${this.resource}/${id}`);
  }
}

export const processTypesService = new ProcessTypesService();
