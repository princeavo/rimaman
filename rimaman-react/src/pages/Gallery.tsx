import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../components/common/Icon';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Lightbox } from '../components/features/Lightbox';
import type { LightboxItem } from '../components/features/Lightbox';
import { useGalleryItems } from '../hooks/useGalleryItems';

const ALL = 'Tout';

export const Gallery: React.FC = () => {
  const { data: items, loading, error, retry } = useGalleryItems();
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    if (!items) return [];
    return [ALL, ...Array.from(new Set(items.map((i) => i.category.name))).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    return activeCategory === ALL ? items : items.filter((i) => i.category.name === activeCategory);
  }, [items, activeCategory]);

  const lightboxItems = useMemo<LightboxItem[]>(
    () =>
      filtered.map((item) => ({
        type: item.media.mimeType.startsWith('video/') ? 'video' : 'image',
        url: item.media.url,
        alt: item.media.alt || item.category.name,
      })),
    [filtered],
  );

  return (
    <>
      <Helmet>
        <title>Galerie | RIMAMAN - Moulin d'Or</title>
        <meta
          name="description"
          content="Découvrez en images et en vidéo l'univers RIMAMAN : nos produits, notre production et notre communauté."
        />
      </Helmet>

      <main className="pb-24">

        {/* ── Hero ── */}
        <section
          className="pt-32 pb-16 text-center px-8"
          style={{ background: 'linear-gradient(180deg, rgba(0,107,50,0.06) 0%, rgba(251,249,245,0) 100%)' }}
        >
          <div className="max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-primary-fixed text-on-primary-fixed-variant rounded-full">
              <Icon name="photo_library" size="sm" />
              Notre univers en images
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline text-on-surface mb-6 tracking-tight">
              Galerie RIMAMAN
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Produits, production, équipe — cliquez sur une photo pour l'agrandir.
            </p>
          </div>
        </section>

        {/* ── Filtres catégories ── */}
        {!loading && !error && categories.length > 1 && (
          <section className="max-w-7xl mx-auto px-8 mb-10">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                    activeCategory === cat
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Contenu ── */}
        <section className="max-w-7xl mx-auto px-8">
          {loading ? (
            <div className="flex justify-center py-24">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 py-24">
              <Icon name="cloud_off" size="xl" className="text-on-surface-variant" />
              <p className="text-on-surface-variant text-center">
                Impossible de charger la galerie pour le moment.
              </p>
              <button
                onClick={retry}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant text-sm font-medium hover:bg-surface-container transition-colors"
              >
                <Icon name="refresh" size="sm" />
                Réessayer
              </button>
            </div>
          ) : items!.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <Icon name="photo_library" size="xl" className="text-on-surface-variant" />
              <p className="text-on-surface-variant">La galerie est vide pour le moment.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <Icon name="filter_list_off" size="xl" className="text-on-surface-variant" />
              <p className="text-on-surface-variant">Aucune photo dans cette catégorie.</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {filtered.map((item, index) => {
                const isVideo = item.media.mimeType.startsWith('video/');
                const thumb = item.media.thumbnailUrl ?? item.media.url;
                const alt = item.media.alt || item.category.name;
                return (
                  <button
                    key={item.id}
                    onClick={() => setOpenIndex(index)}
                    className="group relative w-full mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-outline-variant/50 text-left block"
                    aria-label={`Agrandir : ${alt}`}
                  >
                    {isVideo ? (
                      <>
                        <video
                          src={item.media.url}
                          preload="metadata"
                          muted
                          className="w-full transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                            <Icon name="play_arrow" size="lg" className="text-primary" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={thumb}
                        alt={alt}
                        loading="lazy"
                        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                        <div>
                          <span className="inline-block px-3 py-1 bg-primary text-on-primary text-xs font-bold rounded-full mb-1">
                            {item.category.name}
                          </span>
                          {alt && alt !== item.category.name && (
                            <p className="text-white text-sm font-medium line-clamp-2">{alt}</p>
                          )}
                        </div>
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <Icon name="zoom_in" size="sm" className="text-white" />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {openIndex !== null && (
        <Lightbox
          items={lightboxItems}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </>
  );
};
