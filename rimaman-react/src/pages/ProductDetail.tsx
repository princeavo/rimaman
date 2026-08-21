import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../components/common/Icon';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ProductCard } from '../components/common/ProductCard';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { useProducts } from '../hooks/useProducts';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchProduct } from '../api/products';
import { fetchApprovedReviews, submitReview, type Review } from '../api/reviews';
import { fetchRecipes } from '../api/recipes';
import { trackAddToCart } from '../utils/analytics';
import type { Product, ProductVariant } from '../types';

type Tab = 'description' | 'nutrition' | 'preparation';

/** Estimation de secours quand Product.servings n'est pas en DB. */
function estimateServings(weight: string): number | null {
  const lower = weight.toLowerCase().trim();
  const n = parseFloat(lower);
  if (isNaN(n)) return null;
  const kg = lower.includes('kg') ? n : n / 1000;
  return Math.round(kg * 6);
}

function getServings(product: Product, variant: ProductVariant | null): number | null {
  return product.servings ?? estimateServings(variant?.weight ?? product.weight);
}

/** Fallback si aucune recette n'est liée au produit en base. */
const FALLBACK_PREP_STEPS = [
  { step: 1, text: "Faites bouillir 1,5 fois le volume d'eau par rapport à la farine dans une casserole à feu vif." },
  { step: 2, text: "Versez la farine RIMAMAN en pluie dans l'eau bouillante tout en remuant immédiatement." },
  { step: 3, text: 'Remuez vigoureusement et sans arrêt pendant 10 à 12 minutes à feu moyen jusqu\'à obtenir une pâte lisse.' },
  { step: 4, text: 'Formez des boules de fufu à la cuillère mouillée et servez chaud avec votre sauce préférée.' },
];

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} étoiles sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name={i <= rating ? 'star' : 'star_border'}
          size={size}
          className={i <= rating ? 'text-secondary' : 'text-outline'}
        />
      ))}
    </span>
  );
}

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ author: '', rating: 5, title: '', comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const showToast = useToastStore((state) => state.showToast);
  const { allProducts } = useProducts();

  // ── Chargement du produit ──────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoadingProduct(true);
    setFetchError(false);
    setSelectedVariant(null);
    fetchProduct(id)
      .then((p) => {
        setProduct(p);
        const def = p.variants.find((v) => v.isDefault) ?? p.variants[0] ?? null;
        setSelectedVariant(def);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoadingProduct(false));
  }, [id]);

  // ── Avis ──────────────────────────────────────────────────────────────────
  const productId = product?.id;
  const { data: reviews, loading: reviewsLoading } = useAsyncData(
    () => (productId ? fetchApprovedReviews(productId) : Promise.resolve([])),
    [productId],
  );

  // ── Recettes liées (onglet Préparation) ───────────────────────────────────
  const { data: allRecipes, loading: recipesLoading } = useAsyncData(fetchRecipes, []);
  const linkedRecipes = useMemo(
    () => (allRecipes ?? []).filter((r) => r.relatedProducts.includes(productId ?? '')),
    [allRecipes, productId],
  );

  // ── Valeurs effectives selon la variante choisie ──────────────────────────
  const effectivePrice = selectedVariant?.price ?? product?.price ?? 0;
  const effectiveWeight = selectedVariant?.weight ?? product?.weight ?? '';
  const effectiveImage = selectedVariant?.image ?? product?.image ?? '';
  const servings = product ? getServings(product, selectedVariant) : null;
  const pricePerPerson = servings && effectivePrice ? Math.round(effectivePrice / servings) : null;

  const relatedProducts = useMemo(
    () => allProducts.filter((p) => p.id !== productId).slice(0, 3),
    [allProducts, productId],
  );

  const avgRating = useMemo(() => {
    const list = reviews ?? [];
    if (!list.length) return 0;
    return list.reduce((sum, r) => sum + r.rating, 0) / list.length;
  }, [reviews]);

  // ── Ajout au panier ───────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!product) return;
    const item: Product =
      selectedVariant
        ? {
            ...product,
            price: selectedVariant.price,
            weight: selectedVariant.weight,
            image: selectedVariant.image ?? product.image,
          }
        : product;
    addItem(item);
    showToast(`${product.name} (${effectiveWeight}) ajouté au panier`, 'success');
    trackAddToCart(item);
  };

  // ── Soumission d'un avis ──────────────────────────────────────────────────
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setReviewSubmitting(true);
    try {
      await submitReview({ ...reviewForm, productId: product.id });
      setReviewSubmitted(true);
      setShowReviewForm(false);
      setReviewForm({ author: '', rating: 5, title: '', comment: '' });
    } catch {
      showToast('Erreur lors de l\'envoi de l\'avis. Réessayez.', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ── États de chargement / erreur ──────────────────────────────────────────
  if (loadingProduct) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] pt-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (fetchError || !product) {
    return (
      <div className="flex flex-col items-center gap-6 min-h-[60vh] pt-32 text-center px-8">
        <Icon name="inventory_2" size="xl" className="text-on-surface-variant" />
        <h1 className="font-headline text-2xl font-bold text-on-surface">Produit introuvable</h1>
        <p className="text-on-surface-variant max-w-sm">
          Ce produit n'existe pas ou n'est plus disponible.
        </p>
        <Link
          to="/nos-farines"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 transition-opacity"
        >
          <Icon name="arrow_back" size="sm" />
          Voir tous nos produits
        </Link>
      </div>
    );
  }

  const canonicalId = product.slug ?? product.id;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: effectiveImage || undefined,
    brand: { '@type': 'Brand', name: 'RIMAMAN' },
    offers: product.variants.length > 0
      ? product.variants.map((v) => ({
          '@type': 'Offer',
          price: v.price,
          priceCurrency: 'XOF',
          availability: (v.stock ?? 1) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          name: v.weight,
        }))
      : {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'XOF',
          availability: 'https://schema.org/InStock',
        },
    ...(reviews?.length
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: avgRating.toFixed(1),
            reviewCount: reviews.length,
          },
        }
      : {}),
  });

  const TABS: { key: Tab; label: string }[] = [
    { key: 'description', label: 'Description' },
    { key: 'nutrition', label: 'Nutrition' },
    { key: 'preparation', label: 'Préparation' },
  ];

  return (
    <>
      <Helmet>
        <title>{product.name} | RIMAMAN — Farine de riz &amp; manioc</title>
        <meta name="description" content={product.description} />
        <link rel="canonical" href={`/nos-farines/${canonicalId}`} />
        <script type="application/ld+json">{jsonLd}</script>
      </Helmet>

      {/* ── Breadcrumb ── */}
      <nav
        aria-label="Fil d'Ariane"
        className="bg-surface-container-low border-b border-outline-variant pt-20"
      >
        <div className="max-w-7xl mx-auto px-8 py-4">
          <ol className="flex items-center gap-1.5 text-sm text-on-surface-variant flex-wrap">
            <li>
              <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
            </li>
            <li aria-hidden="true"><Icon name="chevron_right" size="sm" /></li>
            <li>
              <Link to="/nos-farines" className="hover:text-primary transition-colors">Nos farines</Link>
            </li>
            <li aria-hidden="true"><Icon name="chevron_right" size="sm" /></li>
            <li className="text-on-surface font-medium truncate max-w-xs" aria-current="page">
              {product.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* ── Produit principal ── */}
      <section className="bg-surface py-12" aria-label={product.name}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden border border-outline-variant sticky top-24">
              {effectiveImage ? (
                <img
                  src={effectiveImage}
                  alt={`${product.name} — ${effectiveWeight}`}
                  className="w-full h-96 lg:h-[480px] object-cover"
                  fetchPriority="high"
                />
              ) : (
                <div className="w-full h-96 lg:h-[480px] bg-surface-container-low flex items-center justify-center">
                  <Icon name="image" size="xl" className="text-on-surface-variant opacity-30" />
                </div>
              )}
              {product.isBestseller && (
                <div className="absolute top-4 left-4 bg-secondary text-on-secondary text-sm font-bold px-4 py-1.5 rounded-full uppercase">
                  Bestseller
                </div>
              )}
            </div>

            {/* Infos */}
            <div className="flex flex-col">
              {/* Catégorie */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 w-fit">
                {product.productCategory?.name ?? product.category}
              </div>

              <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mb-3">
                {product.name}
              </h1>

              {/* Note synthétique */}
              {(reviews?.length ?? 0) > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <Stars rating={Math.round(avgRating)} />
                  <span className="text-sm text-on-surface-variant">
                    {avgRating.toFixed(1)} ({reviews!.length} avis)
                  </span>
                </div>
              )}

              <p className="text-on-surface-variant leading-relaxed mb-6">{product.description}</p>

              {/* ── Sélecteur de variante ── */}
              {product.variants.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3">
                    Format disponible
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary ${
                          selectedVariant?.id === v.id
                            ? 'border-primary bg-primary text-on-primary'
                            : 'border-outline text-on-surface hover:border-primary'
                        }`}
                        aria-pressed={selectedVariant?.id === v.id}
                      >
                        {v.weight}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags: poids, personnes, temps */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low border border-outline-variant text-sm text-on-surface">
                  <Icon name="scale" size="sm" className="text-primary" />
                  {effectiveWeight}
                </div>
                {servings && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low border border-outline-variant text-sm text-on-surface">
                    <Icon name="group" size="sm" className="text-secondary" />
                    ~{servings} personnes
                  </div>
                )}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low border border-outline-variant text-sm text-on-surface">
                  <Icon name="schedule" size="sm" className="text-primary" />
                  Prêt en 15 min
                </div>
              </div>

              {/* Prix */}
              <div className="mb-6 p-6 rounded-2xl bg-surface-container-low border border-outline-variant">
                <div className="flex items-end gap-3 mb-1">
                  <span className="text-3xl font-bold text-on-surface">
                    {effectivePrice.toLocaleString()} FCFA
                  </span>
                </div>
                {pricePerPerson && (
                  <p className="text-on-surface-variant text-sm">
                    Soit environ{' '}
                    <strong className="text-primary">{pricePerPerson} FCFA</strong> par personne
                  </p>
                )}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button
                  variant="primary"
                  icon="add_shopping_cart"
                  onClick={handleAddToCart}
                  className="flex-1"
                >
                  Ajouter au panier
                </Button>
                <Link
                  to="/panier"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-on-primary transition-colors"
                >
                  <Icon name="shopping_cart" size="sm" />
                  Voir le panier
                </Link>
              </div>

              {/* Badges de confiance */}
              <div className="space-y-3">
                {[
                  { icon: 'eco', text: '100% naturel — sans additifs ni conservateurs' },
                  { icon: 'health_and_safety', text: 'Sans gluten certifié' },
                  { icon: 'schedule', text: 'Fufu prêt en 15 minutes' },
                  { icon: 'local_shipping', text: 'Livraison disponible sur Cotonou' },
                  { icon: 'verified_user', text: 'Satisfait ou remboursé sous 7 jours' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <Icon name={icon} size="sm" className="text-primary flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Onglets ── */}
      <section className="bg-surface-container py-12" aria-label="Détails du produit">
        <div className="max-w-7xl mx-auto px-8">
          {/* Barre d'onglets */}
          <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 border border-outline-variant mb-10 w-fit overflow-x-auto">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === key
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Description ── */}
          {activeTab === 'description' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="font-headline text-xl font-bold text-on-surface mb-6">
                  Caractéristiques
                </h2>
                {product.features.length > 0 ? (
                  <ul className="space-y-4">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Icon name="check_circle" size="sm" className="text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-on-surface-variant leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-on-surface-variant text-sm">
                    Caractéristiques bientôt disponibles.
                  </p>
                )}
              </div>
              <div>
                <h2 className="font-headline text-xl font-bold text-on-surface mb-6">
                  Conservation &amp; conditionnement
                </h2>
                <div className="space-y-4 text-on-surface-variant text-sm leading-relaxed">
                  {product.storageInfo ? (
                    <p>{product.storageInfo}</p>
                  ) : (
                    <>
                      <p>
                        Conservez dans un endroit frais et sec, à l'abri de la lumière directe et de l'humidité.
                      </p>
                      <p>
                        Après ouverture, refermez hermétiquement et consommez dans les{' '}
                        <strong className="text-on-surface">3 mois</strong>.
                      </p>
                    </>
                  )}
                  <div className="space-y-2 pt-2">
                    {[
                      { label: 'DLC', val: '18 mois à partir de la date de fabrication' },
                      { label: 'Conditionnement', val: `Sachet hermétique ${effectiveWeight}` },
                      { label: 'Origine', val: 'Fabriqué au Bénin, riz et manioc locaux' },
                      {
                        label: 'Allergènes',
                        val: product.allergens ?? 'Sans gluten — peut contenir des traces de soja',
                      },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex gap-2">
                        <span className="font-semibold text-on-surface min-w-[130px]">{label} :</span>
                        <span>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Nutrition ── */}
          {activeTab === 'nutrition' && (
            <div className="max-w-2xl">
              <h2 className="font-headline text-xl font-bold text-on-surface mb-2">
                Valeurs nutritionnelles
              </h2>
              <p className="text-on-surface-variant text-sm mb-8">
                Pour 100g de produit sec (valeurs indicatives).
              </p>

              {product.nutrition && product.nutrition.length > 0 ? (
                <div className="border border-outline-variant rounded-2xl overflow-hidden mb-8">
                  {product.nutrition.map(({ label, value, sub }, i, arr) => (
                    <div
                      key={label}
                      className={`flex justify-between items-start p-4 gap-4 ${
                        i !== arr.length - 1 ? 'border-b border-outline-variant' : ''
                      } ${i % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'}`}
                    >
                      <div>
                        <p className="text-on-surface font-medium">{label}</p>
                        {sub && (
                          <p className="text-on-surface-variant text-xs pl-4 mt-0.5">{sub}</p>
                        )}
                      </div>
                      <p className="text-on-surface font-bold whitespace-nowrap">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant text-center mb-8">
                  <Icon name="nutrition" className="text-on-surface-variant mb-3" />
                  <p className="text-on-surface-variant">
                    Le tableau nutritionnel de ce produit n'est pas encore disponible.
                    <br />
                    Contactez-nous pour plus d'informations.
                  </p>
                </div>
              )}

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
                <h3 className="font-bold text-on-surface mb-4">Certifications &amp; engagements</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    'Sans gluten',
                    'Sans additifs',
                    'Sans conservateurs',
                    'Non OGM',
                    '100% naturel',
                  ].map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                    >
                      <Icon name="verified" size="sm" />
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Préparation ── */}
          {activeTab === 'preparation' && (
            <div className="max-w-2xl">
              {recipesLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="md" />
                </div>
              ) : linkedRecipes.length > 0 ? (
                linkedRecipes.slice(0, 2).map((recipe) => (
                  <div key={recipe.id} className="mb-12 last:mb-0">
                    <h2 className="font-headline text-xl font-bold text-on-surface mb-1">
                      {recipe.title}
                    </h2>
                    <p className="text-on-surface-variant text-sm mb-8">{recipe.description}</p>
                    <div className="space-y-8 mb-8">
                      {recipe.steps.map(({ step, instruction }) => (
                        <div key={step} className="flex gap-5">
                          <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold flex-shrink-0 text-lg">
                            {step}
                          </div>
                          <p className="text-on-surface leading-relaxed pt-1.5">{instruction}</p>
                        </div>
                      ))}
                    </div>
                    {recipe.tips.length > 0 && (
                      <div className="p-6 rounded-2xl bg-secondary/10 border border-secondary/20 mb-6">
                        <div className="flex items-start gap-3">
                          <Icon name="tips_and_updates" className="text-secondary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-on-surface mb-2">Conseils</p>
                            <ul className="space-y-1">
                              {recipe.tips.map((tip, i) => (
                                <li key={i} className="text-on-surface-variant text-sm leading-relaxed">
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                    <Link
                      to={`/recettes/${recipe.slug}`}
                      className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
                    >
                      Voir la recette complète
                      <Icon name="arrow_forward" size="sm" />
                    </Link>
                  </div>
                ))
              ) : (
                <>
                  <h2 className="font-headline text-xl font-bold text-on-surface mb-2">
                    Comment préparer votre fufu
                  </h2>
                  <p className="text-on-surface-variant text-sm mb-10">
                    Suivez ces 4 étapes pour un fufu parfait en 15 minutes.
                  </p>
                  <div className="space-y-8 mb-10">
                    {FALLBACK_PREP_STEPS.map(({ step, text }) => (
                      <div key={step} className="flex gap-5">
                        <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold flex-shrink-0 text-lg">
                          {step}
                        </div>
                        <p className="text-on-surface leading-relaxed pt-1.5">{text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/10 border border-secondary/20">
                    <div className="flex items-start gap-3">
                      <Icon name="tips_and_updates" className="text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-on-surface mb-1">Conseil RIMAMAN</p>
                        <p className="text-on-surface-variant text-sm leading-relaxed">
                          Pour un fufu plus onctueux, laissez reposer 2 minutes hors du feu avant de former les boules.
                          Servez avec une sauce gombo, légumes ou egusi pour un repas complet et rassasiant.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Avis clients ── */}
      <section className="bg-surface py-16" aria-label="Avis clients">
        <div className="max-w-5xl mx-auto px-8">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">Avis clients</h2>
              {(reviews?.length ?? 0) > 0 && (
                <div className="flex items-center gap-2">
                  <Stars rating={Math.round(avgRating)} size="md" />
                  <span className="text-on-surface-variant text-sm">
                    {avgRating.toFixed(1)} sur 5 — {reviews!.length} avis
                  </span>
                </div>
              )}
            </div>
            {!reviewSubmitted && (
              <button
                onClick={() => setShowReviewForm((s) => !s)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-on-primary transition-colors"
              >
                <Icon name="rate_review" size="sm" />
                Laisser un avis
              </button>
            )}
          </div>

          {/* Formulaire d'avis */}
          {showReviewForm && (
            <form
              onSubmit={handleSubmitReview}
              className="mb-10 p-8 rounded-2xl bg-surface-container-low border border-outline-variant"
              aria-label="Formulaire d'avis"
            >
              <h3 className="font-headline text-lg font-bold text-on-surface mb-6">
                Votre avis sur {product.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                    Votre nom
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewForm.author}
                    onChange={(e) => setReviewForm((f) => ({ ...f, author: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="Mme Adjovi..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                    Titre de l'avis
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="Excellent produit !"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  Note
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                      className={`transition-colors ${star <= reviewForm.rating ? 'text-secondary' : 'text-outline hover:text-secondary'}`}
                      aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                    >
                      <Icon name="star" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                  Votre commentaire
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                  placeholder="Partagez votre expérience avec ce produit..."
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="primary" disabled={reviewSubmitting}>
                  {reviewSubmitting ? 'Envoi en cours…' : 'Envoyer mon avis'}
                </Button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-5 py-2.5 rounded-full border border-outline text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}

          {reviewSubmitted && (
            <div className="mb-8 flex items-start gap-3 p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <Icon name="check_circle" className="text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-on-surface">Merci pour votre avis !</p>
                <p className="text-on-surface-variant text-sm mt-1">
                  Il est en attente de modération et sera publié prochainement.
                </p>
              </div>
            </div>
          )}

          {/* Liste des avis */}
          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : (reviews?.length ?? 0) > 0 ? (
            <div className="space-y-6">
              {reviews!.map((review: Review) => (
                <article
                  key={review.id}
                  className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-on-surface">{review.author}</p>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <Stars rating={review.rating} />
                  </div>
                  {review.title && (
                    <p className="font-semibold text-on-surface mb-2">{review.title}</p>
                  )}
                  <p className="text-on-surface-variant leading-relaxed">{review.comment}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-on-surface-variant">
              <Icon name="rate_review" size="xl" className="mb-3 opacity-30" />
              <p className="font-medium text-on-surface mb-1">Aucun avis pour l'instant</p>
              <p className="text-sm">Soyez le premier à partager votre expérience !</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Produits similaires ── */}
      {relatedProducts.length > 0 && (
        <section className="bg-surface-container py-16" aria-label="Autres produits">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-end justify-between mb-10">
              <h2 className="font-headline text-2xl font-bold text-on-surface">Vous aimerez aussi</h2>
              <Link
                to="/nos-farines"
                className="text-primary font-medium hover:underline text-sm flex items-center gap-1"
              >
                Voir tout
                <Icon name="arrow_forward" size="sm" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="bg-primary py-12" aria-label="Assistance">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <h2 className="font-headline text-2xl font-bold text-on-primary mb-3">
            Des questions sur nos produits ?
          </h2>
          <p className="text-on-primary/80 mb-8">
            Notre équipe est disponible pour vous aider. Contactez-nous ou consultez notre FAQ.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-primary font-semibold hover:opacity-90 transition-opacity"
            >
              <Icon name="chat" />
              Nous contacter
            </Link>
            <Link
              to="/faq"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/30 text-on-primary font-semibold hover:bg-white/10 transition-colors"
            >
              <Icon name="help" />
              FAQ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
