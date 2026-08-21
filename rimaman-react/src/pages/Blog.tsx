import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useBlogPosts } from '../hooks/useBlogPosts';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchBlogCategories } from '../api/blog';

export const Blog: React.FC = () => {
  const { data: posts, loading, error, retry } = useBlogPosts();
  const { data: categories } = useAsyncData(fetchBlogCategories, []);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const allPosts = useMemo(() => posts ?? [], [posts]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesCategory = selectedCategory === null || post.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [allPosts, selectedCategory, searchQuery]);

  return (
    <>
      <Helmet>
        <title>Blog & Actualités | RIMAMAN - Moulin d'Or</title>
        <meta name="description" content="Conseils de préparation et informations sur nos farines 100% Bio du Bénin." />
      </Helmet>

      <main className="pt-28 pb-24 max-w-7xl mx-auto px-6 md:px-12">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <Icon name="article" size="sm" />
            Le blog RIMAMAN
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-bold text-on-surface mb-4">
            Blog &amp; conseils
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl">
            Nutrition et astuces de préparation pour profiter au mieux de votre farine RIMAMAN.
          </p>
        </header>

        {/* Search */}
        <div className="relative max-w-xl mb-8">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size="sm" />
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface-container-low border-2 border-transparent focus:border-primary focus:outline-none text-on-surface placeholder:text-on-surface-variant text-sm"
          />
        </div>

        {/* Category filters */}
        <section className="mb-10">
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Tout voir
            </button>
            {(categories ?? []).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.name
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-24">
            <Icon name="cloud_off" size="xl" className="text-on-surface-variant" />
            <p className="text-on-surface-variant text-center">
              Impossible de charger les articles pour le moment.
            </p>
            <button
              onClick={retry}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant text-sm font-medium hover:bg-surface-container transition-colors"
            >
              <Icon name="refresh" size="sm" />
              Réessayer
            </button>
          </div>
        ) : allPosts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <Icon name="article" size="xl" className="text-on-surface-variant" />
            <p className="text-on-surface-variant">Aucun article publié pour le moment.</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <Icon name="filter_list_off" size="xl" className="text-on-surface-variant" />
            <p className="text-on-surface-variant">Aucun article ne correspond à votre recherche.</p>
            <button
              onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant text-sm font-medium hover:bg-surface-container transition-colors mt-2"
            >
              <Icon name="refresh" size="sm" />
              Réinitialiser
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group flex flex-col hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="relative overflow-hidden rounded-2xl aspect-[16/10] mb-4 border border-outline-variant bg-surface-container">
                  {post.image ? (
                    <img
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={post.image}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="article" size="xl" className="text-on-surface-variant/30" />
                    </div>
                  )}
                  <span className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-semibold text-primary shadow-sm">
                    {post.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-2 text-xs text-on-surface-variant">
                  <Icon name="calendar_today" size="sm" />
                  {post.date ? (
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </time>
                  ) : (
                    <span>Non publié</span>
                  )}
                  <span>&middot;</span>
                  <span>{post.readTime} de lecture</span>
                </div>
                <h2 className="text-xl font-headline font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-on-surface-variant text-sm leading-relaxed flex-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-1 text-primary font-semibold text-sm mt-4">
                  <span>Lire l'article</span>
                  <Icon name="arrow_forward" size="sm" className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
};
