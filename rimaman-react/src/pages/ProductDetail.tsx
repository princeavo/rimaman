import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../components/common/Icon';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ProductCard } from '../components/common/ProductCard';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { useProducts } from '../hooks/useProducts';
import { fetchProduct } from '../api/products';
import { trackAddToCart } from '../utils/analytics';
import type { Product } from '../types';

type Tab = 'description' | 'nutrition' | 'preparation';

const PREP_STEPS = [
  { step: 1, text: "Faites bouillir 1,5 fois le volume d'eau par rapport à la farine dans une casserole à feu vif." },
  { step: 2, text: 'Versez la farine RIMAMAN en pluie dans l\'eau bouillante tout en remuant immédiatement.' },
  { step: 3, text: 'Remuez vigoureusement et sans arrêt pendant 10 à 12 minutes à feu moyen jusqu\'à obtenir une pâte lisse.' },
  { step: 4, text: 'Formez des boules de fufu à la cuillère mouillée et servez chaud avec votre sauce préférée.' },
];

const NUTRITION_TABLE = [
  { nutriment: 'Énergie', value: '357 kcal / 1 493 kJ' },
  { nutriment: 'Matières grasses', value: '0,4 g', sub: 'dont acides gras saturés : 0,1 g' },
  { nutriment: 'Glucides', value: '78,5 g', sub: 'dont sucres : 0,8 g' },
  { nutriment: 'Fibres alimentaires', value: '1,9 g' },
  { nutriment: 'Protéines', value: '7,2 g' },
  { nutriment: 'Sel', value: '0,01 g' },
];

function getServings(weight: string): number | null {
  const lower = weight.toLowerCase().trim();
  const n = parseFloat(lower);
  if (isNaN(n)) return null;
  const kg = lower.includes('kg') ? n : n / 1000;
  return Math.round(kg * 6);
}

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('description');

  const addItem = useCartStore((state) => state.addItem);
  const showToast = useToastStore((state) => state.showToast);
  const { allProducts } = useProducts();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setFetchError(false);
    fetchProduct(id)
      .then(setProduct)
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const servings = useMemo(() => (product ? getServings(product.weight) : null), [product]);
  const pricePerPerson = servings && product ? Math.round(product.price / servings) : null;

  const relatedProducts = useMemo(
    () => allProducts.filter((p) => p.id !== id).slice(0, 3),
    [allProducts, id]
  );

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product);
    showToast(`${product.name} ajouté au panier`, 'success');
    trackAddToCart(product);
  };

  if (loading) {
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

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: { '@type': 'Brand', name: 'RIMAMAN' },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'XOF',
      availability: 'https://schema.org/InStock',
    },
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
              <Link to="/" className="hover:text-primary transition-colors">
                Accueil
              </Link>
            </li>
            <li aria-hidden="true"><Icon name="chevron_right" size="sm" /></li>
            <li>
              <Link to="/nos-farines" className="hover:text-primary transition-colors">
                Nos farines
              </Link>
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
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 lg:h-[480px] object-cover"
                fetchPriority="high"
              />
              {product.isBestseller && (
                <div className="absolute top-4 left-4 bg-secondary text-on-secondary text-sm font-bold px-4 py-1.5 rounded-full uppercase">
                  Bestseller
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 w-fit">
                {product.category}
              </div>
              <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mb-4">
                {product.name}
              </h1>
              <p className="text-on-surface-variant leading-relaxed mb-6">{product.description}</p>

              {/* Weight + servings */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low border border-outline-variant text-sm text-on-surface">
                  <Icon name="scale" size="sm" className="text-primary" />
                  {product.weight}
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

              {/* Price box */}
              <div className="mb-6 p-6 rounded-2xl bg-surface-container-low border border-outline-variant">
                <div className="flex items-end gap-3 mb-1">
                  <span className="text-3xl font-bold text-on-surface">
                    {product.price.toLocaleString()} FCFA
                  </span>
                </div>
                {pricePerPerson && (
                  <p className="text-on-surface-variant text-sm">
                    Soit environ{' '}
                    <strong className="text-primary">{pricePerPerson} FCFA</strong> par personne
                  </p>
                )}
              </div>

              {/* CTA buttons */}
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

              {/* Quick feature list */}
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
          {/* Tab bar */}
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
                <ul className="space-y-4">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Icon name="check_circle" size="sm" className="text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-on-surface-variant leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-headline text-xl font-bold text-on-surface mb-6">
                  Conservation &amp; conditionnement
                </h2>
                <div className="space-y-4 text-on-surface-variant text-sm leading-relaxed">
                  <p>
                    Conservez dans un endroit frais et sec, à l'abri de la lumière directe et de l'humidité.
                  </p>
                  <p>
                    Après ouverture, refermez hermétiquement et consommez dans les{' '}
                    <strong className="text-on-surface">3 mois</strong>.
                  </p>
                  <div className="space-y-2 pt-2">
                    {[
                      { label: 'DLC', val: '18 mois à partir de la date de fabrication' },
                      { label: 'Conditionnement', val: `Sachet hermétique ${product.weight}` },
                      { label: 'Origine', val: 'Fabriqué au Bénin, riz et manioc locaux' },
                      { label: 'Allergènes', val: 'Sans gluten — peut contenir des traces de soja' },
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
              <div className="border border-outline-variant rounded-2xl overflow-hidden mb-8">
                {NUTRITION_TABLE.map(({ nutriment, value, sub }, i) => (
                  <div
                    key={nutriment}
                    className={`flex justify-between items-start p-4 gap-4 ${
                      i !== NUTRITION_TABLE.length - 1 ? 'border-b border-outline-variant' : ''
                    } ${i % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'}`}
                  >
                    <div>
                      <p className="text-on-surface font-medium">{nutriment}</p>
                      {sub && (
                        <p className="text-on-surface-variant text-xs pl-4 mt-0.5">{sub}</p>
                      )}
                    </div>
                    <p className="text-on-surface font-bold whitespace-nowrap">{value}</p>
                  </div>
                ))}
              </div>
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
              <h2 className="font-headline text-xl font-bold text-on-surface mb-2">
                Comment préparer votre fufu
              </h2>
              <p className="text-on-surface-variant text-sm mb-10">
                Suivez ces 4 étapes pour un fufu parfait en 15 minutes.
              </p>
              <div className="space-y-8 mb-10">
                {PREP_STEPS.map(({ step, text }) => (
                  <div key={step} className="flex gap-5">
                    <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold flex-shrink-0 text-lg">
                      {step}
                    </div>
                    <div className="pt-1.5">
                      <p className="text-on-surface leading-relaxed">{text}</p>
                    </div>
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
            </div>
          )}
        </div>
      </section>

      {/* ── Produits similaires ── */}
      {relatedProducts.length > 0 && (
        <section className="bg-surface py-16" aria-label="Autres produits">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-end justify-between mb-10">
              <h2 className="font-headline text-2xl font-bold text-on-surface">
                Vous aimerez aussi
              </h2>
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
