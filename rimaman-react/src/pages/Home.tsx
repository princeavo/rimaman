import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../components/common/Icon';
import { NewsletterForm } from '../components/common/NewsletterForm';
import { SkeletonGrid } from '../components/common/SkeletonCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchApprovedReviews } from '../api/reviews';
import { fetchRecipes } from '../api/recipes';
import { fetchLocations } from '../api/locations';
import { fetchBlogPosts } from '../api/blog';
import { fetchProducts } from '../api/products';

// ── Types d'affichage ─────────────────────────────────────────────────────────

type RecipeDisplay   = { id: string; title: string; image: string; time: string; level: string; desc: string; href: string; };
type ReviewDisplay   = { id: string; author: string; rating: number; comment: string; };
type LocationDisplay = { id: string; name: string; type: string; address?: string; };
type PostDisplay     = { id: string; title: string; image: string; date: string; readTime: string; excerpt: string; href: string; };
type VariantDisplay  = { id: string; weight: string; price: number; isDefault: boolean; };
type FeaturedProduct = { name: string; description: string; image: string; slug: string | null; servings: number | null; variants: VariantDisplay[]; };

// ── Contenu éditorial statique ────────────────────────────────────────────────

const QUICK_STATS = [
  { value: '8 000+', label: 'familles' },
  { value: '100 %',  label: 'bio & naturel' },
  { value: '12',     label: 'villes au Bénin' },
  { value: `${new Date().getFullYear() - 2018} ans`, label: "d'expertise" },
];

const BENEFITS = [
  { icon: 'bolt',          title: 'Énergie Durable',  text: 'Riche en glucides complexes pour vous accompagner tout au long de la journée sans fatigue.' },
  { icon: 'pill',          title: 'Vitamines B',       text: 'Essentielles pour votre métabolisme et le bon fonctionnement de votre système nerveux.' },
  { icon: 'ecg_heart',     title: 'Minéraux',          text: 'Une source naturelle de Potassium et Magnésium pour votre équilibre quotidien.' },
  { icon: 'bakery_dining', title: 'Texture Tendre',    text: 'Une pâte exceptionnellement tendre, souple et agréable à manger, à chaque préparation.' },
];

const FAQ_STATIC = [
  { q: 'Comment utiliser la farine RIMAMAN ?',          a: "Mélangez 200 g de farine avec 400 ml d'eau froide. Portez à ébullition en remuant constamment pendant 10-15 minutes. Formez des boules et servez avec votre sauce préférée." },
  { q: 'La farine RIMAMAN convient-elle aux enfants ?', a: "Oui. Elle est 100 % naturelle, sans additifs, sans colorants, sans conservateurs. Parfaite pour la bouillie des bébés dès 6 mois et pour toute la famille." },
  { q: 'Combien de temps se conserve-t-elle ?',         a: "12 mois dans un endroit sec, à l'abri de la lumière et de l'humidité. La DLUO est imprimée sur chaque emballage. Après ouverture, conservez dans un récipient hermétique." },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name.split(' ').map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2);
}

function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
  } catch {
    return '';
  }
}

// ── Composants UI locaux ──────────────────────────────────────────────────────

const Stars: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex gap-0.5" aria-hidden>
    {Array.from({ length: count }, (_, i) => (
      <span key={i} className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
        star
      </span>
    ))}
  </div>
);


// ── Page ──────────────────────────────────────────────────────────────────────

