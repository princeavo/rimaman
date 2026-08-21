import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../components/common/Icon';
import { ProductCard } from '../components/common/ProductCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useProducts } from '../hooks/useProducts';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchApprovedReviews } from '../api/reviews';
import { fetchRecipes } from '../api/recipes';


const FEATURES = [
  {
    icon: 'local_shipping',
    title: 'Livraison à Cotonou',
    desc: 'Livraison à domicile sur Cotonou et ses environs. Commandez via WhatsApp ou notre site.',
  },
  {
    icon: 'eco',
    title: '100% naturel, sans additifs',
    desc: 'Aucun conservateur, aucun colorant. Juste du riz et du manioc transformés au Bénin.',
  },
  {
    icon: 'verified_user',
    title: 'Qualité garantie',
    desc: 'Chaque sachet est contrôlé avant expédition. Satisfait ou remboursé sous 7 jours.',
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} étoiles sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Icon
          key={i}
          name={i < rating ? 'star' : 'star_border'}
          size="sm"
          className={i < rating ? 'text-secondary' : 'text-on-primary/30'}
        />
      ))}
    </div>
  );
}

export const Products: React.FC = () => {
  const {
    products: filteredProducts,
    allProducts,
    availableWeights,
    filter: selectedFilter,
    setFilter: setSelectedFilter,
    loading,
    error,
    retry,
  } = useProducts();

  // ── Avis ────────────────────────────────────────────────────────────────────
  const { data: allReviews, loading: reviewsLoading } = useAsyncData(
    () => fetchApprovedReviews(),
    [],
  );
  const reviewsAvg = useMemo(() => {
    if (!allReviews?.length) return null;
    return allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  }, [allReviews]);

  const displayedTestimonials = useMemo(
    () => (allReviews ?? []).slice(0, 3),
    [allReviews],
  );

  // ── Recettes liées ───────────────────────────────────────────────────────────
  const { data: allRecipes, loading: recipesLoading } = useAsyncData(fetchRecipes, []);
  const linkedRecipes = useMemo(() => {
    const withProducts = (allRecipes ?? []).filter((r) => r.relatedProducts.length > 0);
    return (withProducts.length > 0 ? withProducts : (allRecipes ?? [])).slice(0, 3);
  }, [allRecipes]);

  const jsonLd = useMemo(() => {
    if (allProducts.length === 0) return null;
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Farines RIMAMAN',
      description: 'Farine de riz et manioc, 100% naturelle, sans gluten, fabriquée au Bénin.',
      numberOfItems: allProducts.length,
      itemListElement: allProducts.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: p.name,
          description: p.description,
          brand: { '@type': 'Brand', name: 'RIMAMAN' },
          offers: {
            '@type': 'Offer',
            price: p.price,
            priceCurrency: 'XOF',
            availability: 'https://schema.org/InStock',
          },
        },
      })),
    });
  }, [allProducts]);

  return (
    <>
      <Helmet>
        <title>Notre Farine de Riz &amp; Manioc | RIMAMAN — Sans gluten, 100% naturelle</title>
        <meta
          name="description"
          content="Découvrez la farine RIMAMAN : un mélange de riz et manioc 100% naturel, sans gluten, pour préparer votre fufu en 15 minutes. Livraison à Cotonou."
        />
        {jsonLd && <script type="application/ld+json">{jsonLd}</script>}
      </Helmet>

      {/* ── 1. Hero ── */}
      <section
        className="relative min-h-[50vh] flex items-end overflow-hidden bg-primary pt-20"
        aria-label="Notre farine de riz et manioc"
      >
        <div className="absolute top-8 right-8 w-64 h-64 rounded-full bg-white/5 pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 right-24 w-40 h-40 rounded-full bg-white/5 pointer-events-none" aria-hidden="true" />
        <div className="absolute right-0 top-0 h-full w-2/5 overflow-hidden hidden md:block pointer-events-none" aria-hidden="true">
          <img
            src="/rimaman.jpeg"
            alt=""
            className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-primary" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-16 w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-sm font-semibold mb-6">
            <Icon name="eco" size="sm" />
            Tradition béninoise &amp; qualité bio
          </div>
          <h1 className="font-headline text-4xl md:text-6xl font-bold text-on-primary mb-6 max-w-2xl leading-tight">
            Notre farine de riz &amp; manioc
          </h1>
          <p className="text-on-primary/80 max-w-xl text-lg leading-relaxed mb-8">
            Un mélange unique de riz et manioc, transformé au Bénin pour préparer votre fufu en 15 minutes.
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { icon: 'verified', label: '100% Bio' },
              { icon: 'health_and_safety', label: 'Sans gluten' },
              { icon: 'schedule', label: 'Prêt en 15 min' },
              { icon: 'eco', label: 'Fabriqué au Bénin' },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-on-primary text-sm font-medium"
              >
                <Icon name={icon} size="sm" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Catalogue ── */}
      <section id="products-catalogue" className="bg-surface py-16" aria-label="Catalogue de produits">
        <div className="max-w-7xl mx-auto px-8">
          {/* Barre de filtres */}
          <div className="bg-surface-container-low p-6 rounded-2xl mb-10 border border-outline-variant">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-3 items-center">
                <span className="font-semibold text-on-surface">Format :</span>
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-5 py-2 rounded-full font-medium transition-colors ${
                    selectedFilter === 'all'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  Tous
                </button>
                {availableWeights.map((w) => (
                  <button
                    key={w}
                    onClick={() => setSelectedFilter(w)}
                    className={`px-5 py-2 rounded-full font-medium transition-colors ${
                      selectedFilter === w
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
              <div className="text-on-surface-variant text-sm">
                <span className="font-semibold">{filteredProducts.length}</span>{' '}
                produit{filteredProducts.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* États : chargement / erreur / vide / grille */}
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 py-24">
              <Icon name="cloud_off" size="xl" className="text-on-surface-variant" />
              <p className="text-on-surface-variant text-center">
                Impossible de charger les produits pour le moment.
              </p>
              <button
                onClick={retry}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant text-sm font-medium hover:bg-surface-container transition-colors"
              >
                <Icon name="refresh" size="sm" />
                Réessayer
              </button>
            </div>
          ) : allProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <Icon name="inventory_2" size="xl" className="text-on-surface-variant" />
              <p className="text-on-surface-variant">Aucun produit disponible pour le moment.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <Icon name="filter_list_off" size="xl" className="text-on-surface-variant" />
              <p className="text-on-surface-variant">Aucun produit dans ce format.</p>
              <button
                onClick={() => setSelectedFilter('all')}
                className="text-primary text-sm font-medium hover:underline"
              >
                Voir tous les produits
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 3. Comment choisir ── */}
      <section className="bg-surface-container py-16" aria-label="Comment choisir votre format">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-10">
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-3">
              Comment choisir votre format ?
            </h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">
              La farine RIMAMAN s'adapte à chaque foyer, de la famille de 6 personnes au restaurant professionnel.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface p-8 rounded-2xl border border-outline-variant">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Icon name="people" className="text-primary" />
              </div>
              <p className="font-bold text-on-surface text-lg mb-1">Format 1kg</p>
              <p className="text-primary text-sm font-semibold mb-4">~6 personnes</p>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Notre format de référence. Idéal pour un repas familial hebdomadaire — préparez votre fufu en 15 minutes seulement.
              </p>
            </div>
            <div className="bg-surface p-8 rounded-2xl border border-outline-variant">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Icon name="family_restroom" className="text-primary" />
              </div>
              <p className="font-bold text-on-surface text-lg mb-1">Format 5kg</p>
              <p className="text-primary text-sm font-semibold mb-4">~30 personnes</p>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Économique pour les familles nombreuses ou une consommation hebdomadaire intensive.{' '}
                <Link to="/contact" className="text-primary hover:underline font-medium">
                  Contactez-nous
                </Link>{' '}
                pour commander.
              </p>
            </div>
            <div className="bg-surface p-8 rounded-2xl border border-secondary/20">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <Icon name="warehouse" className="text-secondary" />
              </div>
              <p className="font-bold text-on-surface text-lg mb-1">Format professionnel (25kg+)</p>
              <p className="text-secondary text-sm font-semibold mb-4">Restaurants · Cantines · Revendeurs</p>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Tarifs dégressifs selon volume. Conditionnements spécifiques disponibles sur devis.
              </p>
            </div>
          </div>
          <p className="text-on-surface-variant text-sm text-center">
            Besoin d'aide pour choisir ?{' '}
            <Link to="/faq" className="text-primary font-medium hover:underline">
              Consultez notre FAQ
            </Link>{' '}
            ou visitez notre{' '}
            <Link to="/b2b" className="text-primary font-medium hover:underline">
              espace professionnels
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── 4. Nutrition brief ── */}
      <section className="bg-surface py-16" aria-label="Qualité et nutrition">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                <Icon name="health_and_safety" size="sm" />
                Valeurs nutritionnelles
              </div>
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-4">
                Une farine saine et rassasiante
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-8">
                Notre farine est naturellement sans gluten, riche en glucides complexes et en énergie. Aucun additif, aucun conservateur — seulement des céréales et tubercules béninois transformés artisanalement.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Énergie', value: '357 kcal', sub: 'pour 100g' },
                  { label: 'Glucides', value: '78,5 g', sub: 'dont sucres 0,8g' },
                  { label: 'Protéines', value: '7,2 g', sub: 'pour 100g' },
                  { label: 'Sans gluten', value: '0 g', sub: 'de gluten' },
                ].map(({ label, value, sub }) => (
                  <div
                    key={label}
                    className="p-4 rounded-xl bg-surface-container-low border border-outline-variant"
                  >
                    <p className="text-on-surface-variant text-xs mb-1">{label}</p>
                    <p className="text-on-surface font-bold text-xl">{value}</p>
                    <p className="text-on-surface-variant text-xs">{sub}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant">
                * Valeurs indicatives pour 100g de produit sec. Voir la fiche produit pour le tableau complet.
              </p>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-outline-variant">
                <img
                  src="/famille-rimaman.jpeg"
                  alt="Famille préparant le fufu RIMAMAN"
                  className="w-full h-72 object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-secondary text-on-secondary px-6 py-4 rounded-2xl shadow-lg">
                <p className="text-2xl font-bold">7+</p>
                <p className="text-xs opacity-80">ans d'expérience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Témoignages (API uniquement) ── */}
      {(reviewsLoading || displayedTestimonials.length > 0) && (
        <section className="bg-primary py-16" aria-label="Témoignages clients">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-10">
              <h2 className="font-headline text-3xl font-bold text-on-primary mb-3">
                Ce que nos clientes disent
              </h2>
              {reviewsAvg !== null && (
                <div className="flex items-center justify-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Icon
                        key={i}
                        name={i < Math.round(reviewsAvg) ? 'star' : 'star_border'}
                        size="sm"
                        className="text-secondary"
                      />
                    ))}
                  </div>
                  <span className="text-on-primary/80 font-medium">
                    {reviewsAvg.toFixed(1)} / 5 · {allReviews!.length} avis
                  </span>
                </div>
              )}
            </div>

            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayedTestimonials.map((t) => (
                  <div key={t.id} className="bg-white/10 rounded-2xl p-8 flex flex-col gap-4">
                    <Stars rating={t.rating} />
                    <p className="text-on-primary leading-relaxed italic">"{t.comment}"</p>
                    <div className="mt-auto flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-on-primary font-bold text-sm">{t.author[0]}</span>
                      </div>
                      <p className="text-on-primary font-semibold text-sm">{t.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 6. Recettes (API uniquement) ── */}
      {(recipesLoading || linkedRecipes.length > 0) && <section className="bg-surface py-16" aria-label="Recettes avec notre farine">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">
                Que préparer avec la farine RIMAMAN ?
              </h2>
              <p className="text-on-surface-variant">
                Du fufu classique aux préparations créatives — nos recettes vous guident pas à pas.
              </p>
            </div>
            <Link
              to="/recettes"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-outline-variant text-on-surface font-medium hover:bg-surface-container transition-colors whitespace-nowrap"
            >
              Toutes les recettes
              <Icon name="arrow_forward" size="sm" />
            </Link>
          </div>

          {recipesLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : linkedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {linkedRecipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  to={`/recettes/${recipe.slug}`}
                  className="group block bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant hover-lift"
                >
                  {recipe.image ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-primary/10 flex items-center justify-center">
                      <Icon name="restaurant" size="xl" className="text-primary opacity-40" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-headline text-lg font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                      {recipe.title}
                    </h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <Icon name="schedule" size="sm" />
                        {recipe.prepTime + recipe.cookTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="signal_cellular_alt" size="sm" />
                        {recipe.difficulty.name}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>}

      {/* ── 7. Garanties ── */}
      <section className="bg-surface-container-low py-16 border-t border-outline-variant" aria-label="Nos garanties">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="p-8 rounded-2xl bg-surface border border-outline-variant text-center">
                <Icon name={icon} size="lg" className="text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2 text-on-surface">{title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. CTA final ── */}
      <section className="bg-surface py-16" aria-label="Commander">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <h2 className="font-headline text-3xl font-bold text-on-surface mb-4">
            Prêt à commander ?
          </h2>
          <p className="text-on-surface-variant mb-8 text-lg">
            Commandez directement en ligne ou contactez-nous par WhatsApp. Pour les professionnels, demandez un devis personnalisé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('products-catalogue')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 transition-opacity"
            >
              <Icon name="add_shopping_cart" />
              Commander maintenant
            </button>
            <Link
              to="/b2b"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-container transition-colors"
            >
              <Icon name="business" />
              Espace professionnels
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
