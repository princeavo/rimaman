import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAD9rx8geOJRef5QLjWW2l0oer-7bcZ50J1AMWEujZz1y4hdSXDdZKjApVhsHgIEiM_99GQgfTvMTaGEdKzGuUIqwEJFRBP0OYqB8RxPJsDPjBJMPToAxgzEvphHPvXcVyKiE-BWNcVZ0zm957syKRqqmaAPwI62u15125z70rmqyC6Gh4M2A8P5AQwzUKpon6QC6FViTdHeTdCj17n_4r6EZ70OU8T6LLdvBSuUgONZYc-cwiUNUn5Fr8EHQHipr9z5aas-cEzK4Q';

// ── Données (placeholders — à remplacer par les vraies infos) ──────────────────

const IMPACT_STATS = [
  { value: '7+', label: 'Années au service des familles béninoises' },
  { value: '40+', label: 'Agriculteurs locaux partenaires certifiés bio' },
  { value: '12', label: 'Villes couvertes au Bénin' },
  { value: '8 000+', label: 'Familles qui nous font confiance' },
];

const PROCESS_STEPS = [
  {
    icon: 'grass',
    step: '01',
    title: 'Sélection à la source',
    text: 'Nous travaillons en direct avec plus de 40 agriculteurs locaux certifiés bio. Chaque récolte est contrôlée avant d\'entrer dans notre moulin.',
  },
  {
    icon: 'settings',
    step: '02',
    title: 'Mouture artisanale',
    text: 'Mouture à basse température pour préserver les nutriments, la texture et la saveur naturelle du grain. Aucun additif, aucun agent de blanchiment.',
  },
  {
    icon: 'science',
    step: '03',
    title: 'Contrôle qualité',
    text: 'Chaque lot est analysé en laboratoire avant conditionnement : granulométrie, taux d\'humidité, absence de contaminants. Aucun compromis.',
  },
  {
    icon: 'inventory_2',
    step: '04',
    title: 'Conditionnement & traçabilité',
    text: 'Emballage hermétique numéroté et daté. Du moulin à votre table, chaque sachet est traçable jusqu\'au champ d\'origine.',
  },
];

const RSE_ITEMS = [
  {
    icon: 'groups',
    title: 'Agriculteurs locaux d\'abord',
    text: 'Prix d\'achat équitables, contrats annuels garantis, accompagnement technique. Nous investissons dans ceux qui cultivent notre matière première.',
  },
  {
    icon: 'eco',
    title: 'Bio sans compromis',
    text: 'Zéro pesticide, zéro engrais chimique. Nos pratiques agricoles partenaires sont auditées chaque saison. Conforme aux normes HACCP.',
  },
  {
    icon: 'recycling',
    title: 'Emballage responsable',
    text: 'Conditionnement minimal et hermétique. Projet de transition vers un emballage 100 % recyclable en cours pour 2025.',
  },
];

// ── Page ───────────────────────────────────────────────────────────────────────

