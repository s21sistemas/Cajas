import { BaseEntity } from './api.types';

export type ProcessStatusEnum = 'active' | 'inactive';

export interface Process extends BaseEntity {
  id: number;
  code: string;
  name: string;
  processType: string;
  description: string | null;
  requiresMachine: boolean;
  estimatedTimeMin: number | null;
  status: ProcessStatusEnum;
}

export interface ProcessStats {
  total: number;
  active: number;
  inactive: number;
  byType: Record<string, number>;
  withMachine: number;
  withoutMachine: number;
}

export interface CreateProcessDto {
  code?: string;
  name: string;
  processType: string;
  description?: string;
  requiresMachine?: boolean;
  estimatedTimeMin?: number;
  status?: ProcessStatusEnum;
}

export interface UpdateProcessDto extends Partial<CreateProcessDto> {
  status?: ProcessStatusEnum;
}

export interface ProcessFilters {
  page?: number;
  perPage?: number;
  search?: string;
  type?: string;
  status?: string;
}
