import { apiClient } from './client';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalCount: number;
  reviews: Review[];
}

export interface CreateReviewInput {
  rating: number;
  title?: string;
  comment?: string;
}

export const reviewApi = {
  async list(productId: string): Promise<ReviewSummary> {
    const res = await apiClient.get<ReviewSummary>(
      `/v1/products/${productId}/reviews`
    );
    return res.data;
  },
  async create(productId: string, input: CreateReviewInput): Promise<Review> {
    const res = await apiClient.post<Review>(
      `/v1/products/${productId}/reviews`,
      input
    );
    return res.data;
  },
  async remove(productId: string, reviewId: string): Promise<void> {
    await apiClient.delete(`/v1/products/${productId}/reviews/${reviewId}`);
  },
};
