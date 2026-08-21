import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../components/common/Icon';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useRecipe, useRecipes } from '../hooks/useRecipes';
import { useProducts } from '../hooks/useProducts';
import { getDifficultyColor } from '../utils/recipeUtils';
import { scaleQuantity } from '../utils/scaleIngredients';
import { ShareButtons } from '../components/common/ShareButtons';
import { ReactionBar } from '../components/common/ReactionBar';
import { CommentSection } from '../components/common/CommentSection';
import { RecipeQA } from '../components/recipe/RecipeQA';
import { recipeJsonLd } from '../utils/schema';
import { fetchRecipeComments, createRecipeComment } from '../api/recipeComments';

export const RecipeDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: recipe, loading, error } = useRecipe(slug ?? '');
  const { allProducts } = useProducts();
  const { data: allRecipes } = useRecipes();
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [servings, setServings] = useState<number | null>(null);
  const [shoppingCopied, setShoppingCopied] = useState(false);

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="search_off" size="xl" className="text-on-surface-variant mb-4" />
          <h2 className="text-2xl font-bold text-on-surface mb-2">Recette introuvable</h2>
          <p className="text-on-surface-variant mb-6">Cette recette n'existe pas ou a été supprimée.</p>
          <Button variant="primary" onClick={() => navigate('/recettes')}>
            Voir toutes les recettes
          </Button>
        </div>
      </div>
    );
  }

  const relatedProducts = allProducts.filter((p) => recipe.relatedProducts.includes(p.id));
  const similarRecipes = (allRecipes ?? [])
    .filter((r) => r.id !== recipe.id && r.category.id === recipe.category.id)
    .slice(0, 3);

  const effectiveServings = servings ?? recipe.servings;
  const scale = effectiveServings / recipe.servings;

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const jsonLd = recipeJsonLd(recipe, pageUrl);

  const copyShoppingList = async () => {
    const unchecked = recipe.ingredients
      .filter((_, i) => !checkedIngredients.has(i))
      .map((ing) => `- ${scaleQuantity(ing.quantity, scale)} ${ing.item}`)
      .join('\n');
    const text = `Liste de courses — ${recipe.title}\n\n${unchecked}`;
    try { await navigator.clipboard.writeText(text); } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setShoppingCopied(true);
    setTimeout(() => setShoppingCopied(false), 2500);
  };

  return (
    <>
      <Helmet>
        <title>{recipe.title} | Recettes RIMAMAN</title>
        <meta name="description" content={recipe.description} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-8">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-on-surface-variant">
            <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
            <Icon name="chevron_right" size="sm" />
            <Link to="/recettes" className="hover:text-primary transition-colors">Recettes</Link>
            <Icon name="chevron_right" size="sm" />
            <span className="text-on-surface font-semibold">{recipe.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Hero Image */}
              <div className="relative h-96 rounded-3xl overflow-hidden mb-8 bg-surface-container">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = '/rimaman.jpeg'; }}
                />
                <div className={`absolute top-6 right-6 px-4 py-2 rounded-full font-semibold text-sm ${getDifficultyColor(recipe.difficulty.color)}`}>
                  {recipe.difficulty.name}
                </div>
              </div>

              {/* Title & Description */}
              <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-4">
                {recipe.title}
              </h1>
              <p className="text-xl text-on-surface-variant mb-8">{recipe.description}</p>

              {/* Stats — prep / cook / servings / difficulty */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
                <div className="bg-surface-container-low rounded-2xl p-5 text-center">
                  <Icon name="timer" className="text-primary mb-2 mx-auto" />
                  <div className="font-bold text-2xl text-on-surface">{recipe.prepTime} min</div>
                  <div className="text-sm text-on-surface-variant">Préparation</div>
                </div>
                <div className="bg-surface-container-low rounded-2xl p-5 text-center">
                  <Icon name="local_fire_department" className="text-primary mb-2 mx-auto" />
                  <div className="font-bold text-2xl text-on-surface">{recipe.cookTime} min</div>
                  <div className="text-sm text-on-surface-variant">Cuisson</div>
                </div>
                <div className="bg-surface-container-low rounded-2xl p-5 text-center">
                  <Icon name="group" className="text-primary mb-2 mx-auto" />
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setServings(Math.max(1, effectiveServings - 1))}
                      className="w-7 h-7 rounded-full bg-surface-container hover:bg-outline-variant flex items-center justify-center text-on-surface transition-colors"
                      aria-label="Réduire les portions"
                    >
                      <Icon name="remove" size="sm" />
                    </button>
                    <span className="font-bold text-2xl text-on-surface w-6 text-center">{effectiveServings}</span>
                    <button
                      type="button"
                      onClick={() => setServings(effectiveServings + 1)}
                      className="w-7 h-7 rounded-full bg-surface-container hover:bg-outline-variant flex items-center justify-center text-on-surface transition-colors"
                      aria-label="Augmenter les portions"
                    >
                      <Icon name="add" size="sm" />
                    </button>
                  </div>
                  <div className="text-sm text-on-surface-variant">Personnes</div>
                </div>
                <div className={`rounded-2xl p-5 text-center ${getDifficultyColor(recipe.difficulty.color)}`}>
                  <Icon name="speed" size="md" className="mb-2 mx-auto" />
                  <div className="font-bold text-2xl">{recipe.difficulty.name}</div>
                  <div className="text-sm">Difficulté</div>
                </div>
              </div>

              {/* Video */}
              {recipe.video && (
                <section className="mb-12">
                  <h2 className="text-3xl font-headline font-bold text-on-surface mb-6 flex items-center gap-3">
                    <Icon name="play_circle" className="text-primary" />
                    Vidéo de la recette
                  </h2>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-surface-container">
                    <video
                      src={recipe.video}
                      controls
                      poster={recipe.image}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </section>
              )}

              {/* Ingredients */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-3xl font-headline font-bold text-on-surface flex items-center gap-3">
                    <Icon name="shopping_cart" className="text-primary" />
                    Ingrédients
                  </h2>
                  <button
                    type="button"
                    onClick={copyShoppingList}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all ${
                      shoppingCopied
                        ? 'border-primary bg-primary/8 text-primary'
                        : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                    }`}
                  >
                    <Icon name={shoppingCopied ? 'check_circle' : 'shopping_bag'} size="sm" />
                    {shoppingCopied ? 'Copié !' : 'Liste de courses'}
                  </button>
                </div>
                <p className="text-sm text-on-surface-variant mb-6">Cliquez sur un ingrédient pour le cocher.</p>
                <div className="bg-surface-container-low rounded-2xl p-8">
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li
                        key={index}
                        onClick={() => toggleIngredient(index)}
                        className={`flex items-start gap-3 cursor-pointer select-none rounded-xl px-3 py-2 -mx-3 transition-colors hover:bg-surface-container ${
                          checkedIngredients.has(index) ? 'opacity-50' : ''
                        }`}
                      >
                        <Icon
                          name={checkedIngredients.has(index) ? 'check_circle' : 'radio_button_unchecked'}
                          size="sm"
                          className={`mt-0.5 flex-shrink-0 ${checkedIngredients.has(index) ? 'text-primary' : 'text-on-surface-variant'}`}
                        />
                        <span className={`text-on-surface ${checkedIngredients.has(index) ? 'line-through text-on-surface-variant' : ''}`}>
                          <span className="font-bold">{scaleQuantity(ingredient.quantity, scale)}</span> {ingredient.item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Steps */}
              <section className="mb-12">
                <h2 className="text-3xl font-headline font-bold text-on-surface mb-6 flex items-center gap-3">
                  <Icon name="list" className="text-primary" />
                  Préparation
                </h2>
                <div className="space-y-6">
                  {recipe.steps.map((step) => (
                    <div key={step.step} className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xl">
                        {step.step}
                      </div>
                      <div className="flex-1 pt-2">
                        <p className="text-on-surface leading-relaxed">{step.instruction}</p>
                        {step.media.length > 0 && (
                          <div className={`mt-4 ${step.media.length > 1 ? 'grid grid-cols-2 gap-3' : ''}`}>
                            {step.media.map((m) =>
                              m.mimeType.startsWith('video/') ? (
                                <video
                                  key={m.mediaId}
                                  src={m.url}
                                  controls
                                  className="rounded-xl w-full max-h-64 object-contain bg-black"
                                />
                              ) : (
                                <img
                                  key={m.mediaId}
                                  src={m.url}
                                  alt={`Étape ${step.step}`}
                                  className="rounded-xl w-full max-h-64 object-cover"
                                />
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tips */}
              {recipe.tips.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-3xl font-headline font-bold text-on-surface mb-6 flex items-center gap-3">
                    <Icon name="lightbulb" className="text-primary" />
                    Conseils
                  </h2>
                  <div className="bg-primary/5 rounded-2xl p-8 border-2 border-primary/20">
                    <ul className="space-y-3">
                      {recipe.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Icon name="check" size="sm" className="text-primary mt-1 flex-shrink-0" />
                          <span className="text-on-surface">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* Reactions */}
              <div className="mb-8">
                <ReactionBar type="recipe" targetId={recipe.id} />
              </div>

              {/* Share */}
              <ShareButtons
                url={typeof window !== 'undefined' ? window.location.href : ''}
                title={`${recipe.title} | Recettes RIMAMAN`}
              />

              {/* Q&A */}
              <RecipeQA recipeId={recipe.id} />

              {/* Comments */}
              <CommentSection
                targetId={recipe.id}
                fetchComments={fetchRecipeComments as (id: string) => Promise<any>}
                postComment={createRecipeComment as (id: string, data: any) => Promise<unknown>}
                label="avis"
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* Related Products */}
                {relatedProducts.length > 0 && (
                  <div className="bg-surface-container-low rounded-2xl p-6">
                    <h3 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                      <Icon name="shopping_bag" className="text-primary" />
                      Produits recommandés
                    </h3>
                    <div className="space-y-4">
                      {relatedProducts.map((product) => (
                        <Link
                          key={product.id}
                          to="/nos-farines"
                          className="block bg-surface rounded-xl p-4 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-on-surface line-clamp-2">
                                {product.name}
                              </h4>
                              <p className="text-primary font-bold">{product.price.toLocaleString()} FCFA</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link to="/nos-farines" className="block mt-4">
                      <Button variant="primary" className="w-full">
                        Voir tous les produits
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Similar Recipes — shown when no related products */}
                {relatedProducts.length === 0 && similarRecipes.length > 0 && (
                  <div className="bg-surface-container-low rounded-2xl p-6">
                    <h3 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                      <Icon name="restaurant_menu" className="text-primary" />
                      Recettes similaires
                    </h3>
                    <div className="space-y-4">
                      {similarRecipes.map((r) => (
                        <Link
                          key={r.id}
                          to={`/recettes/${r.slug}`}
                          className="group flex items-center gap-3 bg-surface rounded-xl p-3 hover:shadow-md transition-shadow"
                        >
                          <img
                            src={r.image}
                            alt={r.title}
                            className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => { e.currentTarget.src = '/rimaman.jpeg'; }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                              {r.title}
                            </p>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                              {r.prepTime + r.cookTime} min · {r.difficulty.name}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
