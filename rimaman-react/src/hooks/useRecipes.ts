import { useAsyncData } from './useAsyncData';
import { fetchRecipeBySlug, fetchRecipes, fetchRecipeCategories, fetchRecipeDifficulties } from '../api/recipes';

export const useRecipes = () => useAsyncData(fetchRecipes, []);

export const useRecipe = (slug: string) =>
  useAsyncData(() => fetchRecipeBySlug(slug), [slug]);

export const useRecipeCategories = () => useAsyncData(fetchRecipeCategories, []);

export const useRecipeDifficulties = () => useAsyncData(fetchRecipeDifficulties, []);
