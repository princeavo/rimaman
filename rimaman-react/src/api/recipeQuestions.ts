import { apiClient } from './client';

export interface RecipeQuestion {
  id: string;
  question: string;
  answer: string;
  authorName: string;
  createdAt: string;
  answeredAt: string;
}

export function fetchRecipeQuestions(recipeId: string): Promise<RecipeQuestion[]> {
  return apiClient.get<RecipeQuestion[]>(`/recipe-questions?recipeId=${recipeId}`);
}

export function createRecipeQuestion(
  recipeId: string,
  data: { authorName: string; authorEmail: string; question: string },
): Promise<{ id: string }> {
  return apiClient.post(`/recipe-questions/${recipeId}`, data);
}

export interface AdminRecipeQuestion extends RecipeQuestion {
  authorEmail: string;
  status: 'pending' | 'answered' | 'rejected';
  recipe: { id: string; title: string; slug: string };
}

export function fetchAllRecipeQuestionsAdmin(status?: string): Promise<AdminRecipeQuestion[]> {
  const q = status ? `?status=${status}` : '';
  return apiClient.get<AdminRecipeQuestion[]>(`/recipe-questions/admin${q}`);
}

export function answerRecipeQuestion(id: string, answer: string): Promise<AdminRecipeQuestion> {
  return apiClient.patch<AdminRecipeQuestion>(`/recipe-questions/${id}/answer`, { answer, status: 'answered' });
}

export function updateRecipeQuestionStatus(id: string, status: 'pending' | 'answered' | 'rejected'): Promise<AdminRecipeQuestion> {
  return apiClient.patch<AdminRecipeQuestion>(`/recipe-questions/${id}/status`, { status });
}

export function deleteRecipeQuestion(id: string): Promise<void> {
  return apiClient.delete(`/recipe-questions/${id}`);
}
