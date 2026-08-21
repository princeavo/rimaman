import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Icon } from '../components/common/Icon';

// ── Static editorial content ─────────────────────────────────────────────────
// This page is a brand-level statement, not a product data sheet.
// Per-product nutritional values live on each product's detail page (/nos-farines/:slug).

const COMMITMENTS = [
  {
    icon: 'do_not_disturb_on',
    title: 'Sans gluten naturellement',
    description:
      'Riz et manioc sont exempts de gluten par nature. Aucune contamination croisée dans notre atelier de production.',
  },
  {
    icon: 'spa',
    title: 'Zéro additif',
    description:
      'Pas de conservateurs, pas de colorants, pas d\'agents de texture. Ce que vous lisez sur l\'emballage est tout ce qu\'il y a.',
  },
  {
    icon: 'location_on',
    title: 'Origine 100 % locale',
    description:
      'Riz et manioc cultivés et transformés au Bénin. Du champ au sachet, sans détour ni intermédiaire étranger.',
  },
  {
    icon: 'verified',
    title: 'Transparence totale',
    description:
      'Nous affichons ce que nous savons et précisons ce qui est encore à confirmer par analyse de laboratoire.',
  },
];

const DIET_BADGES: Array<{
  icon: string;
  label: string;
  status: 'yes' | 'caution';
  note?: string;
}> = [
  { icon: 'do_not_disturb_on',   label: 'Sans gluten',  status: 'yes' },
  { icon: 'eco',                  label: 'Végétarien',   status: 'yes' },
  { icon: 'energy_savings_leaf',  label: 'Végan',        status: 'yes' },
  { icon: 'no_drinks',            label: 'Sans lactose', status: 'yes' },
  { icon: 'monitor_heart',        label: 'IG élevé',     status: 'caution', note: 'IG ≈ 68–72' },
];

