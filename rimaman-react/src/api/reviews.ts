import { apiClient } from './client';

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  helpfulCount: number;
  createdAt: string;
}

export interface CreateReviewInput {
  productId: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
}

/** Avis approuvés et publics pour un produit (ou tous si non précisé). */
export function fetchApprovedReviews(productId?: string): Promise<Review[]> {
  const query = productId ? `?productId=${encodeURIComponent(productId)}` : '';
  return apiClient.get<Review[]>(`/reviews${query}`);
}

export function submitReview(input: CreateReviewInput): Promise<Review> {
  return apiClient.post<Review>('/reviews', input);
}

// --- Administration (modération) ---

export function fetchAllReviewsForModeration(): Promise<Review[]> {
  return apiClient.get<Review[]>('/reviews/admin/all');
}

export function updateReviewStatus(id: string, status: Review['status']): Promise<Review> {
  return apiClient.patch<Review>(`/reviews/${id}/status`, { status });
}

export function deleteReview(id: string): Promise<{ id: string }> {
  return apiClient.delete<{ id: string }>(`/reviews/${id}`);
}
