import { apiClient } from './client';
import type { BackendMedia } from './backend-types';

export type PageBlockType =
  | 'heading'
  | 'rich_text'
  | 'image'
  | 'image_text'
  | 'button'
  | 'button_group'
  | 'cta_banner'
  | 'stats'
  | 'video'
  | 'spacer'
  | 'product_grid'
  | 'recipe_grid';

export interface PageBlock {
  id: string;
  type: PageBlockType;
  data: Record<string, unknown>;
  mediaId: string | null;
  media: BackendMedia | null;
}

export interface PageColumn {
  id: string;
  width: number;
  settings: Record<string, unknown>;
  blocks: PageBlock[];
}

export interface PageRow {
  id: string;
  settings: Record<string, unknown>;
  columns: PageColumn[];
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  metaDescription: string | null;
  status: 'draft' | 'published';
  rows: PageRow[];
}

export interface PageSummary {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
}

/** Récupère une page publiée par son slug (pour le rendu public). */
export function fetchPublishedPage(slug: string): Promise<Page> {
  return apiClient.get<Page>(`/pages/${slug}`);
}

// --- Administration ---

export function fetchAllPagesForAdmin(): Promise<PageSummary[]> {
  return apiClient.get<PageSummary[]>('/pages/admin/all');
}

export function fetchPageForAdmin(id: string): Promise<Page> {
  return apiClient.get<Page>(`/pages/admin/${id}`);
}

export function createPage(input: {
  slug: string;
  title: string;
  metaDescription?: string;
}): Promise<PageSummary> {
  return apiClient.post<PageSummary>('/pages', input);
}

export function updatePageMeta(
  id: string,
  input: Partial<{ title: string; metaDescription: string; status: 'draft' | 'published' }>,
): Promise<PageSummary> {
  return apiClient.patch<PageSummary>(`/pages/${id}`, input);
}

export interface BlockInput {
  type: PageBlockType;
  data: Record<string, unknown>;
  mediaId?: string;
}

export interface ColumnInput {
  width: number;
  settings?: Record<string, unknown>;
  blocks: BlockInput[];
}

export interface RowInput {
  settings?: Record<string, unknown>;
  columns: ColumnInput[];
}

export function replacePageTree(id: string, rows: RowInput[]): Promise<Page> {
  return apiClient.put<Page>(`/pages/${id}/tree`, { rows });
}

export function deletePage(id: string): Promise<{ id: string }> {
  return apiClient.delete<{ id: string }>(`/pages/${id}`);
}
