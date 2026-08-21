import { apiClient } from './client';
import type { BackendRecipe, BackendRecipeCategory, BackendRecipeDifficulty } from './backend-types';
import type { Recipe, RecipeCategory, RecipeDifficulty } from '../types';

function adapt(recipe: BackendRecipe): Recipe {
  return {
    id: recipe.id,
    title: recipe.title,
    slug: recipe.slug,
    description: recipe.description,
    image: recipe.image?.url ?? '',
    video: recipe.video?.url,
    category: {
      id: recipe.category.id,
      name: recipe.category.name,
      icon: recipe.category.icon,
      sortOrder: recipe.category.sortOrder,
    },
    difficulty: {
      id: recipe.difficulty.id,
      name: recipe.difficulty.name,
      color: recipe.difficulty.color,
      sortOrder: recipe.difficulty.sortOrder,
    },
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    ingredients: recipe.ingredients.map(({ item, quantity }) => ({ item, quantity })),
    steps: recipe.steps.map((step) => ({
      step: step.step,
      instruction: step.instruction,
      media: step.media.map((m) => ({
        id: m.id,
        mediaId: m.mediaId,
        url: m.media.url,
        mimeType: m.media.mimeType,
        sortOrder: m.sortOrder,
      })),
    })),
    tips: recipe.tips,
    relatedProducts: recipe.relatedProducts.map((relation) => relation.productId),
  };
}

export async function fetchRecipes(): Promise<Recipe[]> {
  const recipes = await apiClient.get<BackendRecipe[]>('/recipes');
  return recipes.map(adapt);
}

export async function fetchRecipeBySlug(slug: string): Promise<Recipe> {
  const recipe = await apiClient.get<BackendRecipe>(`/recipes/${slug}`);
  return adapt(recipe);
}

// ── Catégories ────────────────────────────────────────────────────────────────

export function fetchRecipeCategories(): Promise<RecipeCategory[]> {
  return apiClient.get<BackendRecipeCategory[]>('/recipes/categories');
}

export function createRecipeCategory(data: { name: string; icon?: string }): Promise<RecipeCategory> {
  return apiClient.post('/recipes/categories', data);
}

export function updateRecipeCategory(id: string, data: { name?: string; icon?: string; sortOrder?: number }): Promise<RecipeCategory> {
  return apiClient.patch(`/recipes/categories/${id}`, data);
}

export function deleteRecipeCategory(id: string): Promise<{ id: string }> {
  return apiClient.delete(`/recipes/categories/${id}`);
}

// ── Difficultés ───────────────────────────────────────────────────────────────

export function fetchRecipeDifficulties(): Promise<RecipeDifficulty[]> {
  return apiClient.get<BackendRecipeDifficulty[]>('/recipes/difficulties');
}

export function createRecipeDifficulty(data: { name: string; color?: string }): Promise<RecipeDifficulty> {
  return apiClient.post('/recipes/difficulties', data);
}

export function updateRecipeDifficulty(id: string, data: { name?: string; color?: string; sortOrder?: number }): Promise<RecipeDifficulty> {
  return apiClient.patch(`/recipes/difficulties/${id}`, data);
}

export function deleteRecipeDifficulty(id: string): Promise<{ id: string }> {
  return apiClient.delete(`/recipes/difficulties/${id}`);
}

// ── Administration recettes ───────────────────────────────────────────────────

export interface RecipeIngredientInput {
  item: string;
  quantity: string;
  sortOrder?: number;
}

export interface RecipeStepMediaInput {
  mediaId: string;
  sortOrder?: number;
}

export interface RecipeStepInput {
  step: number;
  instruction: string;
  media?: RecipeStepMediaInput[];
}

export interface RecipePayload {
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  difficultyId: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  tips: string[];
  imageId?: string;
  ingredients: RecipeIngredientInput[];
  steps: RecipeStepInput[];
  relatedProductIds?: string[];
}

export function createRecipe(data: RecipePayload): Promise<BackendRecipe> {
  return apiClient.post<BackendRecipe>('/recipes', data);
}

export function updateRecipe(id: string, data: Partial<RecipePayload>): Promise<BackendRecipe> {
  return apiClient.patch<BackendRecipe>(`/recipes/${id}`, data);
}

export function checkRecipeSlug(value: string, excludeId?: string): Promise<{ available: boolean }> {
  const params = new URLSearchParams({ value });
  if (excludeId) params.set('excludeId', excludeId);
  return apiClient.get(`/recipes/slug/check?${params}`);
}

export function deleteRecipe(id: string): Promise<{ id: string }> {
  return apiClient.delete<{ id: string }>(`/recipes/${id}`);
}
