import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// ── Données (placeholders — à remplacer par les vraies données) ────────────────

const QUICK_STATS = [
  { value: '8 000+', label: 'familles' },
  { value: '100 %', label: 'bio & naturel' },
  { value: '12', label: 'villes au Bénin' },
  { value: '7 ans', label: "d'expertise" },
];

const BENEFITS = [
  { icon: 'bolt', title: 'Énergie Durable', text: 'Riche en glucides complexes pour vous accompagner tout au long de la journée sans fatigue.' },
  { icon: 'pill', title: 'Vitamines B', text: 'Essentielles pour votre métabolisme et le bon fonctionnement de votre système nerveux.' },
  { icon: 'ecg_heart', title: 'Minéraux', text: 'Une source naturelle de Potassium et Magnésium pour votre équilibre quotidien.' },
  { icon: 'bakery_dining', title: 'Texture Tendre', text: 'Une pâte exceptionnellement tendre, souple et agréable à manger, à chaque préparation.' },
];

const RECIPES = [
  { title: 'Fufu Traditionnel', time: '15 min', level: 'Facile', desc: 'La recette classique du fufu à base de farine RIMAMAN — tendre, moelleux, authentique.' },
  { title: 'Beignets Croustillants', time: '20 min', level: 'Facile', desc: 'Des beignets dorés et croustillants à l\'extérieur, fondants à l\'intérieur. Parfaits au petit-déjeuner.' },
  { title: 'Bouillie Onctueuse', time: '10 min', level: 'Très facile', desc: 'Une bouillie crémeuse et nourrissante, idéale pour les enfants et les matins pressés.' },
];

const TESTIMONIALS = [
  { quote: "Depuis que j'utilise la farine RIMAMAN, mes enfants finissent tous leurs plats. La texture est incroyable, on sent vraiment la différence.", author: 'Maman Ablawa', city: 'Cotonou', initials: 'MA', stars: 5 },
  { quote: "Le fufu d'igname préparé avec RIMAMAN a exactement le goût de celui de mon enfance. C'est pratique, rapide et délicieux.", author: 'Koffi D.', city: 'Porto-Novo', initials: 'KD', stars: 5 },
  { quote: "Je commande en gros pour mon restaurant depuis 6 mois. La constance de la qualité lot après lot, c'est ce qui me fidélise.", author: 'Chef Sylvestre', city: 'Cotonou', initials: 'CS', stars: 5 },
  { quote: "Ma fille de 2 ans adore la bouillie que je prépare avec cette farine. Je suis rassurée car c'est 100 % naturel et sans additifs.", author: 'Aminata S.', city: 'Parakou', initials: 'AS', stars: 5 },
];

const DISTRIBUTION = [
  { city: 'Cotonou', points: ['Supermarché Erevan', 'Score Supermarché', 'Géant de Cotonou', 'Marché Dantokpa'] },
  { city: 'Porto-Novo', points: ['Marché Ouando', 'Superette du Centre', 'Bazar Central'] },
  { city: 'Parakou', points: ['Grand Marché de Parakou', 'Supermarché Afrique'] },
  { city: 'Autres villes', points: ['Abomey', 'Lokossa', 'Bohicon', 'Natitingou', 'Ouidah', 'Kandi'] },
];

const BLOG_POSTS = [
  { title: 'Comment préparer le fufu parfait en 15 minutes', excerpt: 'Nos conseils pas-à-pas pour réussir un fufu tendre et sans grumeaux, même si vous débutez.', date: '5 juillet 2025', readTime: '3 min' },
  { title: 'Les 5 bienfaits nutritionnels de la farine de manioc', excerpt: 'Fibres, potassium, glucides complexes — pourquoi la farine de manioc bio est un allié pour votre santé.', date: '28 juin 2025', readTime: '4 min' },
];

const FAQ = [
  { q: 'Comment utiliser la farine RIMAMAN ?', a: "Mélangez 200 g de farine avec 400 ml d'eau froide. Portez à ébullition en remuant constamment pendant 10-15 minutes. Formez des boules et servez avec votre sauce préférée. C'est tout." },
  { q: 'La farine RIMAMAN convient-elle aux enfants ?', a: "Oui. Elle est 100 % naturelle, sans additifs, sans colorants, sans conservateurs. Certifiée HACCP. Parfaite pour la bouillie des bébés dès 6 mois et pour toute la famille." },
  { q: 'Combien de temps se conserve-t-elle ?', a: "12 mois dans un endroit sec, à l'abri de la lumière et de l'humidité. La DLUO est imprimée sur chaque emballage. Après ouverture, conservez dans un récipient hermétique." },
];

