import { apiClient } from './client';

export interface ProductSummary {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  featured: boolean;
  categoryId: string | null;
  categoryName: string | null;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  priceCents: number;
  currency: string;
  stockQuantity: number;
  imageUrl: string | null;
  attributes: Record<string, unknown>;
  active: boolean;
  featured: boolean;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  active: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const productApi = {
  async list(params: { page?: number; size?: number; categoryId?: string; q?: string } = {}) {
    const res = await apiClient.get<Page<ProductSummary>>('/v1/products', { params });
    return res.data;
  },
  async getBySlug(slug: string) {
    const res = await apiClient.get<Product>(`/v1/products/${slug}`);
    return res.data;
  },
  async categories() {
    const res = await apiClient.get<Category[]>('/v1/categories');
    return res.data;
  },
};

export interface CreateProductInput {
  sku: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  categoryId?: string | null;
  priceCents: number;
  currency: string;
  stockQuantity: number;
  imageUrl?: string;
  attributes?: Record<string, unknown>;
  active?: boolean;
  featured?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  categoryId?: string | null;
  priceCents?: number;
  currency?: string;
  stockQuantity?: number;
  imageUrl?: string;
  attributes?: Record<string, unknown>;
  active?: boolean;
  featured?: boolean;
}

export const adminProductApi = {
  async list(page = 0, size = 50): Promise<Page<ProductSummary>> {
    const res = await apiClient.get<Page<ProductSummary>>('/v1/products/admin', {
      params: { page, size },
    });
    return res.data;
  },
  async get(id: string): Promise<Product> {
    const res = await apiClient.get<Product>(`/v1/products/id/${id}`);
    return res.data;
  },
  async create(input: CreateProductInput): Promise<Product> {
    const res = await apiClient.post<Product>('/v1/products', input);
    return res.data;
  },
  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const res = await apiClient.patch<Product>(`/v1/products/${id}`, input);
    return res.data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/v1/products/${id}`);
  },
};


export interface LowStockItem {
  id: string;
  sku: string;
  name: string;
  slug: string;
  stockQuantity: number;
  lowStockThreshold: number;
  categoryName: string | null;
}

export const lowStockApi = {
  async list(): Promise<LowStockItem[]> {
    const res = await apiClient.get<LowStockItem[]>('/v1/products/admin/low-stock');
    return res.data;
  },
};
