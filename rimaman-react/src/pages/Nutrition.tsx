import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import {
  GAMME_NUTRITION,
  HEALTH_BENEFITS,
  NUTRITION_FAQ,
  type ProductNutrition,
} from '../constants/nutritionData';

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number | null, unit = '', decimals = 1): string =>
  v === null ? '—' : `${v.toFixed(decimals)} ${unit}`.trim();

const DIET_LABELS: Array<{
  key: keyof ProductNutrition['diet'];
  label: string;
  icon: string;
}> = [
  { key: 'glutenFree', label: 'Sans gluten', icon: 'do_not_disturb_on' },
  { key: 'vegetarian', label: 'Végétarien', icon: 'eco' },
  { key: 'vegan', label: 'Végan', icon: 'energy_savings_leaf' },
  { key: 'lactoseFree', label: 'Sans lactose', icon: 'no_drinks' },
  { key: 'diabeticFriendly', label: 'IG à confirmer', icon: 'monitor_heart' },
];

// ── Sub-components ────────────────────────────────────────────────────────────


const NutritionRow: React.FC<{
  label: string;
  value: string;
  sub?: boolean;
  bold?: boolean;
}> = ({ label, value, sub, bold }) => (
  <div
    className={`flex justify-between items-center py-2 border-b border-outline-variant/50 last:border-0 ${
      sub ? 'pl-5' : ''
    }`}
  >
    <span
      className={`text-sm ${bold ? 'font-semibold text-on-surface' : sub ? 'text-on-surface-variant' : 'text-on-surface'}`}
    >
      {sub && <span className="mr-1 text-on-surface-variant">—</span>}
      {label}
    </span>
    <span
      className={`text-sm font-mono tabular-nums ${
        value === '—'
          ? 'text-on-surface-variant/50 italic'
          : bold
            ? 'font-bold text-on-surface'
            : 'text-on-surface'
      }`}
    >
      {value}
    </span>
  </div>
);