export const About: React.FC = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RIMAMAN – Le Moulin d\'Or',
    description: 'Fabricant béninois de farines de riz et manioc 100 % bio, artisanales et sans additifs.',
    foundingDate: '2018',
    foundingLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: 'Cotonou', addressCountry: 'BJ' } },
    address: { '@type': 'PostalAddress', streetAddress: 'Zone Industrielle de Ganhi', addressLocality: 'Cotonou', addressCountry: 'BJ' },
    email: 'contact@moulindor.bj',
    telephone: '+22997000000',
    url: 'https://rimaman.bj',
    sameAs: ['https://facebook.com/rimaman', 'https://instagram.com/rimaman'],
  };

  return (
    <>
      <Helmet>
        <title>À Propos | RIMAMAN - Le Moulin d'Or</title>
        <meta
          name="description"
          content="Découvrez l'histoire, la mission et les valeurs de RIMAMAN, le Moulin d'Or. De la terre béninoise à votre table, une farine 100 % bio et artisanale."
        />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* ── 1. Hero ────────────────────────────────────────────────────────── */}
      <section aria-label="En-tête À Propos" className="relative h-[680px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover"
            src={HERO_IMG}
            alt="Farine artisanale sur table en bois"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-on-surface/65 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
          <span className="text-secondary-container font-bold tracking-widest uppercase text-sm mb-4 block">
            L'Héritage du Moulin d'Or
          </span>
          <h1 className="text-white font-headline font-extrabold text-5xl md:text-7xl leading-tight max-w-3xl">
            Notre Histoire &amp; Nos Valeurs
          </h1>
          <p className="text-white/80 text-lg md:text-xl mt-6 max-w-xl leading-relaxed">
            De la terre béninoise à votre table, découvrez le voyage d'une farine d'exception
            conçue pour la santé et le plaisir des sens.
          </p>
        </div>
      </section>

      {/* ── 2. Mission statement ───────────────────────────────────────────── */}
      <section aria-label="Notre mission" className="bg-primary py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-on-primary text-2xl md:text-3xl font-headline font-bold leading-snug">
            "Notre mission : que chaque famille béninoise retrouve le goût authentique de sa
            cuisine, grâce à une farine saine, pure et produite ici."
          </p>
          <p className="text-white/60 text-sm mt-4 font-medium uppercase tracking-widest">
            Rachida AGOSSOU — Fondatrice, Le Moulin d'Or
          </p>
        </div>
      </section>

      {/* ── 3. Fondatrice ──────────────────────────────────────────────────── */}
      <section aria-label="La fondatrice" className="py-24 px-8 bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Photo */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <img
                className="w-full h-full object-cover"
                src="/famille-rimaman.jpeg"
                alt="Rachida AGOSSOU, fondatrice du Moulin d'Or RIMAMAN"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-secondary-container p-6 rounded-2xl shadow-xl max-w-[220px]">
              <p className="font-headline font-bold text-on-secondary-container text-lg leading-tight">
                Fondé en 2018 à Cotonou, Bénin
              </p>
            </div>
          </div>

          {/* Texte */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 text-primary">
              <span className="h-px w-12 bg-primary block" />
              <span className="font-bold tracking-tighter uppercase text-xs">La fondatrice</span>
            </div>
            <h2 className="text-4xl font-headline font-bold text-on-surface leading-tight">
              Une vision née d'une frustration de cuisinière
            </h2>
            <div className="space-y-5 text-on-surface-variant leading-relaxed text-lg">
              <p>
                Rachida AGOSSOU préparait le fufu pour sa famille chaque semaine. Un jour, elle ne
                trouve plus de farine de qualité constante dans les marchés de Cotonou — les textures
                varient, les goûts déçoivent, les origines sont opaques.
              </p>
              <p>
                De cette frustration naît une conviction : le Bénin a les ressources pour produire la
                meilleure farine de riz et de manioc du monde. Il manque juste quelqu'un qui s'y
                consacre vraiment. En 2018, elle fonde{' '}
                <strong className="text-on-surface">Le Moulin d'Or</strong> et lance la marque{' '}
                <strong className="text-on-surface">RIMAMAN</strong>.
              </p>
              <p>
                Aujourd'hui, l'entreprise travaille avec plus de 40 agriculteurs locaux certifiés
                bio et livre dans 12 villes béninoises.
              </p>
            </div>

            {/* Certification badge */}
            <div className="flex items-center gap-4 p-5 bg-surface-container-low rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-3xl text-secondary flex-shrink-0">eco</span>
              <div>
                <h4 className="font-bold text-on-surface">Certification 100 % Bio</h4>
                <p className="text-sm text-on-surface-variant">
                  Conforme aux normes HACCP. Fiche technique disponible sur demande.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Chiffres d'impact ───────────────────────────────────────────── */}
      <section aria-label="Notre impact" className="bg-surface-container-low py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-headline font-bold text-on-surface">RIMAMAN en chiffres</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {IMPACT_STATS.map((s) => (
              <div
                key={s.value}
                className="bg-surface rounded-2xl p-6 border border-outline-variant text-center"
              >
                <p className="text-4xl font-black font-headline text-primary mb-2">{s.value}</p>
                <p className="text-sm text-on-surface-variant leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Processus de fabrication ────────────────────────────────────── */}
      <section aria-label="Notre processus de fabrication" className="bg-surface py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">
              Transparence totale
            </span>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface mb-4">
              Du champ à votre table
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              Chaque étape de notre processus est conçue pour préserver la qualité et la pureté du
              grain. Rien n'est laissé au hasard.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS_STEPS.map((s, i) => (
              <div key={s.step} className="relative">
                {/* Connecteur entre étapes */}
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-outline-variant z-0 -translate-x-4" />
                )}
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-on-primary-container text-2xl">
                        {s.icon}
                      </span>
                    </div>
                    <span className="text-3xl font-black font-headline text-outline-variant">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-on-surface text-lg mb-3">{s.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. CTA intermédiaire ───────────────────────────────────────────── */}
      <section className="bg-surface-container-low py-14 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-on-surface-variant text-lg mb-6">
            Convaincus par notre démarche ? Découvrez le résultat dans votre assiette.
          </p>
          <RouterLink
            to="/nos-farines"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            Découvrir nos farines
          </RouterLink>
        </div>
      </section>

      {/* ── 7. Les Piliers (valeurs) ───────────────────────────────────────── */}
      <section aria-label="Nos valeurs" className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface">
              Les Piliers de RIMAMAN
            </h2>
            <p className="text-on-surface-variant mt-4">Ce qui nous définit, grain après grain.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 bg-surface-container-low p-10 rounded-3xl border border-outline-variant hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-primary text-5xl mb-6 block">
                verified_user
              </span>
              <h3 className="text-2xl font-headline font-bold mb-4 text-on-surface">
                Qualité Irréprochable
              </h3>
              <p className="text-on-surface-variant">
                Nous sélectionnons chaque grain manuellement. Notre processus de mouture à basse
                température préserve l'intégrité moléculaire du produit pour une texture fine et une
                panification parfaite.
              </p>
            </div>

            <div className="bg-primary text-on-primary p-10 rounded-3xl flex flex-col justify-between">
              <span className="material-symbols-outlined text-4xl mb-6 block">favorite</span>
              <div>
                <h3 className="text-xl font-headline font-bold mb-2">Santé &amp; Bien-être</h3>
                <p className="text-sm opacity-90">
                  Des farines digestes, riches en fibres et minéraux, pensées pour l'équilibre de
                  toute la famille.
                </p>
              </div>
            </div>

            <div className="bg-secondary text-on-secondary p-10 rounded-3xl flex flex-col justify-between">
              <span className="material-symbols-outlined text-4xl mb-6 block">location_on</span>
              <div>
                <h3 className="text-xl font-headline font-bold mb-2">Authenticité Béninoise</h3>
                <p className="text-sm opacity-90">
                  Une célébration de nos racines, valorisant le travail des petits producteurs locaux
                  de notre pays.
                </p>
              </div>
            </div>

            <div className="md:col-span-4 bg-tertiary-container text-white p-10 rounded-3xl flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <span className="material-symbols-outlined text-5xl mb-4 block">nature</span>
                <h3 className="text-3xl font-headline font-bold mb-4">
                  100% Naturel, Sans Compromis
                </h3>
                <p className="opacity-90">
                  Pas de blanchiment chimique, pas de conservateurs. Juste la force de la nature dans
                  un emballage doré protecteur.
                </p>
              </div>
              <div className="md:w-1/2 h-48 rounded-2xl overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  alt="Farine RIMAMAN — 100% naturelle"
                  src="/rimaman.jpeg"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Engagements RSE ─────────────────────────────────────────────── */}
      <section aria-label="Nos engagements" className="bg-surface-container-low py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">
              Responsabilité
            </span>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface mb-4">
              Nos engagements
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              Être une bonne entreprise, c'est aussi prendre soin des personnes et des terres qui
              rendent notre travail possible.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {RSE_ITEMS.map((item) => (
              <div
                key={item.title}
                className="bg-surface rounded-2xl p-8 border border-outline-variant"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-primary text-2xl">{item.icon}</span>
                </div>
                <h3 className="font-headline font-bold text-on-surface text-xl mb-3">{item.title}</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Localisation ────────────────────────────────────────────────── */}
      <section aria-label="Nous trouver" className="bg-surface py-24 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 text-primary">
              <span className="h-px w-12 bg-primary block" />
              <span className="font-bold tracking-tighter uppercase text-xs">Où nous trouver</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface leading-tight">
              Ancrés à Cotonou, rayonnant sur tout le Bénin
            </h2>
            <p className="text-on-surface-variant leading-relaxed text-lg">
              Notre moulin est basé dans la Zone Industrielle de Ganhi à Cotonou. Nos farines sont
              distribuées dans 12 villes béninoises et disponibles à la commande directe.
            </p>
            <div className="space-y-4">
              {[
                { icon: 'location_on', label: 'Zone Industrielle de Ganhi, Cotonou, Bénin' },
                { icon: 'mail', label: 'contact@moulindor.bj' },
                { icon: 'phone', label: '+229 97 00 00 00' },
                { icon: 'schedule', label: 'Lun–Ven : 8h–17h · Sam : 8h–13h' },
              ].map((item) => (
                <div key={item.icon} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center flex-shrink-0 border border-outline-variant">
                    <span className="material-symbols-outlined text-primary text-xl">{item.icon}</span>
                  </div>
                  <p className="text-on-surface-variant">{item.label}</p>
                </div>
              ))}
            </div>
            <RouterLink
              to="/contact"
              className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
            >
              Nous envoyer un message
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </RouterLink>
          </div>

          {/* Placeholder carte / photo moulin */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-container-low border border-outline-variant flex items-center justify-center">
            <img
              src="/famille-rimaman.jpeg"
              alt="L'équipe RIMAMAN devant le Moulin d'Or"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-white font-headline font-bold text-lg">
                L'équipe du Moulin d'Or
              </p>
              <p className="text-white/70 text-sm">Cotonou, Bénin — 2024</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. CTA final ──────────────────────────────────────────────────── */}
      <section aria-label="Appel à l'action" className="bg-primary py-24 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-white font-headline font-bold text-4xl mb-6">
            Goûtez la différence de l'excellence béninoise
          </h2>
          <p className="text-white/80 mb-10 text-lg leading-relaxed">
            Nos farines sont disponibles pour les particuliers et les professionnels de la
            gastronomie. Commandez directement ou trouvez un revendeur près de chez vous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <RouterLink
              to="/nos-farines"
              className="bg-secondary-container text-on-secondary-container px-10 py-4 rounded-full font-bold text-lg hover:bg-secondary-fixed transition-colors"
            >
              Explorer nos produits
            </RouterLink>
            <RouterLink
              to="/contact"
              className="bg-white/10 border border-white/30 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-colors"
            >
              Nous contacter
            </RouterLink>
          </div>
        </div>
      </section>
    </>
  );
};
