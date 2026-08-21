import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../components/common/Icon';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useFaqItems } from '../hooks/useFaqItems';
import { useSettingsStore } from '../store/settingsStore';

const CAT_PALETTES = [
  { bg: 'bg-secondary-fixed',  text: 'text-on-secondary-fixed' },
  { bg: 'bg-primary-fixed',    text: 'text-on-primary-fixed-variant' },
  { bg: 'bg-primary',          text: 'text-on-primary' },
  { bg: 'bg-tertiary-fixed',   text: 'text-on-tertiary-fixed' },
  { bg: 'bg-secondary',        text: 'text-on-secondary' },
  { bg: 'bg-tertiary',         text: 'text-on-tertiary' },
];

export const FAQ: React.FC = () => {
  const { data: faqItems, loading, error, retry } = useFaqItems();
  const whatsappNumber = useSettingsStore((state) => state.settings.whatsappNumber);
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const allFaqs = faqItems ?? [];

  const filteredFAQs = useMemo(
    () =>
      allFaqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [allFaqs, searchQuery],
  );

  // Grouper par catégorie en respectant l'ordre sortOrder
  const groupedCategories = useMemo(() => {
    const catMap = new Map<string, typeof allFaqs>();
    const catMeta = new Map<string, (typeof allFaqs)[0]['category']>();

    for (const item of allFaqs) {
      if (!catMap.has(item.categoryId)) {
        catMap.set(item.categoryId, []);
        catMeta.set(item.categoryId, item.category);
      }
      catMap.get(item.categoryId)!.push(item);
    }

    return Array.from(catMap.entries())
      .map(([catId, items]) => ({
        cat: catMeta.get(catId)!,
        allItems: items,
        filteredItems: filteredFAQs.filter((f) => f.categoryId === catId),
      }))
      .sort((a, b) => a.cat.sortOrder - b.cat.sortOrder);
  }, [allFaqs, filteredFAQs]);

  const visibleGroups = searchQuery
    ? groupedCategories.filter((g) => g.filteredItems.length > 0)
    : groupedCategories;

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
      <Helmet>
        <title>FAQ - Questions Fréquentes | RIMAMAN</title>
        <meta
          name="description"
          content="Réponses aux questions sur les farines RIMAMAN : produit, utilisation, commande, nutrition."
        />
      </Helmet>

      <main className="pb-24">

        {/* ── Hero ── */}
        <section
          className="pt-32 pb-20 text-center px-8"
          style={{ background: 'linear-gradient(180deg, rgba(0,107,50,0.06) 0%, rgba(251,249,245,0) 100%)' }}
        >
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-primary-fixed text-on-primary-fixed-variant rounded-full">
              Centre d'Aide
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline text-on-surface mb-6 tracking-tight">
              Vos questions, nos réponses.
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Tout savoir sur l'utilisation et les bienfaits des farines RIMAMAN pour sublimer vos
              créations culinaires et préserver votre santé.
            </p>
          </div>
        </section>

        {/* ── Barre de recherche ── */}
        <section className="-mt-8 mb-16 px-8">
          <div className="max-w-2xl mx-auto bg-surface-container-lowest p-2 rounded-2xl shadow-xl shadow-primary/5 flex items-center gap-2">
            <div className="px-3 text-on-surface-variant flex-shrink-0">
              <Icon name="search" size="sm" />
            </div>
            <input
              type="text"
              placeholder="Comment préparer la farine de riz ?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 py-4 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="flex-shrink-0 p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
                aria-label="Effacer la recherche"
              >
                <Icon name="close" size="sm" />
              </button>
            )}
            <button className="flex-shrink-0 bg-primary px-6 py-3 rounded-xl text-on-primary font-bold text-sm hover:bg-primary/90 transition-colors">
              Rechercher
            </button>
          </div>
        </section>

        {/* ── Contenu principal ── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-24">
            <Icon name="cloud_off" size="xl" className="text-on-surface-variant" />
            <p className="text-on-surface-variant text-center">
              Impossible de charger la FAQ pour le moment.
            </p>
            <button
              onClick={retry}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant text-sm font-medium hover:bg-surface-container transition-colors"
            >
              <Icon name="refresh" size="sm" />
              Réessayer
            </button>
          </div>
        ) : allFaqs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <Icon name="quiz" size="xl" className="text-on-surface-variant" />
            <p className="text-on-surface-variant">Aucune question disponible pour le moment.</p>
          </div>
        ) : (
          <section className="max-w-6xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* ── Sidebar catégories ── */}
            <aside className="lg:col-span-3">
              <nav className="lg:sticky lg:top-28">
                <h3 className="font-headline font-bold text-on-surface-variant text-xs uppercase tracking-widest mb-6">
                  Catégories
                </h3>
                <ul className="space-y-1">
                  {groupedCategories.map(({ cat, allItems, filteredItems }, idx) => {
                    const palette = CAT_PALETTES[idx % CAT_PALETTES.length];
                    const active = !searchQuery || filteredItems.length > 0;
                    return (
                      <li key={cat.id}>
                        <a
                          href={`#cat-${cat.id}`}
                          className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-colors ${
                            active
                              ? 'text-on-surface-variant hover:bg-surface-container-high'
                              : 'text-on-surface-variant/30 pointer-events-none'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${palette.bg} ${palette.text}`}>
                            <Icon name={cat.icon} size="sm" />
                          </div>
                          <span className="text-sm flex-1">{cat.name}</span>
                          <span className="text-xs text-on-surface-variant/50">
                            {searchQuery ? filteredItems.length : allItems.length}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            {/* ── Accordéon groupé par catégorie ── */}
            <div className="lg:col-span-9 space-y-14">
              {visibleGroups.length === 0 ? (
                <div className="text-center py-20">
                  <Icon name="search_off" size="xl" className="text-on-surface-variant mb-4" />
                  <h3 className="text-2xl font-bold text-on-surface mb-3">Aucun résultat trouvé</h3>
                  <p className="text-on-surface-variant text-lg">
                    Essayez avec d'autres mots-clés ou{' '}
                    <a href="/contact" className="text-primary hover:underline font-medium">
                      contactez-nous directement
                    </a>
                  </p>
                </div>
              ) : (
                visibleGroups.map(({ cat, filteredItems }, idx) => {
                  const palette = CAT_PALETTES[idx % CAT_PALETTES.length];
                  return (
                    <div key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-32">
                      <div className="flex items-center gap-4 mb-8">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${palette.bg} ${palette.text}`}>
                          <Icon name={cat.icon} />
                        </div>
                        <h2 className="text-2xl font-bold font-headline text-on-surface">
                          {cat.name}
                        </h2>
                      </div>

                      <div className="space-y-3">
                        {filteredItems.map((faq) => {
                          const isOpen = openItems.has(faq.id);
                          return (
                            <div
                              key={faq.id}
                              className={`bg-surface-container-low rounded-2xl overflow-hidden border-b-2 transition-colors duration-300 ${
                                isOpen ? 'border-primary' : 'border-transparent'
                              }`}
                            >
                              <button
                                onClick={() => toggleItem(faq.id)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-surface-container transition-colors"
                                aria-expanded={isOpen}
                              >
                                <span className="font-headline font-semibold text-on-surface pr-4">
                                  {faq.question}
                                </span>
                                <Icon
                                  name="expand_more"
                                  className={`text-primary flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                />
                              </button>
                              {isOpen && (
                                <div className="px-6 pb-5 text-on-surface-variant leading-relaxed">
                                  {faq.answer}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section className="max-w-6xl mx-auto px-8 mt-24">
          <div className="bg-primary-container text-on-primary-container rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-12 md:p-20">
                <h2 className="text-4xl font-extrabold font-headline mb-6 tracking-tight">
                  Encore une question ?
                </h2>
                <p className="text-lg opacity-90 mb-10 leading-relaxed">
                  Notre équipe est à votre écoute pour vous aider à réussir tous vos plats.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-full font-bold shadow-lg hover:bg-primary/90 transition-colors"
                  >
                    <Icon name="chat" size="sm" />
                    WhatsApp
                  </a>
                  <a
                    href="/contact"
                    className="flex items-center gap-3 border-2 border-primary/30 text-on-primary-container px-8 py-4 rounded-full font-bold hover:bg-primary/10 transition-colors"
                  >
                    <Icon name="mail" size="sm" />
                    Formulaire de contact
                  </a>
                  <a
                    href={`tel:+${whatsappNumber}`}
                    className="flex items-center gap-3 border-2 border-primary/30 text-on-primary-container px-8 py-4 rounded-full font-bold hover:bg-primary/10 transition-colors"
                  >
                    <Icon name="phone" size="sm" />
                    Appeler
                  </a>
                </div>
              </div>
              <div className="hidden md:block relative min-h-72">
                <img
                  src="/famille-rimaman.jpeg"
                  alt="Équipe RIMAMAN"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-primary-container/60 to-transparent" />
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
};
