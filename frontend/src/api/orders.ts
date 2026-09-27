import { apiClient } from './client';

export interface CreateOrderRequest {
  items: { productId: string; quantity: number }[];
  shippingAddress: Record<string, string>;
  couponCode?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  subtotalCents: number;
}

export interface Order {
  id: string;
  userId: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | 'SHIPPED' | 'DELIVERED';
  totalCents: number;
  currency: string;
  shippingAddress: Record<string, unknown>;
  stripeSessionId: string | null;
  checkoutUrl: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderPage {
  content: Order[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const orderApi = {
  async create(request: CreateOrderRequest): Promise<Order> {
    const res = await apiClient.post<Order>('/api/v1/orders', request);
    return res.data;
  },
  async list(page = 0, size = 20): Promise<OrderPage> {
    const res = await apiClient.get<OrderPage>('/api/v1/orders', { params: { page, size } });
    return res.data;
  },
  async get(id: string): Promise<Order> {
    const res = await apiClient.get<Order>(`/api/v1/orders/${id}`);
    return res.data;
  },
  async cancel(id: string): Promise<Order> {
    const res = await apiClient.patch<Order>(`/api/v1/orders/${id}/cancel`);
    return res.data;
  },
};

export const paymentApi = {
  async sync(orderId: string): Promise<void> {
    await apiClient.post(`/api/v1/payments/sync/${orderId}`);
  },
};

export interface OrderStats {
  total: number;
  paid: number;
  pending: number;
  failed: number;
  cancelled: number;
  revenueCents: number;
  currency: string;
}

export const adminOrderApi = {
  async list(page = 0, size = 20, status?: string): Promise<OrderPage> {
    const res = await apiClient.get<OrderPage>('/api/v1/orders/admin', {
      params: { page, size, status },
    });
    return res.data;
  },
  async stats(): Promise<OrderStats> {
    const res = await apiClient.get<OrderStats>('/api/v1/orders/admin/stats');
    return res.data;
  },
  async updateStatus(id: string, status: string): Promise<Order> {
    const res = await apiClient.patch<Order>(`/api/v1/orders/admin/${id}/status`, { status });
    return res.data;
  },
};


export interface DailyRevenue {
  date: string;
  orderCount: number;
  revenueCents: number;
}

export interface TopProduct {
  productId: string;
  sku: string;
  name: string;
  unitsSold: number;
  revenueCents: number;
}

export interface AnalyticsResponse {
  dailyRevenue: DailyRevenue[];
  topProducts: TopProduct[];
  totalRevenueCents: number;
  totalOrders: number;
  averageOrderValueCents: number;
  currency: string;
}

export const analyticsApi = {
  async get(days = 30): Promise<AnalyticsResponse> {
    const res = await apiClient.get<AnalyticsResponse>('/api/v1/orders/admin/analytics', {
      params: { days },
    });
    return res.data;
  },
};


// ─────────────── Coupons ───────────────

export type CouponType = 'PERCENT' | 'FIXED';

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: CouponType;
  value: number;
  minOrderCents: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

export interface CreateCouponInput {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  minOrderCents: number;
  maxUses?: number | null;
  expiresAt?: string | null;
  active?: boolean;
}

export interface UpdateCouponInput {
  description?: string;
  type?: CouponType;
  value?: number;
  minOrderCents?: number;
  maxUses?: number | null;
  expiresAt?: string | null;
  active?: boolean;
}

export interface ValidateCouponResult {
  valid: boolean;
  code: string;
  message: string;
  discountCents: number;
  finalTotalCents: number;
}

export const couponApi = {
  async validate(code: string, subtotalCents: number): Promise<ValidateCouponResult> {
    const res = await apiClient.get<ValidateCouponResult>('/api/v1/coupons/validate', {
      params: { code, subtotalCents },
    });
    return res.data;
  },
};

export const adminCouponApi = {
  async list(): Promise<Coupon[]> {
    const res = await apiClient.get<Coupon[]>('/api/v1/coupons');
    return res.data;
  },
  async create(input: CreateCouponInput): Promise<Coupon> {
    const res = await apiClient.post<Coupon>('/api/v1/coupons', input);
    return res.data;
  },
  async update(id: string, input: UpdateCouponInput): Promise<Coupon> {
    const res = await apiClient.patch<Coupon>(`/api/v1/coupons/${id}`, input);
    return res.data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/coupons/${id}`);
  },
};
