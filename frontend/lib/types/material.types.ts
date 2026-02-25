export interface Material {
  id: number;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  cost: number | null;
  unit: string | null;
  stock: number;
  minStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialDto {
  code: string;
  name: string;
  description?: string | null;
  category?: string | null;
  price?: number | null;
  cost?: number | null;
  unit?: string | null;
  stock?: number;
  minStock?: number;
}

export interface UpdateMaterialDto extends Partial<CreateMaterialDto> {}

export interface MaterialsStats {
  total: number;
  byCategory: Record<string, number>;
  lowStock: number;
}
