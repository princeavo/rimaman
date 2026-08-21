import { apiClient } from './client';

export interface RecipeCommentReply {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface RecipeComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies: RecipeCommentReply[];
}

export function fetchRecipeComments(recipeId: string): Promise<RecipeComment[]> {
  return apiClient.get<RecipeComment[]>(`/recipe-comments?recipeId=${recipeId}`);
}

export function createRecipeComment(
  recipeId: string,
  data: { authorName: string; authorEmail: string; content: string; parentId?: string },
): Promise<RecipeComment> {
  return apiClient.post<RecipeComment>(`/recipe-comments/${recipeId}`, data);
}

export interface AdminRecipeComment extends RecipeComment {
  authorEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  recipe: { id: string; title: string; slug: string };
}

export function fetchAllRecipeCommentsAdmin(status?: string): Promise<AdminRecipeComment[]> {
  const q = status ? `?status=${status}` : '';
  return apiClient.get<AdminRecipeComment[]>(`/recipe-comments/admin${q}`);
}

export function updateRecipeCommentStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<AdminRecipeComment> {
  return apiClient.patch<AdminRecipeComment>(`/recipe-comments/${id}/status`, { status });
}

export function deleteRecipeComment(id: string): Promise<void> {
  return apiClient.delete(`/recipe-comments/${id}`);
}
