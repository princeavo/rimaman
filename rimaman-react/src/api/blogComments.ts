import { apiClient } from './client';

export interface BlogCommentReply {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface BlogComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies: BlogCommentReply[];
}

export function fetchBlogComments(postId: string): Promise<BlogComment[]> {
  return apiClient.get<BlogComment[]>(`/blog-comments?postId=${postId}`);
}

export function createBlogComment(
  postId: string,
  data: { authorName: string; authorEmail: string; content: string; parentId?: string },
): Promise<BlogComment> {
  return apiClient.post<BlogComment>(`/blog-comments/${postId}`, data);
}

export interface AdminBlogComment extends BlogComment {
  authorEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  post: { id: string; title: string; slug: string };
}

export function fetchAllBlogCommentsAdmin(status?: string): Promise<AdminBlogComment[]> {
  const q = status ? `?status=${status}` : '';
  return apiClient.get<AdminBlogComment[]>(`/blog-comments/admin${q}`);
}

export function updateBlogCommentStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<AdminBlogComment> {
  return apiClient.patch<AdminBlogComment>(`/blog-comments/${id}/status`, { status });
}

export function deleteBlogComment(id: string): Promise<void> {
  return apiClient.delete(`/blog-comments/${id}`);
}
