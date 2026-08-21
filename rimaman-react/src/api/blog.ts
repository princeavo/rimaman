import { apiClient } from './client';
import type { BackendBlogCategory, BackendBlogPost } from './backend-types';
import type { BlogPost } from '../types';

const WORDS_PER_MINUTE = 200;

function richTextToPlainText(content: BackendBlogPost['content']): string {
  return content.content
    .map((node) => node.content?.map((textNode) => textNode.text ?? '').join('') ?? '')
    .filter(Boolean)
    .join('\n\n');
}

function estimateReadTime(plainText: string): string {
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
  return `${minutes} min`;
}

function adapt(post: BackendBlogPost): BlogPost {
  const plainText = richTextToPlainText(post.content);
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: plainText,
    image: post.image?.url ?? '',
    category: post.category.name,
    date: post.publishedAt ?? '',
    readTime: estimateReadTime(plainText),
  };
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const posts = await apiClient.get<BackendBlogPost[]>('/blog');
  return posts.map(adapt);
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost> {
  const post = await apiClient.get<BackendBlogPost>(`/blog/${slug}`);
  return adapt(post);
}

// ── Catégories ────────────────────────────────────────────────────────────────

export function fetchBlogCategories(): Promise<BackendBlogCategory[]> {
  return apiClient.get('/blog/categories');
}

export function createBlogCategory(name: string): Promise<BackendBlogCategory> {
  return apiClient.post('/blog/categories', { name });
}

export function updateBlogCategory(
  id: string,
  data: { name?: string; sortOrder?: number },
): Promise<BackendBlogCategory> {
  return apiClient.patch(`/blog/categories/${id}`, data);
}

export function deleteBlogCategory(id: string): Promise<{ id: string }> {
  return apiClient.delete(`/blog/categories/${id}`);
}

export function reorderBlogCategories(
  items: { id: string; sortOrder: number }[],
): Promise<{ reordered: number }> {
  return apiClient.put('/blog/categories/reorder', { items });
}

// ── Articles ─────────────────────────────────────────────────────────────────

export type BlogPostInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: Record<string, unknown>;
  categoryId: string;
  publishedAt?: string | null;
  imageId?: string;
};

export function fetchBlogPostBySlugRaw(slug: string): Promise<BackendBlogPost> {
  return apiClient.get<BackendBlogPost>(`/blog/${slug}`);
}

export function fetchBlogPostsRaw(): Promise<BackendBlogPost[]> {
  return apiClient.get<BackendBlogPost[]>('/blog');
}

export function fetchAllBlogForAdmin(): Promise<BackendBlogPost[]> {
  return apiClient.get<BackendBlogPost[]>('/blog/admin/all');
}

export function createBlogPost(input: BlogPostInput): Promise<BackendBlogPost> {
  return apiClient.post<BackendBlogPost>('/blog', input);
}

export function updateBlogPost(
  id: string,
  input: Partial<BlogPostInput>,
): Promise<BackendBlogPost> {
  return apiClient.patch<BackendBlogPost>(`/blog/${id}`, input);
}

export function deleteBlogPost(id: string): Promise<{ id: string }> {
  return apiClient.delete<{ id: string }>(`/blog/${id}`);
}

export function checkBlogSlug(
  value: string,
  excludeId?: string,
): Promise<{ available: boolean }> {
  const params = new URLSearchParams({ value });
  if (excludeId) params.set('excludeId', excludeId);
  return apiClient.get<{ available: boolean }>(`/blog/slug/check?${params.toString()}`);
}
