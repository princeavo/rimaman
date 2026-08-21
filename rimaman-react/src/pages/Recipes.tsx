import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../components/common/Icon';
import { RecipeCard } from '../components/features/RecipeCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useRecipes, useRecipeCategories, useRecipeDifficulties } from '../hooks/useRecipes';

export const Recipes: React.FC = () => {
  const { data: recipes, loading, error, retry } = useRecipes();
  const { data: categories } = useRecipeCategories();
  const { data: difficulties } = useRecipeDifficulties();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [difficultyId, setDifficultyId] = useState<string | null>(null);

  const filteredRecipes = useMemo(() => {
    return (recipes ?? []).filter((recipe) => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryId || recipe.category.id === categoryId;
      const matchesDifficulty = !difficultyId || recipe.difficulty.id === difficultyId;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [recipes, searchQuery, categoryId, difficultyId]);

  return (
    <>
      <Helmet>
        <title>Recettes | RIMAMAN - Recettes avec nos Farines Bio</title>
        <meta
          name="description"
          content="Découvrez nos recettes à préparer avec nos farines bio : fufu, beignets, pain, desserts."
        />
      </Helmet>

      <main className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-headline font-bold text-on-surface mb-4">
              Nos recettes
            </h1>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
              Des recettes à préparer avec nos farines bio. Du fufu traditionnel aux desserts.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Rechercher une recette..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-container-low border-2 border-transparent focus:border-primary focus:ring-0 text-on-surface placeholder:text-on-surface-variant"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mb-12 space-y-6">
            {/* Category Filter */}
            {(categories ?? []).length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-on-surface-variant mb-3">Catégories</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setCategoryId(null)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                      !categoryId
                        ? 'bg-primary text-on-primary shadow-lg'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    <Icon name="restaurant_menu" size="sm" />
                    Toutes
                  </button>
                  {(categories ?? []).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                        categoryId === cat.id
                          ? 'bg-primary text-on-primary shadow-lg'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      <Icon name={cat.icon} size="sm" />
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty Filter */}
            {(difficulties ?? []).length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-on-surface-variant mb-3">Difficulté</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setDifficultyId(null)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      !difficultyId
                        ? 'bg-primary text-on-primary shadow-lg'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    Tous niveaux
                  </button>
                  {(difficulties ?? []).map((diff) => (
                    <button
                      key={diff.id}
                      onClick={() => setDifficultyId(diff.id)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        difficultyId === diff.id
                          ? 'bg-primary text-on-primary shadow-lg'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      {diff.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recipes Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 py-24">
              <Icon name="cloud_off" size="xl" className="text-on-surface-variant" />
              <p className="text-on-surface-variant text-center">
                Impossible de charger les recettes pour le moment.
              </p>
              <button
                onClick={retry}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant text-sm font-medium hover:bg-surface-container transition-colors"
              >
                <Icon name="refresh" size="sm" />
                Réessayer
              </button>
            </div>
          ) : (recipes ?? []).length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <Icon name="restaurant_menu" size="xl" className="text-on-surface-variant" />
              <p className="text-on-surface-variant">Aucune recette disponible pour le moment.</p>
            </div>
          ) : filteredRecipes.length > 0 ? (
            <>
              <p className="mb-6 text-on-surface-variant">
                <span className="font-bold text-primary">{filteredRecipes.length}</span> recette
                {filteredRecipes.length > 1 ? 's' : ''} trouvée{filteredRecipes.length > 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon="search_off"
              title="Aucune recette trouvée"
              description="Essayez de modifier vos filtres ou votre recherche"
              actionLabel="Réinitialiser les filtres"
              onAction={() => {
                setSearchQuery('');
                setCategoryId(null);
                setDifficultyId(null);
              }}
            />
          )}
        </div>
      </main>
    </>
  );
};
