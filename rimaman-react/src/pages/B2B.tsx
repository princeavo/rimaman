import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// ── Données ────────────────────────────────────────────────────────────────────

const KEY_STATS = [
  { value: '100 % Bio', label: 'Certifié, sans pesticides ni additifs chimiques' },
  { value: 'Sans Gluten', label: 'Naturellement adapté aux régimes spéciaux' },
  { value: '< 48 h', label: 'Délai de réponse garanti à votre demande de devis' },
  { value: 'Made in Bénin', label: 'Cultivé, transformé et conditionné localement' },
];

const TARGETS = [
  {
    icon: 'restaurant',
    title: 'Restauration',
    text: 'Restaurants, maquis, cantines, food trucks. Une farine constante pour des préparations reproductibles et une cuisine de qualité au quotidien.',
  },
  {
    icon: 'hotel',
    title: 'Hôtellerie & Événementiel',
    text: "Hôtels, lodges, traiteurs, cuisines d'événements. Des volumes adaptés à vos plannings, avec la régularité que vos clients attendent.",
  },
  {
    icon: 'storefront',
    title: 'Distribution & Revente',
    text: 'Supermarchés, épiceries, distributeurs, exportateurs. Conditionnements disponibles en marque propre pour les commandes supérieures à 500 kg.',
  },
];

const PACKAGINGS = [
  { value: 'Sachet 500 g', label: "Buffets, hôtels, vente à l'unité en épicerie" },
  { value: 'Sac 5 kg', label: 'Petite restauration et test produit avant montée en volume' },
  { value: 'Sac 25 kg', label: 'Cuisine professionnelle — format standard recommandé' },
  { value: 'Sac 50 kg', label: 'Grand volume, optimisé pour la logistique et le stockage' },
];

const STEPS = [
  { value: '① Demande', label: 'Remplissez le formulaire de contact avec vos besoins : produit, volume estimé et fréquence de commande.' },
  { value: '② Devis', label: 'Notre équipe vous envoie une offre personnalisée et détaillée sous 48 heures ouvrables.' },
  { value: '③ Confirmation', label: 'Vous validez le bon de commande et procédez au paiement ou à la signature du contrat.' },
  { value: '④ Livraison', label: 'Réception à Cotonou ou enlèvement directement au moulin RIMAMAN selon votre préférence.' },
];

const QUALITY = [
  {
    icon: 'qr_code_scanner',
    title: 'Traçabilité complète',
    text: "Chaque lot est identifié et tracé de la matière première jusqu'au produit fini. Vous savez exactement d'où vient la farine que vous servez à vos clients.",
  },
  {
    icon: 'verified',
    title: 'Constance lot après lot',
    text: 'Notre process de transformation garantit une granulométrie, une texture et un goût identiques à chaque commande. Vos recettes ne varient pas, votre réputation non plus.',
  },
  {
    icon: 'workspace_premium',
    title: 'Certification & Conformité',
    text: "Produit fabriqué selon les normes HACCP. Fiche technique et certificat d'analyse disponibles sur demande pour vos dossiers réglementaires et vos audits.",
  },
];

const FAQ_COL1 = [
  {
    q: 'Y a-t-il un minimum de commande ?',
    a: 'Oui, la commande minimum est de 25 kg par produit. En dessous de ce seuil, nous vous orientons vers notre boutique en ligne.',
  },
  {
    q: 'Quelle est la durée de conservation ?',
    a: "Nos farines se conservent 12 mois dans un endroit sec, à l'abri de la lumière et de l'humidité. La DLUO est imprimée sur chaque emballage.",
  },
  {
    q: 'Livrez-vous en dehors de Cotonou ?',
    a: "Oui, nous livrons sur tout le territoire béninois. Pour les commandes à l'international, contactez-nous pour un devis transport spécifique.",
  },
];