// ── Composant étoiles ──────────────────────────────────────────────────────────

const Stars: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: count }, (_, i) => (
      <span
        key={i}
        className="material-symbols-outlined text-secondary text-lg"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        star
      </span>
    ))}
  </div>
);

// ── Page ───────────────────────────────────────────────────────────────────────

export const Home: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "RIMAMAN – Le Moulin d'Or",
    description: 'Fabricant béninois de farines de riz et manioc 100 % bio, artisanales et sans additifs.',
    url: 'https://rimaman.bj',
    logo: '/logo.png',
    foundingDate: '2018',
    address: { '@type': 'PostalAddress', streetAddress: 'Zone Industrielle de Ganhi', addressLocality: 'Cotonou', addressCountry: 'BJ' },
    telephone: '+22997000000',
    email: 'contact@moulindor.bj',
    sameAs: ['https://facebook.com/rimaman', 'https://instagram.com/rimaman'],
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <>
      <Helmet>
        <title>RIMAMAN – Farine de Riz & Manioc 100 % Bio du Bénin</title>
        <meta
          name="description"
          content="La farine de riz et manioc 100 % bio du Bénin. Pour un fufu parfait en 15 minutes, naturellement délicieux. Livraison dans 12 villes béninoises."
        />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <section
        aria-label="Bienvenue chez RIMAMAN"
        className="relative min-h-[100svh] flex items-center overflow-hidden"
      >
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
              100 % Bio &amp; Artisanal — Made in Bénin
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white font-headline leading-tight mb-6">
              La farine de riz &amp; manioc bio du Bénin —{' '}
              <span className="text-secondary-container">
                pour un fufu parfait en 15 minutes.
              </span>
            </h1>
            <p className="text-xl text-white/85 font-medium mb-10 leading-relaxed border-l-4 border-primary-fixed pl-6">
              Naturelle, sans additifs, produite au cœur du Bénin. RIMAMAN, c'est le goût
              authentique de votre cuisine, chaque jour.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/nos-farines"
                className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-secondary-fixed transition-all duration-300"
              >
                Commander maintenant
              </Link>
              <Link
                to="/recettes"
                className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300"
              >
                Voir les recettes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Barre de preuve sociale rapide ───────────────────────────────── */}
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

      {/* ── 3. Pourquoi RIMAMAN ──────────────────────────────────────────────── */}
      <section aria-label="Pourquoi choisir RIMAMAN" className="py-24 px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black text-primary font-headline mb-4">
                Pourquoi choisir RIMAMAN ?
              </h2>
              <p className="text-on-surface-variant text-lg">
                Le secret de notre qualité réside dans le respect des traditions et la sélection
                rigoureuse de nos grains.
              </p>
            </div>
            <div className="h-px flex-grow bg-surface-container-high ml-8 hidden md:block" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="p-8 rounded-3xl bg-surface-container-low hover:bg-surface-container-highest transition-colors duration-500 group"
              >
                <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center mb-6 text-on-primary-container group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">{b.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 font-headline text-primary">{b.title}</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Recettes vedettes ─────────────────────────────────────────────── */}
      <section aria-label="Recettes avec RIMAMAN" className="py-24 px-8 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">
              Inspiration cuisine
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-headline text-on-surface mb-4">
              Que faire avec la farine RIMAMAN ?
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              De la bouillie du matin au fufu du dimanche — nos recettes vous montrent à quel point
              cuisiner sainement peut être simple.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {RECIPES.map((r) => (
              <div
                key={r.title}
                className="bg-surface rounded-2xl overflow-hidden shadow-sm group hover:shadow-lg transition-all duration-300"
              >
                <div className="h-48 bg-surface-container-highest relative overflow-hidden">
                  <img
                    src="/rimaman.jpeg"
                    alt={r.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full">
                    {r.level}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-3">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {r.time}
                  </div>
                  <h3 className="font-headline font-bold text-on-surface text-lg mb-2">{r.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              to="/recettes"
              className="inline-flex items-center gap-2 text-primary font-bold hover:underline text-lg"
            >
              Voir toutes les recettes
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. Produit vedette ───────────────────────────────────────────────── */}
      <section aria-label="Notre produit phare" className="py-24 bg-surface relative overflow-hidden px-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-on-surface font-headline mb-4">
              Nos Incontournables
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              Une farine, plusieurs formats — pour s'adapter à chaque cuisine et chaque budget.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="flex flex-col lg:flex-row bg-surface-container-low rounded-[2.5rem] overflow-hidden shadow-sm group hover:shadow-xl transition-all duration-500 max-w-4xl w-full border border-outline-variant">
              <div className="lg:w-1/2 relative overflow-hidden">
                <img
                  className="w-full h-full object-cover min-h-64 transition-transform duration-700 group-hover:scale-105"
                  alt="Farine RIMAMAN de Riz et Manioc"
                  src="/rimaman.jpeg"
                  loading="lazy"
                />
                <div className="absolute top-6 left-6 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-tighter">
                  Bestseller
                </div>
              </div>
              <div className="lg:w-1/2 p-10 flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl font-extrabold text-primary font-headline mb-3">
                    Farine de Riz &amp; Manioc
                  </h3>
                  <p className="text-on-surface-variant mb-6 leading-relaxed">
                    Une farine bien fine pour une pâte tendre au goût authentique. Sans gluten
                    naturellement, sans additifs, 100 % bio.
                  </p>

                  {/* Formats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { format: '500 g', price: '600 FCFA' },
                      { format: '1 kg', price: '1 000 FCFA', highlight: true },
                      { format: '5 kg', price: '4 500 FCFA' },
                      { format: '25 kg', price: 'Sur devis' },
                    ].map((f) => (
                      <div
                        key={f.format}
                        className={`p-3 rounded-xl border text-center ${
                          f.highlight
                            ? 'border-primary bg-primary/5'
                            : 'border-outline-variant bg-surface'
                        }`}
                      >
                        <p className={`font-bold text-sm ${f.highlight ? 'text-primary' : 'text-on-surface'}`}>
                          {f.format}
                        </p>
                        <p className="text-on-surface-variant text-xs">{f.price}</p>
                        {f.highlight && (
                          <p className="text-primary text-xs font-bold mt-0.5">≈ 167 FCFA/pers.</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-6">
                    <span className="material-symbols-outlined text-secondary text-lg">group</span>
                    1 kg rassasie au moins{' '}
                    <strong className="text-primary">6 personnes</strong>
                  </div>
                </div>

                <Link
                  to="/nos-farines"
                  className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold text-center hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">add_shopping_cart</span>
                  Commander
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Bandeau disponibilité ─────────────────────────────────────────── */}
      <section aria-label="Disponibilité" className="py-10 bg-primary px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-white font-headline">
              En vente partout au Bénin
            </h3>
            <p className="text-white/70 font-medium mt-1">
              Supermarchés, marchés, épiceries — ou en commande directe.
            </p>
          </div>
          <Link
            to="/ou-acheter"
            className="flex items-center gap-3 bg-white/10 border border-white/20 text-white px-8 py-4 rounded-2xl hover:bg-white/20 transition-colors duration-300 font-bold"
          >
            <span className="material-symbols-outlined text-secondary-container text-2xl">
              location_on
            </span>
            Trouver un point de vente
          </Link>
        </div>
      </section>

      {/* ── 7. Témoignages ───────────────────────────────────────────────────── */}
      <section aria-label="Avis clients" className="py-24 bg-surface-container-low px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Stars count={5} />
              <span className="text-2xl font-black font-headline text-on-surface">4,9 / 5</span>
              <span className="text-on-surface-variant text-sm">(1 240 avis)</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-primary font-headline">
              Ce que disent nos familles béninoises
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="bg-surface p-8 rounded-3xl shadow-sm border border-outline-variant">
                <Stars count={t.stars} />
                <p className="text-on-surface-variant italic my-5 leading-relaxed">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center font-bold text-on-primary-container text-sm flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm">{t.author}</p>
                    <p className="text-xs text-on-surface-variant">{t.city}, Bénin</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Photo famille + badge */}
          <div className="relative max-w-xl mx-auto">
            <div className="rounded-[2rem] overflow-hidden">
              <img
                className="w-full h-64 object-cover object-top"
                alt="Famille RIMAMAN — clients satisfaits"
                src="/famille-rimaman.jpeg"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-secondary-container px-8 py-4 rounded-2xl shadow-xl whitespace-nowrap">
              <p className="font-bold text-on-secondary-container text-center">
                ⭐ Adopté par plus de 8 000 familles
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Où acheter ────────────────────────────────────────────────────── */}
      <section aria-label="Points de vente" className="py-24 bg-surface px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">
              Distribution
            </span>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface mb-4">
              Où trouver nos farines ?
            </h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">
              Disponibles dans les principales villes du Bénin — en supermarchés, marchés et
              épiceries de quartier.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {DISTRIBUTION.map((d) => (
              <div key={d.city} className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <h3 className="font-headline font-bold text-on-surface">{d.city}</h3>
                </div>
                <ul className="space-y-2">
                  {d.points.map((p) => (
                    <li key={p} className="text-sm text-on-surface-variant flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">check</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              to="/ou-acheter"
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined">map</span>
              Voir la carte complète
            </Link>
          </div>
        </div>
      </section>

      {/* ── 9. Mini-FAQ ──────────────────────────────────────────────────────── */}
      <section aria-label="Questions fréquentes" className="py-24 bg-surface-container-low px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold text-on-surface">
              Vos questions, nos réponses
            </h2>
          </div>
          <div className="space-y-4">
            {FAQ.map((f) => (
              <div key={f.q} className="bg-surface rounded-2xl p-6 border border-outline-variant">
                <h3 className="font-bold text-on-surface mb-2 flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary flex-shrink-0 mt-0.5">help</span>
                  {f.q}
                </h3>
                <p className="text-on-surface-variant leading-relaxed text-sm pl-9">{f.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
            >
              Voir toutes les questions
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 10. Teaser B2B ───────────────────────────────────────────────────── */}
      <section aria-label="Offre professionnelle" className="py-10 bg-on-surface px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">
              Restaurateurs · Hôteliers · Revendeurs
            </p>
            <h3 className="text-xl font-headline font-bold text-white">
              Vous êtes professionnel ? Nous avons une offre dédiée.
            </h3>
            <p className="text-white/60 text-sm mt-1">
              Tarifs dégressifs, livraison dédiée, devis sous 48h.
            </p>
          </div>
          <Link
            to="/b2b"
            className="flex-shrink-0 bg-secondary-container text-on-secondary-container px-6 py-3 rounded-full font-bold hover:bg-secondary-fixed transition-colors whitespace-nowrap"
          >
            Découvrir l'offre B2B →
          </Link>
        </div>
      </section>

      {/* ── 11. Newsletter ───────────────────────────────────────────────────── */}
      <section aria-label="Newsletter" className="py-24 bg-surface px-8">
        <div className="max-w-2xl mx-auto text-center">
          <span className="material-symbols-outlined text-4xl text-primary mb-4 block">mail</span>
          <h2 className="text-3xl font-headline font-bold text-on-surface mb-4">
            Recevez nos recettes chaque semaine
          </h2>
          <p className="text-on-surface-variant mb-8 leading-relaxed">
            Conseils de cuisine, nouvelles recettes, offres exclusives — directement dans votre
            boîte mail. Pas de spam, désinscription en un clic.
          </p>
          {subscribed ? (
            <div className="flex items-center justify-center gap-3 bg-primary/10 text-primary border border-primary/20 px-6 py-4 rounded-2xl font-bold">
              <span className="material-symbols-outlined">check_circle</span>
              Merci ! Vous recevrez notre prochaine recette très bientôt.
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="flex-1 px-5 py-4 rounded-full border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
              <button
                type="submit"
                className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                S'abonner gratuitement
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── 12. Blog preview ─────────────────────────────────────────────────── */}
      <section aria-label="Derniers articles" className="py-24 bg-surface-container-low px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-2">
                Le blog RIMAMAN
              </span>
              <h2 className="text-3xl font-headline font-bold text-on-surface">
                Conseils &amp; Recettes
              </h2>
            </div>
            <Link
              to="/blog"
              className="hidden md:flex items-center gap-2 text-primary font-bold hover:underline"
            >
              Voir tout le blog
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.title}
                to="/blog"
                className="group bg-surface rounded-2xl overflow-hidden border border-outline-variant hover:shadow-lg transition-shadow"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src="/rimaman.jpeg"
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant mb-3">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime} de lecture</span>
                  </div>
                  <h3 className="font-headline font-bold text-on-surface text-lg mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8 md:hidden">
            <Link to="/blog" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
              Voir tout le blog
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
