import React from 'react';
import { RecipeCard } from '../../features/RecipeCard';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { useRecipes } from '../../../hooks/useRecipes';

interface Props {
  data: { recipeIds?: string[] };
}

export const RecipeGridBlock: React.FC<Props> = ({ data }) => {
  const { data: allRecipes, loading, error } = useRecipes();

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !allRecipes) return null;

  const recipes =
    data.recipeIds && data.recipeIds.length > 0
      ? allRecipes.filter((r) => data.recipeIds!.includes(r.id))
      : allRecipes.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
};