const FAQ_COL2 = [
  {
    q: 'Proposez-vous le marquage à la marque (private label) ?',
    a: 'Oui, pour les commandes supérieures à 500 kg nous pouvons conditionner la farine avec votre propre étiquetage. Un délai de production supplémentaire est à prévoir.',
  },
  {
    q: 'Puis-je avoir un échantillon avant de commander ?',
    a: 'Absolument. Envoyez-nous une demande via le formulaire de contact. Nous expédions gratuitement un kit de découverte de nos principales références.',
  },
  {
    q: 'Quels modes de paiement acceptez-vous ?',
    a: 'Virement bancaire, Mobile Money (MTN, Moov) et chèque pour les partenaires établis. Un acompte de 50 % est demandé à la confirmation de commande.',
  },
];

// ── Composants locaux ──────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="text-center mb-12">
    <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-on-surface mb-4">
      {title}
    </h2>
    {subtitle && (
      <p className="text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed">{subtitle}</p>
    )}
  </div>
);

const StatCard: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="bg-surface rounded-2xl p-6 border border-outline-variant text-center">
    <p className="text-2xl md:text-3xl font-bold font-headline text-primary mb-2">{value}</p>
    <p className="text-sm text-on-surface-variant leading-snug">{label}</p>
  </div>
);

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => (
  <div className="space-y-2">
    <h3 className="font-bold text-on-surface">{q}</h3>
    <p className="text-on-surface-variant leading-relaxed text-sm">{a}</p>
  </div>
);

// ── Page ───────────────────────────────────────────────────────────────────────

