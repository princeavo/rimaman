import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../components/common/Icon';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ShareButtons } from '../components/common/ShareButtons';
import { ReactionBar } from '../components/common/ReactionBar';
import { CommentSection } from '../components/common/CommentSection';
import { ReadingProgress } from '../components/common/ReadingProgress';
import { TableOfContents, extractHeadings } from '../components/blog/TableOfContents';
import { fetchBlogComments, createBlogComment } from '../api/blogComments';
import { tiptapToSafeHtml } from '../components/page-builder/tiptap-to-html';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchBlogPostBySlugRaw, fetchBlogPostsRaw, richTextToPlainText, estimateReadTime } from '../api/blog';
import { articleJsonLd } from '../utils/schema';



export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: post, loading, error } = useAsyncData(
    () => fetchBlogPostBySlugRaw(slug ?? ''),
    [slug],
  );
  const { data: allPosts } = useAsyncData(fetchBlogPostsRaw, []);

  // All hooks must run before early returns
  const sortedPosts = useMemo(() => {
    return [...(allPosts ?? [])].sort((a, b) => {
      const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return db - da;
    });
  }, [allPosts]);

  const rawContent = post?.content as unknown as Record<string, unknown> | undefined;
  const html = useMemo(() => (rawContent ? tiptapToSafeHtml(rawContent) : ''), [rawContent]);
  const headings = useMemo(() => (rawContent ? extractHeadings(rawContent) : []), [rawContent]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center">
          <Icon name="article" size="xl" className="text-on-surface-variant mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-on-surface mb-2">Article introuvable</h2>
          <p className="text-on-surface-variant mb-6">Cet article n'existe pas ou a été supprimé.</p>
          <Button variant="primary" onClick={() => navigate('/blog')}>Voir tous les articles</Button>
        </div>
      </div>
    );
  }


  const readTime = estimateReadTime(richTextToPlainText(post.content));

  const currentIndex = sortedPosts.findIndex((p) => p.id === post.id);
  const prevPost = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;

  const relatedPosts = (allPosts ?? [])
    .filter((p) => p.id !== post.id && p.categoryId === post.categoryId)
    .slice(0, 3);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const jsonLd = articleJsonLd(post, pageUrl);

  return (
    <>
      <Helmet>
        <title>{post.title} | Blog RIMAMAN</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${post.title} | Blog RIMAMAN`} />
        <meta property="og:description" content={post.excerpt} />
        {post.image && <meta property="og:image" content={post.image.url} />}
        <meta property="og:url" content={pageUrl} />
        {post.publishedAt && <meta property="article:published_time" content={post.publishedAt} />}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <ReadingProgress />

      <main className="pt-32 pb-24">
        <article className="max-w-4xl mx-auto px-8">

          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-on-surface-variant">
            <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
            <Icon name="chevron_right" size="sm" />
            <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <Icon name="chevron_right" size="sm" />
            <span className="text-on-surface font-semibold line-clamp-1">{post.title}</span>
          </nav>

          {/* Category */}
          <div className="mb-4">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
              {post.category.name}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-6">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-6 text-on-surface-variant mb-8 pb-8 border-b border-outline-variant">
            {post.publishedAt && (
              <div className="flex items-center gap-2">
                <Icon name="calendar_today" size="sm" />
                <span>{new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Icon name="schedule" size="sm" />
              <span>{readTime} de lecture</span>
            </div>
          </div>

          {/* Cover image */}
          {post.image && (
            <div className="relative h-96 rounded-2xl overflow-hidden mb-10 bg-surface-container">
              <img src={post.image.url} alt={post.image.alt || post.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Excerpt */}
          <p className="text-xl text-on-surface-variant leading-relaxed mb-8">{post.excerpt}</p>

          {/* Table of Contents */}
          <TableOfContents headings={headings} />

          {/* Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-headline prose-headings:text-on-surface prose-p:text-on-surface prose-a:text-primary prose-strong:text-on-surface prose-blockquote:border-primary prose-img:rounded-2xl prose-table:border-collapse mb-12"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* Reactions */}
          <div className="mb-8">
            <ReactionBar type="article" targetId={post.id} />
          </div>

          {/* Social sharing */}
          <div className="mb-12">
            <ShareButtons url={pageUrl} title={`${post.title} | Blog RIMAMAN`} />
          </div>

          {/* Comments */}
          <CommentSection
            targetId={post.id}
            fetchComments={fetchBlogComments as (id: string) => Promise<any>}
            postComment={createBlogComment as (id: string, data: any) => Promise<unknown>}
          />

          {/* Prev / Next navigation */}
          {(prevPost || nextPost) && (
            <nav className="grid grid-cols-2 gap-4 mb-12">
              <div>
                {prevPost && (
                  <Link
                    to={`/blog/${prevPost.slug}`}
                    className="group flex flex-col gap-1 p-4 rounded-2xl border border-outline-variant hover:border-primary hover:bg-surface-container transition-colors"
                  >
                    <span className="flex items-center gap-1 text-xs text-on-surface-variant font-medium">
                      <Icon name="arrow_back" size="sm" />
                      Article précédent
                    </span>
                    <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                      {prevPost.title}
                    </span>
                  </Link>
                )}
              </div>
              <div className="flex justify-end">
                {nextPost && (
                  <Link
                    to={`/blog/${nextPost.slug}`}
                    className="group flex flex-col gap-1 p-4 rounded-2xl border border-outline-variant hover:border-primary hover:bg-surface-container transition-colors text-right w-full"
                  >
                    <span className="flex items-center justify-end gap-1 text-xs text-on-surface-variant font-medium">
                      Article suivant
                      <Icon name="arrow_forward" size="sm" />
                    </span>
                    <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                      {nextPost.title}
                    </span>
                  </Link>
                )}
              </div>
            </nav>
          )}

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <div>
              <h3 className="text-2xl font-headline font-bold text-on-surface mb-6">Articles similaires</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.id}
                    to={`/blog/${related.slug}`}
                    className="group bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
                  >
                    <div className="relative h-48 overflow-hidden bg-surface-container">
                      {related.image ? (
                        <img
                          src={related.image.url}
                          alt={related.image.alt || related.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon name="article" size="xl" className="text-on-surface-variant/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-on-surface mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {related.title}
                      </h4>
                      <p className="text-sm text-on-surface-variant line-clamp-2">{related.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
    </>
  );
};
