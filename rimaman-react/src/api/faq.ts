import { apiClient } from './client';
import type { BackendFaqCategory, BackendFaqItem } from './backend-types';

// ── Catégories ────────────────────────────────────────────────────────────────

export function fetchFaqCategories(): Promise<
  { id: string; name: string; icon: string; sortOrder: number }[]
> {
  return apiClient.get('/faq/categories');
}

export function fetchFaqCategoriesFull(): Promise<BackendFaqCategory[]> {
  return apiClient.get('/faq/categories/full');
}

export function createFaqCategory(data: {
  name: string;
  icon?: string;
}): Promise<BackendFaqCategory> {
  return apiClient.post('/faq/categories', data);
}

export function updateFaqCategory(
  id: string,
  data: { name?: string; icon?: string; sortOrder?: number },
): Promise<BackendFaqCategory> {
  return apiClient.patch(`/faq/categories/${id}`, data);
}

export function deleteFaqCategory(id: string): Promise<{ id: string }> {
  return apiClient.delete(`/faq/categories/${id}`);
}

export function reorderFaqCategories(
  items: { id: string; sortOrder: number }[],
): Promise<{ reordered: number }> {
  return apiClient.put('/faq/categories/reorder', { items });
}

// ── Items ─────────────────────────────────────────────────────────────────────

export function fetchFaqItems(): Promise<BackendFaqItem[]> {
  return apiClient.get('/faq');
}

export function createFaqItem(input: {
  categoryId: string;
  question: string;
  answer: string;
  sortOrder?: number;
}): Promise<BackendFaqItem> {
  return apiClient.post('/faq', input);
}

export function updateFaqItem(
  id: string,
  input: Partial<{ categoryId: string; question: string; answer: string; sortOrder: number }>,
): Promise<BackendFaqItem> {
  return apiClient.patch(`/faq/${id}`, input);
}

export function deleteFaqItem(id: string): Promise<{ id: string }> {
  return apiClient.delete(`/faq/${id}`);
}

export function reorderFaqItems(
  items: { id: string; sortOrder: number }[],
): Promise<{ reordered: number }> {
  return apiClient.put('/faq/reorder', { items });
}
