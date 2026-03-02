import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/lib/types/api.types';

export interface AccountStatement {
  id: number;
  sale_id?: number;
  client_id: number;
  clientName?: string;
  code?: string;
  date: string;
  dueDate: string | null;
  amount: number;
  paid: number;
  balance: number;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  concept: string;
  created_at?: string;
  updated_at?: string;
  client?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  sale?: {
    id: number;
    code: string;
  };
}

export interface CreateAccountStatementDto {
  client_id: number;
  sale_id?: number;
  date: string;
  due_date?: string;
  amount: number;
  paid?: number;
  balance: number;
  status?: 'pending' | 'paid' | 'overdue' | 'partial';
  concept: string;
}

export interface UpdateAccountStatementDto extends Partial<CreateAccountStatementDto> {}

export interface AccountStatementDataResponse {
  data: AccountStatement[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: AccountStatementStats;
}

export interface AccountStatementFilters {
  search?: string;
  client_id?: number;
  status?: 'pending' | 'paid' | 'overdue' | 'partial';
  date_from?: string;
  date_to?: string;
}

export interface AccountStatementStats {
  totalInvoices: number;
  totalReceivable: number;
  totalPaid: number;
  totalOverdue: number;
  totalPending: number;
  totalPartial: number;
  byClient: Array<{
    clientId: number;
    clientName: string;
    totalInvoices: number;
    totalReceivable: number;
    totalPaid: number;
    overdue: number;
  }>;
}

export const accountStatementsService = {
  getAll: (filters?: AccountStatementFilters): Promise<PaginatedResponse<AccountStatement>> => {
    return api.get<PaginatedResponse<AccountStatement>>('/account-statements', filters);
  },

  getStats: (clientId?: number): Promise<AccountStatementStats> => {
    return api.get<AccountStatementStats>('/account-statements/stats', { client_id: clientId });
  },

  getById: (id: number): Promise<AccountStatement> => {
    return api.get<AccountStatement>(`/account-statements/${id}`);
  },

  create: (data: CreateAccountStatementDto): Promise<AccountStatement> => {
    return api.post<AccountStatement>('/account-statements', data);
  },

  update: (id: number, data: UpdateAccountStatementDto): Promise<AccountStatement> => {
    return api.put<AccountStatement>(`/account-statements/${id}`, data);
  },

  delete: (id: number): Promise<void> => {
    return api.delete<void>(`/account-statements/${id}`);
  },
};
