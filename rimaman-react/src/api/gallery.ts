import { apiClient } from './client';
import { uploadFile } from './client';
import type { BackendGalleryCategory, BackendGalleryItem } from './backend-types';
import type { Media } from './media';

// ── Catégories ────────────────────────────────────────────────────────────────

export function fetchCategories(): Promise<BackendGalleryCategory[]> {
  return apiClient.get<BackendGalleryCategory[]>('/gallery/categories/full');
}

export function fetchPublicCategories(): Promise<{ id: string; name: string }[]> {
  return apiClient.get<{ id: string; name: string }[]>('/gallery/categories');
}

export function createCategory(name: string): Promise<BackendGalleryCategory> {
  return apiClient.post<BackendGalleryCategory>('/gallery/categories', { name });
}

export function updateCategory(
  id: string,
  data: { name?: string; sortOrder?: number },
): Promise<BackendGalleryCategory> {
  return apiClient.patch<BackendGalleryCategory>(`/gallery/categories/${id}`, data);
}

export function deleteCategory(id: string): Promise<{ id: string }> {
  return apiClient.delete<{ id: string }>(`/gallery/categories/${id}`);
}

export function reorderCategories(
  items: { id: string; sortOrder: number }[],
): Promise<{ reordered: number }> {
  return apiClient.put<{ reordered: number }>('/gallery/categories/reorder', { items });
}

// ── Items ─────────────────────────────────────────────────────────────────────

export function fetchGalleryItems(): Promise<BackendGalleryItem[]> {
  return apiClient.get<BackendGalleryItem[]>('/gallery');
}

export function createGalleryItem(input: {
  mediaId: string;
  categoryId: string;
  sortOrder?: number;
}): Promise<BackendGalleryItem> {
  return apiClient.post<BackendGalleryItem>('/gallery', input);
}

export function updateGalleryItem(
  id: string,
  input: Partial<{ mediaId: string; categoryId: string; sortOrder: number }>,
): Promise<BackendGalleryItem> {
  return apiClient.patch<BackendGalleryItem>(`/gallery/${id}`, input);
}

export function deleteGalleryItem(id: string): Promise<{ id: string }> {
  return apiClient.delete<{ id: string }>(`/gallery/${id}`);
}

export function reorderGalleryItems(
  items: { id: string; sortOrder: number }[],
): Promise<{ reordered: number }> {
  return apiClient.put<{ reordered: number }>('/gallery/reorder', { items });
}

// ── Upload + ajout direct ─────────────────────────────────────────────────────

export async function uploadAndAddToGallery(
  file: File,
  categoryId: string,
  alt = '',
): Promise<BackendGalleryItem> {
  const media = await uploadFile<Media>('/media', file, alt);
  return createGalleryItem({ mediaId: media.id, categoryId });
}
