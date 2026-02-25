export interface Part {
  id: number;
  code: string;
  name: string;
  description: string | null;
  material: string | null;
  drawing_url: string | null;
  status: 'design' | 'ready_for_production' | 'in_production' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CreatePartDto {
  code: string;
  name: string;
  description?: string | null;
  material?: string | null;
  drawing_url?: string | null;
  status?: 'design' | 'ready_for_production' | 'in_production' | 'completed';
}

export interface UpdatePartDto extends Partial<CreatePartDto> {}

export interface PartsStats {
  total: number;
  byStatus: Record<string, number>;
}
