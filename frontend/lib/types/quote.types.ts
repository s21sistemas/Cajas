// Quote types
export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

export interface QuoteItem {
  id: number;
  quoteId: number;
  unit: string | null;
  partNumber: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Quote {
  id: number;
  code: string;
  clientId: number;
  clientName: string;
  title: string;
  items: number;
  subtotal: number;
  tax: number;
  total: number;
  status: QuoteStatus;
  validUntil: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  client?: {
    id: number;
    name: string;
    rfc?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  itemsList?: QuoteItem[];
}

export interface QuoteWithItems extends Quote {
  itemsList: QuoteItem[];
}

export interface CreateQuoteDto {
  code: string;
  clientId: number;
  title: string;
  validUntil: string;
  createdBy: string;
  status?: QuoteStatus;
}

export interface UpdateQuoteDto {
  title?: string;
  status?: QuoteStatus;
  validUntil?: string;
  createdBy?: string;
}

export interface CreateQuoteItemDto {
  unit?: string;
  partNumber?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateQuoteItemDto {
  unit?: string;
  partNumber?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
}

export interface QuoteStats {
  total: number;
  draft: number;
  sent: number;
  approved: number;
  rejected: number;
  expired: number;
  totalValue: number;
}

export interface QuoteFilters {
  search?: string;
  status?: QuoteStatus;
  clientId?: number;
  per_page?: number;
  page?: number;
}