export const Home: React.FC = () => {
  const { data: rawReviews,   loading: loadingReviews   } = useAsyncData(() => fetchApprovedReviews(), []);
  const { data: rawRecipes,   loading: loadingRecipes   } = useAsyncData(() => fetchRecipes(), []);
  const { data: rawLocations, loading: loadingLocations } = useAsyncData(() => fetchLocations(), []);
  const { data: rawPosts,     loading: loadingPosts     } = useAsyncData(() => fetchBlogPosts(), []);
  const { data: rawProducts,  loading: loadingProducts  } = useAsyncData(() => fetchProducts(), []);

  const reviews = useMemo<ReviewDisplay[]>(() => {
    if (!rawReviews) return [];
    return rawReviews.slice(0, 4).map((r) => ({ id: r.id, author: r.author, rating: r.rating, comment: r.comment }));
  }, [rawReviews]);

  const avgRating = useMemo<string | null>(() => {
    if (!rawReviews || rawReviews.length === 0) return null;
    const avg = rawReviews.reduce((s, r) => s + r.rating, 0) / rawReviews.length;
    return avg.toFixed(1).replace('.', ',');
  }, [rawReviews]);

  const recipes = useMemo<RecipeDisplay[]>(() => {
    if (!rawRecipes) return [];
    return rawRecipes.slice(0, 3).map((r) => ({
      id:    r.id,
      title: r.title,
      image: r.image || '/rimaman.jpeg',
      time:  `${r.prepTime + r.cookTime} min`,
      level: r.difficulty.name,
      desc:  r.description,
      href:  r.slug ? `/recettes/${r.slug}` : '/recettes',
    }));
  }, [rawRecipes]);

  const locations = useMemo<LocationDisplay[]>(() => {
    if (!rawLocations) return [];
    return rawLocations.slice(0, 6).map((l) => ({ id: l.id, name: l.name, type: l.type, address: l.address }));
  }, [rawLocations]);

  const posts = useMemo<PostDisplay[]>(() => {
    if (!rawPosts) return [];
    return rawPosts.slice(0, 2).map((p) => ({
      id:       p.id,
      title:    p.title,
      image:    p.image || '/rimaman.jpeg',
      date:     formatDate(p.date),
      readTime: p.readTime,
      excerpt:  p.excerpt,
      href:     p.slug ? `/blog/${p.slug}` : '/blog',
    }));
  }, [rawPosts]);

  const featured = useMemo<FeaturedProduct | null>(() => {
    if (!rawProducts || rawProducts.length === 0) return null;
    const p = rawProducts.find((x) => x.isBestseller) ?? rawProducts[0];
    return {
      name:        p.name,
      description: p.description ?? '',
      image:       p.image || '/rimaman.jpeg',
      slug:        p.slug,
      servings:    p.servings,
      variants:    [...p.variants]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((v) => ({ id: v.id, weight: v.weight, price: v.price, isDefault: v.isDefault })),
    };
  }, [rawProducts]);

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "RIMAMAN – Le Moulin d'Or",
    description: 'Fabricant béninois de farines de riz et manioc 100 % naturelles, artisanales et sans additifs.',
    url: 'https://rimaman.bj',
    logo: '/logo.png',
    foundingDate: '2018',
    address: { '@type': 'PostalAddress', streetAddress: 'Zone Industrielle de Ganhi', addressLocality: 'Cotonou', addressCountry: 'BJ' },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_STATIC.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <>
      <Helmet>
        <title>RIMAMAN – Farine de Riz &amp; Manioc 100 % Naturelle du Bénin</title>
        <meta name="description" content="La farine de riz et manioc 100 % naturelle du Bénin. Pour un fufu parfait en 15 minutes, naturellement délicieux. Livraison dans 12 villes béninoises." />
        <meta property="og:title" content="RIMAMAN – Farine de Riz & Manioc 100 % Naturelle du Bénin" />
        <meta property="og:description" content="Deux ingrédients. Rien d'autre. La farine artisanale béninoise pour un fufu parfait en 15 minutes." />
        <meta property="og:image" content="/famille-rimaman.jpeg" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(orgJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <section aria-label="Bienvenue chez RIMAMAN" className="relative min-h-[100svh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover"
            src="/famille-rimaman.jpeg"
            alt="Famille béninoise préparant le fufu avec la farine RIMAMAN"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full py-32">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold tracking-widest uppercase mb-6">
              100 % Naturel &amp; Artisanal — Made in Bénin
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white font-headline leading-tight mb-6">
              La farine de riz &amp; manioc du Bénin —{' '}
              <span className="text-secondary-container">pour un fufu parfait en 15 minutes.</span>
            </h1>
            <p className="text-xl text-white/85 font-medium mb-10 leading-relaxed border-l-4 border-primary-fixed pl-6">
              Naturelle, sans additifs, produite au cœur du Bénin. RIMAMAN, c'est le goût authentique de votre cuisine, chaque jour.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/nos-farines" className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-secondary-fixed transition-all duration-300">
                Commander maintenant
              </Link>
              <Link to="/recettes" className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300">
                Voir les recettes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Stats ─────────────────────────────────────────────────────────── */}
      <section aria-label="Chiffres clés" className="bg-primary py-6 px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between gap-8 text-center">
          {QUICK_STATS.map((s) => (
            <div key={s.label} className="text-on-primary">
              <p className="text-2xl font-black font-headline">{s.value}</p>
              <p className="text-white/70 text-sm uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Avantages ─────────────────────────────────────────────────────── */}
      <section aria-label="Nos atouts" className="py-24 px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 max-w-xl">
            <h2 className="text-4xl md:text-5xl font-black text-primary font-headline mb-4">Pourquoi choisir RIMAMAN ?</h2>
            <p className="text-on-surface-variant text-lg">Le secret de notre qualité réside dans le respect des traditions et la sélection rigoureuse de nos grains.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {BENEFITS.map((b) => (
              <div key={b.title} className="p-8 rounded-3xl bg-surface-container-low hover:bg-surface-container-highest transition-colors duration-500 group">
                <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center mb-6 text-on-primary-container group-hover:scale-110 transition-transform">
                  <Icon name={b.icon} size="lg" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-headline text-primary">{b.title}</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Recettes ──────────────────────────────────────────────────────── */}
      {(loadingRecipes || recipes.length > 0) && (
        <section aria-label="Nos recettes" className="py-24 px-8 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">Inspiration cuisine</span>
              <h2 className="text-3xl md:text-4xl font-black font-headline text-on-surface mb-4">Que faire avec la farine RIMAMAN ?</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">De la bouillie du matin au fufu du dimanche — nos recettes vous montrent à quel point cuisiner sainement peut être simple.</p>
            </div>

            {loadingRecipes ? (
              <SkeletonGrid count={3} />
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {recipes.map((r) => (
                    <Link key={r.id} to={r.href} className="bg-surface rounded-2xl overflow-hidden shadow-sm group hover:shadow-lg transition-all duration-300 block">
                      <div className="h-48 bg-surface-container-highest relative overflow-hidden">
                        <img src={r.image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        <div className="absolute top-4 left-4 bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full">{r.level}</div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-3">
                          <Icon name="schedule" size="sm" />
                          {r.time}
                        </div>
                        <h3 className="font-headline font-bold text-on-surface text-lg mb-2 group-hover:text-primary transition-colors">{r.title}</h3>
                        <p className="text-on-surface-variant text-sm leading-relaxed">{r.desc}</p>
                      </div>
                    </Link>
                  ))}
            </div>
            )}

            {!loadingRecipes && (
              <div className="text-center">
                <Link to="/recettes" className="inline-flex items-center gap-2 text-primary font-bold hover:underline text-lg">
                  Voir toutes les recettes
                  <Icon name="arrow_forward" size="md" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 5. Produit vedette ───────────────────────────────────────────────── */}
      {(loadingProducts || featured) && (
        <section aria-label="Nos produits" className="py-24 bg-surface relative overflow-hidden px-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" aria-hidden />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-on-surface font-headline mb-4">Nos Incontournables</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">Une farine, plusieurs formats — pour s'adapter à chaque cuisine et chaque budget.</p>
            </div>
            <div className="flex justify-center">
              {loadingProducts ? (
                <div className="flex justify-center py-16">
                  <LoadingSpinner size="lg" />
                </div>
              ) : featured && (
                <div className="flex flex-col lg:flex-row bg-surface-container-low rounded-[2.5rem] overflow-hidden shadow-sm group hover:shadow-xl transition-all duration-500 max-w-4xl w-full border border-outline-variant">
                  <div className="lg:w-1/2 relative overflow-hidden">
                    <img
                      className="w-full h-full object-cover min-h-64 transition-transform duration-700 group-hover:scale-105"
                      alt={featured.name}
                      src={featured.image}
                      loading="lazy"
                    />
                    <div className="absolute top-6 left-6 bg-primary text-on-primary text-xs font-bold px-4 py-1 rounded-full uppercase tracking-tighter">
                      Bestseller
                    </div>
                  </div>
                  <div className="lg:w-1/2 p-10 flex flex-col justify-between">
                    <div>
                      <h3 className="text-3xl font-extrabold text-primary font-headline mb-3">{featured.name}</h3>
                      <p className="text-on-surface-variant mb-6 leading-relaxed">{featured.description}</p>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {featured.variants.map((v) => (
                          <div key={v.id} className={`p-3 rounded-xl border text-center ${v.isDefault ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface'}`}>
                            <p className={`font-bold text-sm ${v.isDefault ? 'text-primary' : 'text-on-surface'}`}>{v.weight}</p>
                            <p className="text-on-surface-variant text-xs">{v.price.toLocaleString('fr-FR')} FCFA</p>
                            {v.isDefault && <p className="text-primary text-xs font-bold mt-0.5">Format populaire</p>}
                          </div>
                        ))}
                      </div>
                      {featured.servings && (
                        <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-6">
                          <Icon name="group" className="text-secondary" size="md" />
                          1 kg rassasie au moins{' '}
                          <strong className="text-primary">{featured.servings} personnes</strong>
                        </div>
                      )}
                    </div>
                    <Link
                      to={featured.slug ? `/nos-farines/${featured.slug}` : '/nos-farines'}
                      className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold text-center hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Icon name="add_shopping_cart" />
                      Commander
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. Bandeau disponibilité ─────────────────────────────────────────── */}
      <section aria-label="Disponibilité nationale" className="py-10 bg-primary px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-white font-headline">En vente partout au Bénin</h3>
            <p className="text-white/70 font-medium mt-1">Supermarchés, marchés, épiceries — ou en commande directe.</p>
          </div>
          <Link to="/ou-acheter" className="flex items-center gap-3 bg-white/10 border border-white/20 text-white px-8 py-4 rounded-2xl hover:bg-white/20 transition-colors duration-300 font-bold">
            <Icon name="location_on" className="text-secondary-container" size="lg" />
            Trouver un point de vente
          </Link>
        </div>
      </section>

      {/* ── 7. Témoignages ───────────────────────────────────────────────────── */}
      {(loadingReviews || reviews.length > 0) && (
        <section aria-label="Avis clients" className="py-24 bg-surface-container-low px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Stars count={5} />
                {avgRating && (
                  <span className="text-2xl font-black font-headline text-on-surface">
                    {avgRating} / 5
                    <span className="text-base font-normal text-on-surface-variant ml-2">({rawReviews!.length} avis)</span>
                  </span>
                )}
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-primary font-headline">Ce que disent nos familles béninoises</h2>
            </div>

            {loadingReviews ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {reviews.map((r) => (
                    <div key={r.id} className="bg-surface p-8 rounded-3xl shadow-sm border border-outline-variant">
                      <Stars count={r.rating} />
                      <p className="text-on-surface-variant italic my-5 leading-relaxed">"{r.comment}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center font-bold text-on-primary-container text-sm flex-shrink-0" aria-hidden>
                          {initials(r.author)}
                        </div>
                        <p className="font-bold text-on-surface text-sm">{r.author}</p>
                      </div>
                    </div>
                  ))}
            </div>
            )}

            <div className="relative max-w-xl mx-auto">
              <div className="rounded-[2rem] overflow-hidden">
                <img className="w-full h-64 object-cover object-top" alt="Familles satisfaites par RIMAMAN" src="/famille-rimaman.jpeg" loading="lazy" />
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-secondary-container px-8 py-4 rounded-2xl shadow-xl whitespace-nowrap">
                <p className="font-bold text-on-secondary-container text-center">⭐ Adopté par plus de 8 000 familles</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 8. Points de vente ───────────────────────────────────────────────── */}
      {(loadingLocations || locations.length > 0) && (
        <section aria-label="Points de vente" className="py-24 bg-surface px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">Distribution</span>
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface mb-4">Où trouver nos farines ?</h2>
              <p className="text-on-surface-variant max-w-xl mx-auto">Disponibles dans les principales villes du Bénin — en supermarchés, marchés et épiceries de quartier.</p>
            </div>

            {loadingLocations ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-10">
              {locations.map((loc) => (
                    <div key={loc.id} className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden>
                        <Icon name="store" className="text-primary" size="md" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-on-surface text-sm leading-snug truncate">{loc.name}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{loc.type}</p>
                        {loc.address && <p className="text-xs text-on-surface-variant/70 mt-0.5 truncate">{loc.address}</p>}
                      </div>
                    </div>
                  ))}
            </div>
            )}

            <div className="text-center">
              <Link to="/ou-acheter" className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-colors">
                <Icon name="map" />
                Voir la carte complète
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── 9. Mini-FAQ ──────────────────────────────────────────────────────── */}
      <section aria-label="Questions fréquentes" className="py-24 bg-surface-container-low px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold text-on-surface">Vos questions, nos réponses</h2>
          </div>
          <div className="space-y-4">
            {FAQ_STATIC.map((f) => (
              <div key={f.q} className="bg-surface rounded-2xl p-6 border border-outline-variant">
                <h3 className="font-bold text-on-surface mb-2 flex items-start gap-3">
                  <Icon name="help" className="text-primary flex-shrink-0 mt-0.5" size="md" />
                  {f.q}
                </h3>
                <p className="text-on-surface-variant leading-relaxed text-sm pl-9">{f.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/faq" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
              Voir toutes les questions
              <Icon name="arrow_forward" size="md" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 10. Teaser B2B ───────────────────────────────────────────────────── */}
      <section aria-label="Offre professionnelle" className="py-10 bg-inverse-surface px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-inverse-on-surface/50 mb-1">Restaurateurs · Hôteliers · Revendeurs</p>
            <h3 className="text-xl font-headline font-bold text-inverse-on-surface">Vous êtes professionnel ? Nous avons une offre dédiée.</h3>
            <p className="text-inverse-on-surface/60 text-sm mt-1">Tarifs dégressifs, livraison dédiée, devis sous 48h.</p>
          </div>
          <Link to="/b2b" className="flex-shrink-0 bg-secondary-container text-on-secondary-container px-6 py-3 rounded-full font-bold hover:bg-secondary-fixed transition-colors whitespace-nowrap">
            Découvrir l'offre B2B →
          </Link>
        </div>
      </section>

      {/* ── 11. Newsletter ───────────────────────────────────────────────────── */}
      <section aria-label="Newsletter" className="py-24 bg-surface px-8">
        <div className="max-w-6xl mx-auto bg-primary rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-secondary-container/50 rounded-full blur-3xl pointer-events-none" aria-hidden />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" aria-hidden />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 text-white shadow-inner">
                  <Icon name="mail" size="md" />
                </span>
                <span className="text-sm font-bold uppercase tracking-widest text-on-primary/90">Newsletter</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-on-primary mb-4 leading-tight">
                Recevez nos recettes chaque semaine
              </h2>
              <p className="text-on-primary/80 text-lg leading-relaxed max-w-xl mx-auto md:mx-0">
                Astuces de cuisine, conseils nutritionnels et nouveautés RIMAMAN — directement dans votre boîte mail.
              </p>
            </div>
            <div className="w-full md:w-[26rem] flex-shrink-0 bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20 shadow-inner">
              <NewsletterForm variant="section" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 12. Blog ─────────────────────────────────────────────────────────── */}
      {(loadingPosts || posts.length > 0) && (
        <section aria-label="Derniers articles" className="py-24 bg-surface-container-low px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-2">Le blog RIMAMAN</span>
                <h2 className="text-3xl font-headline font-bold text-on-surface">Conseils &amp; Recettes</h2>
              </div>
              {!loadingPosts && (
                <Link to="/blog" className="hidden md:flex items-center gap-2 text-primary font-bold hover:underline">
                  Voir tout le blog
                  <Icon name="arrow_forward" size="md" />
                </Link>
              )}
            </div>

            {loadingPosts ? (
              <SkeletonGrid count={2} />
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.map((post) => (
                    <Link key={post.id} to={post.href} className="group bg-surface rounded-2xl overflow-hidden border border-outline-variant hover:shadow-lg transition-shadow">
                      <div className="h-48 overflow-hidden">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 text-xs text-on-surface-variant mb-3">
                          {post.date && <span>{post.date}</span>}
                          {post.date && <span aria-hidden>·</span>}
                          <span>{post.readTime} de lecture</span>
                        </div>
                        <h3 className="font-headline font-bold text-on-surface text-lg mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                        <p className="text-on-surface-variant text-sm leading-relaxed">{post.excerpt}</p>
                      </div>
                    </Link>
                  ))}
            </div>
            )}

            {!loadingPosts && (
              <div className="text-center mt-8 md:hidden">
                <Link to="/blog" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
                  Voir tout le blog <Icon name="arrow_forward" size="md" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
};
