import { apiClient } from './client';

export type ReactionEmoji = 'HEART' | 'CLAP' | 'YUM' | 'FIRE';

export interface ReactionCount {
  emoji: ReactionEmoji;
  count: number;
}

export function fetchArticleReactions(postId: string): Promise<ReactionCount[]> {
  return apiClient.get<ReactionCount[]>(`/reactions/article/${postId}`);
}

export function incrementArticleReaction(postId: string, emoji: ReactionEmoji): Promise<ReactionCount> {
  return apiClient.post<ReactionCount>(`/reactions/article/${postId}/${emoji}`, {});
}

export function fetchRecipeReactions(recipeId: string): Promise<ReactionCount[]> {
  return apiClient.get<ReactionCount[]>(`/reactions/recipe/${recipeId}`);
}

export function incrementRecipeReaction(recipeId: string, emoji: ReactionEmoji): Promise<ReactionCount> {
  return apiClient.post<ReactionCount>(`/reactions/recipe/${recipeId}/${emoji}`, {});
}