export const B2B: React.FC = () => (
  <>
    <Helmet>
      <title>Espace Professionnel B2B | RIMAMAN</title>
      <meta
        name="description"
        content="Restaurateurs, hôtels, revendeurs : commandez la farine bio RIMAMAN en volume. Tarifs dégressifs, devis sous 48h, livraison à Cotonou."
      />
    </Helmet>

    {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
    <section className="bg-primary py-36 px-8">
      <div className="max-w-3xl mx-auto text-center">
        <span className="inline-block px-4 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-bold uppercase tracking-widest mb-6">
          Offre Professionnelle
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold font-headline text-on-primary leading-tight mb-8">
          RIMAMAN pour les Professionnels
        </h1>
        <p className="text-white/80 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
          Farine de riz et manioc 100 % bio, produite au Bénin. Des offres sur-mesure pour les
          restaurateurs, hôteliers, traiteurs, boulangeries et revendeurs qui exigent qualité et
          régularité.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/contact"
            className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-secondary-fixed transition-all duration-300"
          >
            Demander un devis
          </Link>
          <Link
            to="/nos-farines"
            className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300"
          >
            Voir nos produits
          </Link>
        </div>
      </div>
    </section>

    {/* ── 2. Chiffres clés ─────────────────────────────────────────────────── */}
    <section className="bg-surface-container-low py-16 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {KEY_STATS.map((s) => (
          <StatCard key={s.value} value={s.value} label={s.label} />
        ))}
      </div>
    </section>

    {/* ── 3. Pour qui ──────────────────────────────────────────────────────── */}
    <section className="bg-surface py-20 px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="À qui s'adresse l'offre B2B ?"
          subtitle="Nous travaillons avec toute structure ayant des besoins réguliers en farine de qualité. Notre offre s'adapte à votre volume, votre rythme et vos contraintes."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TARGETS.map((t) => (
            <div
              key={t.title}
              className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-primary text-2xl">{t.icon}</span>
              </div>
              <h3 className="text-xl font-bold font-headline text-on-surface mb-3">{t.title}</h3>
              <p className="text-on-surface-variant leading-relaxed">{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── 4. Produits disponibles ──────────────────────────────────────────── */}
    <section className="bg-surface-container-low py-20 px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Nos produits disponibles en volume"
          subtitle="Toute notre gamme est disponible en commande B2B. Les formats et conditionnements s'adaptent à votre besoin."
        />
        <div className="text-center">
          <Link
            to="/nos-farines"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">inventory_2</span>
            Consulter la gamme complète
          </Link>
        </div>
      </div>
    </section>

    {/* ── 5. Conditionnements ──────────────────────────────────────────────── */}
    <section className="bg-surface py-20 px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Conditionnements disponibles"
          subtitle="Nous adaptons le format à vos besoins de stockage et de production. Plusieurs options disponibles dès la première commande."
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {PACKAGINGS.map((p) => (
            <StatCard key={p.value} value={p.value} label={p.label} />
          ))}
        </div>
      </div>
    </section>

    {/* ── 6. Tarifs ────────────────────────────────────────────────────────── */}
    <section className="bg-surface-container-low py-20 px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Des tarifs pensés pour vos volumes"
          subtitle="Plus vous commandez, meilleur est votre prix unitaire. Nos paliers de remise s'appliquent dès la première commande confirmée."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-surface rounded-2xl p-8 border border-outline-variant space-y-4">
            <h3 className="text-xl font-bold font-headline text-on-surface">Paliers de volume</h3>
            {[
              { range: '25 à 99 kg', desc: 'Tarif professionnel de base, applicable sans engagement.' },
              { range: '100 à 499 kg', desc: 'Remise supplémentaire négociée à la commande.' },
              { range: '500 kg et plus', desc: 'Offre grand compte avec conditions préférentielles, priorité de stock et livraison dédiée.' },
            ].map((tier) => (
              <div
                key={tier.range}
                className="flex gap-4 items-start py-3 border-b border-outline-variant last:border-0"
              >
                <span className="material-symbols-outlined text-primary mt-0.5 flex-shrink-0">
                  check_circle
                </span>
                <div>
                  <p className="font-bold text-on-surface">{tier.range}</p>
                  <p className="text-sm text-on-surface-variant">{tier.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-surface rounded-2xl p-8 border border-outline-variant space-y-4">
            <h3 className="text-xl font-bold font-headline text-on-surface">
              Contrats d'approvisionnement
            </h3>
            <p className="text-on-surface-variant leading-relaxed">
              Les partenaires s'engageant sur un calendrier régulier (mensuel ou trimestriel)
              bénéficient d'un prix bloqué sur la durée du contrat, d'une priorité d'allocation en
              cas de forte demande et d'une livraison garantie à date.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              Contactez-nous pour établir ensemble un programme d'approvisionnement adapté à votre
              activité et votre saisonnalité.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
            >
              Discutons de votre projet
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* ── 7. Comment ça marche ─────────────────────────────────────────────── */}
    <section className="bg-surface py-20 px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Comment passer une commande B2B ?"
          subtitle="Un processus simple en 4 étapes, de la demande initiale à la réception de votre commande."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {STEPS.map((s) => (
            <div
              key={s.value}
              className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant text-center"
            >
              <p className="text-2xl font-bold font-headline text-primary mb-3">{s.value}</p>
              <p className="text-sm text-on-surface-variant leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── 8. Engagements qualité ───────────────────────────────────────────── */}
    <section className="bg-surface-container-low py-20 px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Nos engagements qualité"
          subtitle="Ce que vous commandez la première fois est exactement ce que vous recevrez à chaque livraison."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {QUALITY.map((q) => (
            <div key={q.title} className="bg-surface rounded-2xl p-8 border border-outline-variant">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-primary text-2xl">{q.icon}</span>
              </div>
              <h3 className="text-xl font-bold font-headline text-on-surface mb-3">{q.title}</h3>
              <p className="text-on-surface-variant leading-relaxed text-sm">{q.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── 9. FAQ ───────────────────────────────────────────────────────────── */}
    <section className="bg-surface py-20 px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="Questions fréquentes" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
          <div className="space-y-8">
            {FAQ_COL1.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
          <div className="space-y-8">
            {FAQ_COL2.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ── 10. CTA final ────────────────────────────────────────────────────── */}
    <section className="bg-primary py-20 px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-on-primary mb-6">
          Prêt à passer à l'échelle ?
        </h2>
        <p className="text-white/80 text-lg mb-10 leading-relaxed">
          Envoyez-nous votre demande aujourd'hui et recevez un devis personnalisé sous 48 heures.
          Notre équipe est disponible pour répondre à toutes vos questions.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-secondary-fixed transition-all duration-300"
        >
          Demander un devis
          <span className="material-symbols-outlined">send</span>
        </Link>
      </div>
    </section>
  </>
);
