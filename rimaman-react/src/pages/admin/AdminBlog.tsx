import { toast } from '../../store/toastStore';
import { showConfirm } from '../../store/confirmStore';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../../components/common/Icon';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Combobox } from '../../components/common/Combobox';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useSlugCheck } from '../../hooks/useSlugCheck';
import {
  fetchAllBlogForAdmin,
  fetchBlogCategories,
  createBlogPost,
  createBlogCategory,
  updateBlogPost,
  deleteBlogPost,
  type BlogPostInput,
} from '../../api/blog';
import type { BackendBlogPost } from '../../api/backend-types';
import type { Media } from '../../api/media';

const EMPTY_DOC = { type: 'doc', content: [{ type: 'paragraph' }] };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type FormState = Omit<BlogPostInput, 'content'> & {
  content: Record<string, unknown>;
  imageUrl: string;
};

const EMPTY: FormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: EMPTY_DOC,
  categoryId: '',
  publishedAt: new Date().toISOString().slice(0, 10),
  imageId: undefined,
  imageUrl: '',
};

type View = 'list' | 'editor';

export const AdminBlog: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [catRefreshKey, setCatRefreshKey] = useState(0);

  const { data: posts, loading, error } = useAsyncData(fetchAllBlogForAdmin, [refreshKey]);
  const { data: categories } = useAsyncData(fetchBlogCategories, [catRefreshKey]);

  const [view, setView] = useState<View>('list');
  const [editing, setEditing] = useState<BackendBlogPost | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [showCatInput, setShowCatInput] = useState(false);
  const [creatingCat, setCreatingCat] = useState(false);

  const slugStatus = useSlugCheck(
    view === 'editor' ? form.slug : '',
    editing?.id,
  );

  const catOptions = (categories ?? []).map((c) => ({ value: c.id, label: c.name }));

  const openNew = () => {
    setForm(EMPTY);
    setSlugManual(false);
    setIsNew(true);
    setEditing(null);
    setShowCatInput(false);
    setNewCatInput('');
    setView('editor');
  };

  const openEdit = (post: BackendBlogPost) => {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content as unknown as Record<string, unknown>,
      categoryId: post.categoryId,
      publishedAt: post.publishedAt ? post.publishedAt.slice(0, 10) : '',
      imageId: post.image?.id,
      imageUrl: post.image?.url ?? '',
    });
    setSlugManual(true);
    setIsNew(false);
    setEditing(post);
    setView('editor');
  };

  const closeEditor = () => {
    setView('list');
    setEditing(null);
    setIsNew(false);
    setShowCatInput(false);
    setNewCatInput('');
  };

  const handleTitleChange = (title: string) => {
    setForm((p) => ({ ...p, title, slug: slugManual ? p.slug : slugify(title) }));
  };

  const handleCreateCategory = async (name: string) => {
    if (!name.trim()) return;
    setCreatingCat(true);
    try {
      const created = await createBlogCategory(name.trim());
      setCatRefreshKey((k) => k + 1);
      setForm((p) => ({ ...p, categoryId: created.id }));
      setNewCatInput('');
      setShowCatInput(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setCreatingCat(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) { toast.error('Veuillez choisir une catégorie.'); return; }
    setSaving(true);
    try {
      const payload: BlogPostInput = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: form.content,
        categoryId: form.categoryId,
        publishedAt: form.publishedAt || null,
        imageId: form.imageId,
      };
      if (isNew) await createBlogPost(payload);
      else if (editing) await updateBlogPost(editing.id, payload);
      toast.success(isNew ? 'Article créé avec succès.' : 'Article mis à jour.');
      setRefreshKey((k) => k + 1);
      closeEditor();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!await showConfirm('Cet article sera supprimé définitivement.', 'Supprimer l\'article ?')) return;
    setDeletingId(id);
    try {
      await deleteBlogPost(id);
      toast.success('Article supprimé.');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de supprimer.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── List view ──────────────────────────────────────────────────────────────

  if (view === 'list') {
    return (
      <>
        <Helmet><title>Blog | Admin RIMAMAN</title></Helmet>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold font-headline text-on-surface">Articles de blog</h1>
            <button
              onClick={openNew}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              <Icon name="add" size="sm" />
              Nouvel article
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : error ? (
            <p className="text-center text-error py-12">Impossible de charger les articles.</p>
          ) : (
            <div className="space-y-3">
              {(posts ?? []).length === 0 && (
                <p className="text-center text-on-surface-variant py-12">Aucun article pour l'instant.</p>
              )}
              {(posts ?? []).map((post) => (
                <div key={post.id} className="bg-white rounded-2xl border border-outline-variant flex items-center gap-4 px-5 py-4">
                  {post.image ? (
                    <img src={post.image.url} alt={post.title} className="w-16 h-12 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-12 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                      <Icon name="image" size="sm" className="text-on-surface-variant/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface truncate">{post.title}</p>
                    <p className="text-sm text-on-surface-variant">
                      {post.category.name} &middot;{' '}
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('fr-FR')
                        : <span className="text-on-surface-variant/60 italic">Brouillon</span>}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
                      <Icon name="open_in_new" size="sm" />
                    </a>
                    <button onClick={() => openEdit(post)}
                      className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
                      <Icon name="edit" size="sm" />
                    </button>
                    <button onClick={() => handleDelete(post.id)} disabled={deletingId === post.id}
                      className="p-2 rounded-lg hover:bg-error/10 text-error transition-colors disabled:opacity-50">
                      <Icon name="delete" size="sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  // ── Editor view (full screen) ──────────────────────────────────────────────

  return (
    <>
      <Helmet><title>{isNew ? 'Nouvel article' : 'Modifier'} | Admin RIMAMAN</title></Helmet>

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={closeEditor}
            className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Icon name="arrow_back" size="sm" />
            Articles
          </button>
          <span className="text-on-surface-variant">/</span>
          <h1 className="text-lg font-bold font-headline text-on-surface">
            {isNew ? 'Nouvel article' : editing?.title}
          </h1>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-3 gap-6">

            {/* ── Left: editor ── */}
            <div className="col-span-2 space-y-4">

              {/* Titre */}
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Titre de l'article…"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant text-xl font-bold font-headline focus:outline-none focus:border-primary"
              />

              {/* Extrait */}
              <textarea
                required
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                placeholder="Extrait (résumé court affiché dans la liste)…"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary resize-none"
              />

              {/* Éditeur riche */}
              <RichTextEditor
                content={form.content}
                onChange={(doc) => setForm((p) => ({ ...p, content: doc }))}
                placeholder="Commencez à rédiger votre article…"
              />
            </div>

            {/* ── Right: metadata ── */}
            <div className="space-y-5">

              {/* Actions */}
              <div className="bg-white rounded-2xl border border-outline-variant p-4 space-y-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {saving && <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />}
                  {isNew ? 'Publier' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={closeEditor}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-outline-variant hover:bg-surface-container transition-colors"
                >
                  Annuler
                </button>
              </div>

              {/* Slug */}
              <div className="bg-white rounded-2xl border border-outline-variant p-4 space-y-2">
                <label className="block text-sm font-medium text-on-surface">Slug</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    value={form.slug}
                    onChange={(e) => { setSlugManual(true); setForm((p) => ({ ...p, slug: e.target.value })); }}
                    className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none font-mono transition-colors ${
                      slugStatus === 'available' ? 'border-green-500 focus:border-green-500' :
                      slugStatus === 'taken' || slugStatus === 'invalid' ? 'border-error focus:border-error' :
                      'border-outline-variant focus:border-primary'
                    }`}
                    placeholder="mon-article"
                  />
                  {slugStatus === 'checking' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  )}
                </div>
                <p className={`text-xs flex items-center gap-1 ${
                  slugStatus === 'available' ? 'text-green-600' :
                  slugStatus === 'taken' || slugStatus === 'invalid' ? 'text-error' :
                  'text-on-surface-variant'
                }`}>
                  {slugStatus === 'available' && <><Icon name="check_circle" size="sm" /> Disponible</>}
                  {slugStatus === 'taken' && <><Icon name="cancel" size="sm" /> Déjà utilisé</>}
                  {slugStatus === 'invalid' && <><Icon name="cancel" size="sm" /> Format invalide</>}
                  {slugStatus === 'idle' && 'Généré depuis le titre'}
                  {slugStatus === 'checking' && 'Vérification…'}
                </p>
              </div>

              {/* Catégorie */}
              <div className="bg-white rounded-2xl border border-outline-variant p-4 space-y-2">
                <label className="block text-sm font-medium text-on-surface">Catégorie *</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Combobox
                      options={catOptions}
                      value={form.categoryId}
                      onChange={(v) => setForm((p) => ({ ...p, categoryId: v }))}
                      placeholder="Choisir…"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowCatInput((s) => !s); setNewCatInput(''); }}
                    title="Nouvelle catégorie"
                    className="flex-shrink-0 w-9 h-9 mt-0.5 flex items-center justify-center rounded-xl border border-outline-variant hover:bg-surface-container text-on-surface-variant transition-colors"
                  >
                    <Icon name={showCatInput ? 'close' : 'add'} size="sm" />
                  </button>
                </div>
                {showCatInput && (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory(newCatInput); }
                        if (e.key === 'Escape') { setShowCatInput(false); setNewCatInput(''); }
                      }}
                      placeholder="Nom de la catégorie…"
                      className="flex-1 px-3 py-2 rounded-xl border border-primary text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCreateCategory(newCatInput)}
                      disabled={creatingCat || !newCatInput.trim()}
                      className="flex items-center gap-1 bg-primary text-on-primary px-3 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
                    >
                      {creatingCat
                        ? <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                        : 'Créer'}
                    </button>
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="bg-white rounded-2xl border border-outline-variant p-4 space-y-2">
                <label className="block text-sm font-medium text-on-surface">Date de publication</label>
                <input
                  type="date"
                  value={form.publishedAt ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, publishedAt: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-on-surface-variant">Vide = brouillon</p>
              </div>

              {/* Image de couverture */}
              <div className="bg-white rounded-2xl border border-outline-variant p-4 space-y-2">
                <label className="block text-sm font-medium text-on-surface">Image de couverture</label>
                {form.imageId ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={form.imageUrl} alt="cover" className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, imageId: undefined, imageUrl: '' }))}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                      <Icon name="close" size="sm" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMediaOpen(true)}
                    className="w-full h-24 rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-surface-container transition-colors"
                  >
                    <Icon name="add_photo_alternate" size="sm" className="text-on-surface-variant" />
                    <span className="text-xs text-on-surface-variant">Choisir une image</span>
                  </button>
                )}
                {form.imageId && (
                  <button
                    type="button"
                    onClick={() => setMediaOpen(true)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-outline-variant hover:bg-surface-container transition-colors"
                  >
                    Changer
                  </button>
                )}
              </div>

            </div>
          </div>
        </form>
      </div>

      <MediaPickerModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(media: Media) => setForm((p) => ({ ...p, imageId: media.id, imageUrl: media.url }))}
        selectedId={form.imageId}
        imagesOnly
      />
    </>
  );
};