const DietBadge: React.FC<{
  label: string;
  icon: string;
  value: boolean | null;
}> = ({ label, icon, value }) => {
  const isTrue = value === true;
  const isPending = value === null;
  return (
    <div
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center ${
        isPending
          ? 'bg-surface-container border-outline-variant text-on-surface-variant'
          : isTrue
            ? 'bg-primary/5 border-primary/20 text-primary'
            : 'bg-error/5 border-error/20 text-error'
      }`}
    >
      <Icon name={isTrue ? icon : isPending ? 'help_outline' : 'cancel'} size="md"
        className={isPending ? 'text-on-surface-variant' : isTrue ? 'text-primary' : 'text-error'}
      />
      <span className="text-xs font-medium leading-tight">{label}</span>
      {isPending && <span className="text-[10px] text-on-surface-variant">À confirmer</span>}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

export const Nutrition: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { facts, diet } = GAMME_NUTRITION;

  return (
    <>
      <Helmet>
        <title>Nutrition & Santé | RIMAMAN - Les Farines du Moulin d'Or</title>
        <meta
          name="description"
          content="Informations nutritionnelles complètes sur les farines RIMAMAN : valeurs nutritives, ingrédients, allergènes, compatibilité alimentaire."
        />
      </Helmet>

      {/* ── Hero ── */}
      <header className="pt-28 pb-12 px-8 max-w-7xl mx-auto text-center">
        <span className="inline-block py-1 px-4 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-4">
          Nutrition & Santé
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-on-surface leading-tight mb-6 font-headline">
          Ce qu'il y a dans nos farines
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
          Transparence totale sur la composition, les valeurs nutritionnelles et la compatibilité
          avec vos régimes alimentaires.
        </p>
      </header>

      <main className="px-8 max-w-7xl mx-auto pb-24 space-y-16">

        {/* ── Fiche nutritionnelle ── */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Tableau nutritionnel */}
          <div className="lg:col-span-3 bg-white rounded-2xl border-2 border-on-surface p-6">
            <div className="border-b-8 border-on-surface pb-2 mb-3">
              <h2 className="text-2xl font-black text-on-surface font-headline">Valeurs nutritionnelles</h2>
              <p className="text-sm text-on-surface-variant">Pour 100 g de produit</p>
            </div>

            <div>
              <NutritionRow label="Énergie"
                value={`${fmt(facts.per100g.energy_kcal, 'kcal', 0)} / ${fmt(facts.per100g.energy_kj, 'kJ', 0)}`}
                bold />
              <NutritionRow label="Protéines" value={fmt(facts.per100g.protein_g, 'g')} bold />
              <NutritionRow label="Glucides" value={fmt(facts.per100g.carbs_g, 'g')} bold />
              <NutritionRow label="dont sucres" value={fmt(facts.per100g.sugars_g, 'g')} sub />
              <NutritionRow label="Lipides" value={fmt(facts.per100g.fat_g, 'g')} bold />
              <NutritionRow label="dont acides gras saturés" value={fmt(facts.per100g.saturated_fat_g, 'g')} sub />
              <NutritionRow label="Fibres alimentaires" value={fmt(facts.per100g.fiber_g, 'g')} bold />
              <NutritionRow label="Sel" value={fmt(facts.per100g.salt_g, 'g')} bold />
              <div className="mt-3 pt-3 border-t border-outline-variant">
                <p className="text-xs text-on-surface-variant mb-2 font-medium uppercase tracking-wide">Minéraux</p>
                <NutritionRow label="Fer" value={fmt(facts.per100g.iron_mg, 'mg')} />
                <NutritionRow label="Calcium" value={fmt(facts.per100g.calcium_mg, 'mg')} />
                <NutritionRow label="Potassium" value={fmt(facts.per100g.potassium_mg, 'mg')} />
              </div>
            </div>

            <p className="text-xs text-on-surface-variant mt-4 pt-4 border-t border-outline-variant">
              * Les valeurs affichées sont des moyennes. Les teneurs réelles peuvent varier selon le lot de production.
            </p>
          </div>

          {/* Infos complémentaires */}
          <div className="lg:col-span-2 space-y-5">

            {/* Ingrédients */}
            <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-5">
              <h3 className="font-bold text-on-surface font-headline mb-3 flex items-center gap-2">
                <Icon name="list_alt" className="text-primary" size="md" />
                Ingrédients
              </h3>
              <p className="text-sm text-on-surface leading-relaxed">{GAMME_NUTRITION.ingredients}</p>
            </div>

            {/* Allergènes */}
            <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-5">
              <h3 className="font-bold text-on-surface font-headline mb-3 flex items-center gap-2">
                <Icon name="warning" className="text-amber-500" size="md" />
                Allergènes
              </h3>
              {GAMME_NUTRITION.allergens.length === 0 ? (
                <p className="text-sm text-on-surface">
                  Aucun des 14 allergènes majeurs n'est présent dans ce produit.
                </p>
              ) : (
                <ul className="space-y-1">
                  {GAMME_NUTRITION.allergens.map((a) => (
                    <li key={a} className="text-sm text-error flex items-center gap-2">
                      <Icon name="error" size="sm" className="text-error" />
                      {a}
                    </li>
                  ))}
                </ul>
              )}
              {GAMME_NUTRITION.traces.length > 0 && (
                <div className="mt-3 pt-3 border-t border-outline-variant">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Peut contenir des traces de :</p>
                  <p className="text-xs text-on-surface-variant">{GAMME_NUTRITION.traces.join(', ')}</p>
                </div>
              )}
            </div>

            {/* Conservation */}
            <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-5">
              <h3 className="font-bold text-on-surface font-headline mb-3 flex items-center gap-2">
                <Icon name="inventory_2" className="text-primary" size="md" />
                Conservation
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-3">{GAMME_NUTRITION.storageInfo}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 border border-outline-variant text-center">
                  <p className="text-2xl font-black text-primary font-headline">
                    {GAMME_NUTRITION.shelfLifeClosedMonths ?? '—'}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">mois (fermé)</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-outline-variant text-center">
                  <p className="text-2xl font-black text-primary font-headline">
                    {GAMME_NUTRITION.shelfLifeOpenedDays ?? '—'}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">jours (ouvert)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Compatibilité régimes ── */}
        <section>
          <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">
            Compatibilité alimentaire
          </h2>
          <p className="text-on-surface-variant mb-6 text-sm">Valable pour l'ensemble de la gamme RIMAMAN.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {DIET_LABELS.map(({ key, label, icon }) => (
              <DietBadge key={key} label={label} icon={icon} value={diet[key]} />
            ))}
          </div>
        </section>

        {/* ── Bienfaits ── */}
        <section>
          <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">
            Bienfaits pour la santé
          </h2>
          <p className="text-on-surface-variant mb-8 text-sm max-w-2xl">
            Ces informations sont basées sur la composition connue de nos ingrédients. Elles ne constituent pas un avis médical.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {HEALTH_BENEFITS.map((b, i) => (
              <div key={i} className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon name={b.icon} className="text-primary" size="md" />
                </div>
                <h3 className="font-bold text-on-surface font-headline mb-2">{b.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Points clés produit sélectionné ── */}
        <section className="bg-surface-container-low rounded-2xl border border-outline-variant p-8">
          <h2 className="text-xl font-bold font-headline text-on-surface mb-6 flex items-center gap-2">
            <Icon name="verified" className="text-primary" />
            Ce qu'on sait sur la {GAMME_NUTRITION.productName}
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GAMME_NUTRITION.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <Icon name="check_circle" size="sm" className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-on-surface">{b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── FAQ Nutrition ── */}
        <section>
          <h2 className="text-2xl font-bold font-headline text-on-surface mb-8">
            Questions fréquentes
          </h2>
          <div className="space-y-3">
            {NUTRITION_FAQ.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-surface-container/50 transition-colors"
                >
                  <span className="font-medium text-on-surface">{item.question}</span>
                  <Icon
                    name={openFaq === i ? 'expand_less' : 'expand_more'}
                    className="text-on-surface-variant flex-shrink-0"
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant pt-4">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-primary/75 rounded-2xl p-10 md:p-14 text-center">
          <div className="max-w-2xl mx-auto">
            <Icon name="shopping_bag" size="xl" className="text-on-primary mb-5" />
            <h2 className="text-2xl md:text-3xl font-bold text-on-primary font-headline mb-4">
              Prêt à essayer ?
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