const FAQ_ITEMS = [
  {
    q: 'Vos farines sont-elles certifiées sans gluten ?',
    a: 'Nos farines sont fabriquées à partir de riz et de manioc, deux ingrédients naturellement exempts de gluten. Une certification officielle est en cours d\'obtention. En attendant, elles conviennent aux personnes intolérantes. Pour les cas de maladie cœliaque sévère, consultez votre médecin.',
  },
  {
    q: 'Peut-on les utiliser dans un régime diabétique ?',
    a: 'Le riz blanc et le manioc ont un indice glycémique élevé (IG ≈ 72 et 65 respectivement). Notre farine n\'est pas recommandée en grande quantité pour les personnes diabétiques ou insulino-résistantes. Consultez votre nutritionniste avant de l\'intégrer à un régime thérapeutique.',
  },
  {
    q: 'Quels allergènes sont présents ?',
    a: 'Nos farines ne contiennent aucun des 14 allergènes majeurs définis par la réglementation alimentaire (gluten, lait, œufs, arachides, fruits à coque, soja, poisson, crustacés, mollusques, céleri, moutarde, sésame, lupin, dioxyde de soufre). Elles sont fabriquées dans un atelier dédié ne traitant pas ces allergènes.',
  },
  {
    q: 'Les valeurs nutritionnelles affichées sont-elles fiables ?',
    a: 'Les valeurs présentes sur chaque fiche produit sont des estimations basées sur la composition connue du riz décortiqué et du manioc séché. Elles constituent une bonne référence indicative. Des analyses officielles en laboratoire accrédité sont en cours pour les confirmer.',
  },
  {
    q: 'Combien de temps conserver la farine après ouverture ?',
    a: 'Après ouverture, refermez le sachet hermétiquement et conservez-le dans un endroit frais et sec, à l\'abri de la lumière et de l\'humidité. Consommez dans les 3 mois. La durée de conservation complète figure sur chaque emballage.',
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export const Nutrition: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <>
      <Helmet>
        <title>Nutrition & Transparence | RIMAMAN</title>
        <meta
          name="description"
          content="Composition, allergènes, compatibilité alimentaire et questions fréquentes sur les farines RIMAMAN. Deux ingrédients. Rien d'autre."
        />
        <meta property="og:title" content="Nutrition & Transparence | RIMAMAN" />
        <meta property="og:description" content="Deux ingrédients. Rien d'autre. Tout ce qu'il y a dans les farines RIMAMAN : composition, allergènes et compatibilité alimentaire." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/rimaman.jpeg" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
          })),
        })}</script>
      </Helmet>

      {/* ── Hero ── */}
      <header className="pt-28 pb-16 px-6 max-w-4xl mx-auto text-center">
        <span className="inline-block py-1 px-4 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-5">
          Nutrition & Transparence
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-on-surface leading-tight mb-6 font-headline">
          Deux ingrédients.<br />
          <span className="text-primary">Rien d'autre.</span>
        </h1>
        <p className="text-lg text-on-surface-variant max-w-xl mx-auto leading-relaxed">
          Riz décortiqué béninois et manioc séché béninois. C'est la totalité de ce qu'il y a dans
          nos farines. Pas de liste d'ingrédients à déchiffrer.
        </p>
      </header>

      <main className="px-6 max-w-5xl mx-auto pb-24 space-y-20">

        {/* ── Ingrédients ── */}
        <section>
          <div className="rounded-3xl border-2 border-on-surface bg-surface-container-lowest overflow-hidden">
            {/* Header */}
            <div className="bg-inverse-surface px-8 py-5">
              <p className="text-sm font-semibold uppercase tracking-widest text-inverse-on-surface/60 mb-1">
                Liste des ingrédients
              </p>
              <p className="text-2xl font-black text-inverse-on-surface font-headline">
                Riz décortiqué, Manioc séché.
              </p>
            </div>

            {/* Composition visuelle */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-primary/10 rounded-2xl p-6 text-center">
                  <p className="text-5xl font-black text-primary font-headline mb-1">60%</p>
                  <p className="text-sm font-semibold text-on-surface">Riz décortiqué</p>
                  <p className="text-xs text-on-surface-variant mt-1">origine Bénin</p>
                </div>
                <div className="bg-surface-container rounded-2xl p-6 text-center">
                  <p className="text-5xl font-black text-on-surface font-headline mb-1">40%</p>
                  <p className="text-sm font-semibold text-on-surface">Manioc séché</p>
                  <p className="text-xs text-on-surface-variant mt-1">origine Bénin</p>
                </div>
              </div>

              {/* Barre de proportion */}
              <div className="flex rounded-full overflow-hidden h-3 mb-4">
                <div className="bg-primary w-[60%]" />
                <div className="bg-surface-container-highest w-[40%]" />
              </div>

              <p className="text-xs text-on-surface-variant text-center">
                Même recette pour tous les formats (500 g, 1 kg, 2 kg, 5 kg)
              </p>
            </div>
          </div>

          {/* Note fiches produits */}
          <div className="mt-4 flex items-start gap-3 bg-primary/5 rounded-2xl px-5 py-4 border border-primary/15">
            <Icon name="info" className="text-primary mt-0.5 flex-shrink-0" size="sm" />
            <p className="text-sm text-on-surface-variant">
              Les valeurs nutritionnelles détaillées (calories, glucides, protéines...) figurent sur
              la fiche de chaque produit.{' '}
              <Link to="/nos-farines" className="text-primary font-medium hover:underline">
                Voir nos produits →
              </Link>
            </p>
          </div>
        </section>

        {/* ── Nos engagements ── */}
        <section>
          <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">
            Nos engagements
          </h2>
          <p className="text-on-surface-variant text-sm mb-8">
            Ce que nous nous engageons à garantir sur chaque sachet.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COMMITMENTS.map((c) => (
              <div
                key={c.title}
                className="flex gap-4 bg-surface-container-low rounded-2xl p-5 border border-outline-variant"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name={c.icon} className="text-primary" size="md" />
                </div>
                <div>
                  <p className="font-semibold text-on-surface mb-1">{c.title}</p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Compatibilité alimentaire ── */}
        <section>
          <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">
            Compatibilité alimentaire
          </h2>
          <p className="text-on-surface-variant text-sm mb-8">
            Valable pour l'ensemble de la gamme RIMAMAN.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {DIET_BADGES.map(({ icon, label, status, note }) => {
              const isYes     = status === 'yes';
              const isCaution = status === 'caution';
              return (
                <div
                  key={label}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center ${
                    isYes
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-surface-container border-outline-variant'
                  }`}
                >
                  <Icon
                    name={isCaution ? 'info' : icon}
                    size="md"
                    className={isYes ? 'text-primary' : 'text-on-surface-variant'}
                  />
                  <span className={`text-xs font-semibold leading-tight ${
                    isYes ? 'text-primary' : 'text-on-surface-variant'
                  }`}>
                    {label}
                  </span>
                  {note && (
                    <span className="text-[10px] text-on-surface-variant">{note}</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Allergènes ── */}
        <section className="bg-tertiary-container/50 border border-tertiary/30 rounded-2xl p-6 flex gap-4">
          <Icon name="verified_user" className="text-tertiary flex-shrink-0 mt-0.5" size="md" />
          <div>
            <p className="font-semibold text-on-tertiary-container mb-1">Allergènes</p>
            <p className="text-sm text-on-tertiary-container/80 leading-relaxed">
              Aucun des 14 allergènes majeurs n'est présent dans notre gamme. Nos farines sont
              fabriquées dans un atelier dédié ne traitant pas d'allergènes. Pour toute sensibilité
              spécifique, consultez l'étiquette de l'emballage.
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section>
          <h2 className="text-2xl font-bold font-headline text-on-surface mb-8">
            Questions fréquentes
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.q}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === item.q ? null : item.q)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-surface-container/50 transition-colors"
                  aria-expanded={openFaq === item.q}
                >
                  <span className="font-medium text-on-surface">{item.q}</span>
                  <Icon
                    name={openFaq === item.q ? 'expand_less' : 'expand_more'}
                    className="text-on-surface-variant flex-shrink-0"
                  />
                </button>
                {openFaq === item.q && (
                  <div className="px-6 pb-5 pt-4 text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-primary/75 rounded-3xl p-10 md:p-14 text-center">
          <div className="max-w-xl mx-auto">
            <Icon name="shopping_bag" size="xl" className="text-on-primary mb-5" />
            <h2 className="text-2xl md:text-3xl font-bold text-on-primary font-headline mb-3">
              Convaincu·e ?
            </h2>
            <p className="text-on-primary/80 mb-8">
              Commandez nos farines en ligne ou retrouvez-les dans un point de vente près de chez vous.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/nos-farines"
                className="inline-flex items-center gap-2 bg-on-primary text-primary px-8 py-3.5 rounded-full font-semibold hover:bg-on-primary/90 transition-colors"
              >
                Voir nos produits
                <Icon name="arrow_forward" size="sm" />
              </Link>
              <Link
                to="/ou-acheter"
                className="inline-flex items-center gap-2 border-2 border-on-primary text-on-primary px-8 py-3.5 rounded-full font-semibold hover:bg-on-primary/10 transition-colors"
              >
                Trouver un point de vente
              </Link>
            </div>
          </div>
        </section>

      </main>
    </>
  );
};
