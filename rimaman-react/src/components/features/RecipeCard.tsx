import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import type { Recipe } from '../../types';
import { getDifficultyColor } from '../../utils/recipeUtils';

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <Link
      to={`/recettes/${recipe.slug}`}
      className="group bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-surface-container">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.currentTarget.src = '/rimaman.jpeg'; }}
        />

        {/* Category Badge */}
        <div className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <Icon name={recipe.category.icon} size="sm" />
          <span className="capitalize">{recipe.category.name}</span>
        </div>

        {/* Difficulty Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(recipe.difficulty.color)}`}>
          {recipe.difficulty.name}
        </div>

        {/* Video Badge */}
        {recipe.video && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/70 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
            <Icon name="play_circle" size="sm" />
            Vidéo
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-headline font-bold text-xl text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {recipe.title}
        </h3>

        <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-on-surface-variant">
          <div className="flex items-center gap-1">
            <Icon name="schedule" size="sm" className="text-primary" />
            <span>{totalTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="restaurant" size="sm" className="text-primary" />
            <span>{recipe.servings} pers.</span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4 pt-4 border-t border-outline-variant flex items-center justify-between">
          <span className="text-primary font-semibold text-sm">Voir la recette</span>
          <Icon name="arrow_forward" size="sm" className="text-primary group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
