import { toast } from '../../store/toastStore';
import { showConfirm } from '../../store/confirmStore';
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../../components/common/Icon';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Combobox } from '../../components/common/Combobox';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useRecipeSlugCheck } from '../../hooks/useSlugCheck';
import { apiClient } from '../../api/client';
import {
  fetchRecipeCategories,
  createRecipeCategory,
  updateRecipeCategory,
  deleteRecipeCategory,
  fetchRecipeDifficulties,
  createRecipeDifficulty,
  updateRecipeDifficulty,
  deleteRecipeDifficulty,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  type RecipePayload,
} from '../../api/recipes';
import type { BackendRecipe, BackendRecipeCategory, BackendRecipeDifficulty } from '../../api/backend-types';
import type { RecipeCategory, RecipeDifficulty } from '../../types';
import type { Media } from '../../api/media';

// ── Constants ─────────────────────────────────────────────────────────────────

const ICON_OPTIONS = [
  { value: 'restaurant',       label: 'Restaurant' },
  { value: 'bakery_dining',    label: 'Boulangerie' },
  { value: 'breakfast_dining', label: 'Petit-déj' },
  { value: 'cake',             label: 'Gâteau' },
  { value: 'rice_bowl',        label: 'Riz' },
  { value: 'soup_kitchen',     label: 'Soupe' },
  { value: 'set_meal',         label: 'Repas' },
  { value: 'local_dining',     label: 'Cuisine' },
  { value: 'lunch_dining',     label: 'Déjeuner' },
  { value: 'restaurant_menu',  label: 'Menu' },
];

const COLOR_OPTIONS = [
  { value: 'green',  label: 'Vert (Facile)',     cls: 'bg-green-500' },
  { value: 'amber',  label: 'Orange (Moyen)',    cls: 'bg-amber-500' },
  { value: 'red',    label: 'Rouge (Difficile)', cls: 'bg-red-500' },
  { value: 'blue',   label: 'Bleu',              cls: 'bg-blue-500' },
  { value: 'purple', label: 'Violet',            cls: 'bg-purple-500' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Types formulaire recette ──────────────────────────────────────────────────

type IngredientRow = { item: string; quantity: string };
type StepMediaItem = { mediaId: string; url: string; mimeType: string; sortOrder: number };
type StepRow = { instruction: string; media: StepMediaItem[] };

type RecipeForm = {
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  difficultyId: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  tips: string[];
  imageId?: string;
  imageUrl?: string;
  videoId?: string;
  videoUrl?: string;
  ingredients: IngredientRow[];
  steps: StepRow[];
};

const EMPTY_FORM: RecipeForm = {
  title: '', slug: '', description: '',
  categoryId: '', difficultyId: '',
  prepTime: '10', cookTime: '20', servings: '4',
  tips: [], imageId: undefined, imageUrl: undefined,
  videoId: undefined, videoUrl: undefined,
  ingredients: [{ item: '', quantity: '' }],
  steps: [{ instruction: '', media: [] }],
};

// ── Onglet Catégories ─────────────────────────────────────────────────────────

const CategoriesTab: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: cats, loading } = useAsyncData(fetchRecipeCategories, [refreshKey]);
  const [localCats, setLocalCats] = useState<RecipeCategory[]>([]);
  const [newForm, setNewForm] = useState({ name: '', icon: 'restaurant' });
  const [creating, setCreating] = useState(false);
  const [savingNew, setSavingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', icon: '' });

  useEffect(() => { if (cats) setLocalCats(cats); }, [cats]);

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNew(true);
    try {
      await createRecipeCategory(newForm);
      toast.success('Catégorie créée.');
      setCreating(false);
      setNewForm({ name: '', icon: 'restaurant' });
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally { setSavingNew(false); }
  };

  const startEdit = (cat: RecipeCategory) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, icon: cat.icon });
  };

  const commitEdit = async (id: string) => {
    try {
      await updateRecipeCategory(id, editForm);
      setLocalCats((prev) => prev.map((c) => c.id === id ? { ...c, ...editForm } : c));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally { setEditingId(null); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!await showConfirm(`Supprimer la catégorie "${name}" ? Les recettes liées seront affectées.`, 'Supprimer ?')) return;
    try {
      await deleteRecipeCategory(id);
      setLocalCats((prev) => prev.filter((c) => c.id !== id));
      toast.success('Catégorie supprimée.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de supprimer.');
      refresh();
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-on-surface">Catégories</h2>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Icon name="add" size="sm" />
          Nouvelle catégorie
        </button>
      </div>

      {loading ? <LoadingSpinner size="sm" /> : (
        <div className="space-y-2">
          {localCats.length === 0 && !creating && (
            <p className="text-on-surface-variant text-sm py-8 text-center">Aucune catégorie.</p>
          )}
          {localCats.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl border border-outline-variant flex items-center gap-3 px-4 py-3">
              {editingId === cat.id ? (
                <>
                  <select
                    value={editForm.icon}
                    onChange={(e) => setEditForm((p) => ({ ...p, icon: e.target.value }))}
                    className="text-sm border border-outline-variant rounded-lg px-2 py-1 focus:outline-none focus:border-primary"
                  >
                    {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <input
                    autoFocus
                    value={editForm.name}
                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                    className="flex-1 px-2 py-1 text-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                  />
                  <button onClick={() => commitEdit(cat.id)} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"><Icon name="check" size="sm" /></button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"><Icon name="close" size="sm" /></button>
                </>
              ) : (
                <>
                  <Icon name={cat.icon} size="sm" className="text-primary flex-shrink-0" />
                  <span className="flex-1 font-medium text-on-surface capitalize">{cat.name}</span>
                  <button onClick={() => startEdit(cat)} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"><Icon name="edit" size="sm" /></button>
                  <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors"><Icon name="delete" size="sm" /></button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {creating && (
        <form onSubmit={handleCreate} className="mt-3 bg-white rounded-xl border border-primary p-4 space-y-3">
          <p className="text-sm font-semibold text-on-surface">Nouvelle catégorie</p>
          <div className="flex gap-2">
            <select
              value={newForm.icon}
              onChange={(e) => setNewForm((p) => ({ ...p, icon: e.target.value }))}
              className="text-sm border border-outline-variant rounded-lg px-2 py-2 focus:outline-none focus:border-primary"
            >
              {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input
              required autoFocus
              value={newForm.name}
              onChange={(e) => setNewForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Nom de la catégorie"
              className="flex-1 px-3 py-2 text-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setCreating(false)} className="px-3 py-1.5 text-sm rounded-lg border border-outline-variant hover:bg-surface-container transition-colors">Annuler</button>
            <button type="submit" disabled={savingNew} className="flex items-center gap-1.5 bg-primary text-on-primary px-4 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-60">
              {savingNew && <span className="w-3.5 h-3.5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />}
              Créer
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// ── Onglet Difficultés ────────────────────────────────────────────────────────

const DifficultiesTab: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: diffs, loading } = useAsyncData(fetchRecipeDifficulties, [refreshKey]);
  const [localDiffs, setLocalDiffs] = useState<RecipeDifficulty[]>([]);
  const [newForm, setNewForm] = useState({ name: '', color: 'green' });
  const [creating, setCreating] = useState(false);
  const [savingNew, setSavingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', color: '' });

  useEffect(() => { if (diffs) setLocalDiffs(diffs); }, [diffs]);

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNew(true);
    try {
      await createRecipeDifficulty(newForm);
      toast.success('Niveau créé.');
      setCreating(false);
      setNewForm({ name: '', color: 'green' });
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally { setSavingNew(false); }
  };

  const startEdit = (d: RecipeDifficulty) => {
    setEditingId(d.id);
    setEditForm({ name: d.name, color: d.color });
  };

  const commitEdit = async (id: string) => {
    try {
      await updateRecipeDifficulty(id, editForm);
      setLocalDiffs((prev) => prev.map((d) => d.id === id ? { ...d, ...editForm } : d));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally { setEditingId(null); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!await showConfirm(`Supprimer le niveau "${name}" ?`, 'Supprimer ?')) return;
    try {
      await deleteRecipeDifficulty(id);
      setLocalDiffs((prev) => prev.filter((d) => d.id !== id));
      toast.success('Niveau supprimé.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de supprimer.');
      refresh();
    }
  };

  const colorDot = (color: string) => {
    const opt = COLOR_OPTIONS.find((c) => c.value === color);
    return <span className={`inline-block w-3 h-3 rounded-full flex-shrink-0 ${opt?.cls ?? 'bg-gray-400'}`} />;
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-on-surface">Niveaux de difficulté</h2>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Icon name="add" size="sm" />
          Nouveau niveau
        </button>
      </div>

      {loading ? <LoadingSpinner size="sm" /> : (
        <div className="space-y-2">
          {localDiffs.length === 0 && !creating && (
            <p className="text-on-surface-variant text-sm py-8 text-center">Aucun niveau.</p>
          )}
          {localDiffs.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-outline-variant flex items-center gap-3 px-4 py-3">
              {editingId === d.id ? (
                <>
                  <select
                    value={editForm.color}
                    onChange={(e) => setEditForm((p) => ({ ...p, color: e.target.value }))}
                    className="text-sm border border-outline-variant rounded-lg px-2 py-1 focus:outline-none focus:border-primary"
                  >
                    {COLOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <input
                    autoFocus
                    value={editForm.name}
                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(d.id); if (e.key === 'Escape') setEditingId(null); }}
                    className="flex-1 px-2 py-1 text-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                  />
                  <button onClick={() => commitEdit(d.id)} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"><Icon name="check" size="sm" /></button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"><Icon name="close" size="sm" /></button>
                </>
              ) : (
                <>
                  {colorDot(d.color)}
                  <span className="flex-1 font-medium text-on-surface">{d.name}</span>
                  <button onClick={() => startEdit(d)} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"><Icon name="edit" size="sm" /></button>
                  <button onClick={() => handleDelete(d.id, d.name)} className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors"><Icon name="delete" size="sm" /></button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {creating && (
        <form onSubmit={handleCreate} className="mt-3 bg-white rounded-xl border border-primary p-4 space-y-3">
          <p className="text-sm font-semibold text-on-surface">Nouveau niveau</p>
          <div className="flex gap-2">
            <select
              value={newForm.color}
              onChange={(e) => setNewForm((p) => ({ ...p, color: e.target.value }))}
              className="text-sm border border-outline-variant rounded-lg px-2 py-2 focus:outline-none focus:border-primary"
            >
              {COLOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input
              required autoFocus
              value={newForm.name}
              onChange={(e) => setNewForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ex : Expert"
              className="flex-1 px-3 py-2 text-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setCreating(false)} className="px-3 py-1.5 text-sm rounded-lg border border-outline-variant hover:bg-surface-container transition-colors">Annuler</button>
            <button type="submit" disabled={savingNew} className="flex items-center gap-1.5 bg-primary text-on-primary px-4 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-60">
              {savingNew && <span className="w-3.5 h-3.5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />}
              Créer
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// ── Formulaire recette ────────────────────────────────────────────────────────

const Field: React.FC<{ label: string; children: React.ReactNode; hint?: string }> = ({ label, children, hint }) => (
  <div>
    <label className="block text-sm font-medium text-on-surface mb-1">{label}</label>
    {children}
    {hint && <p className="text-xs text-on-surface-variant mt-1">{hint}</p>}
  </div>
);

function buildPayload(form: RecipeForm): RecipePayload {
  return {
    title: form.title,
    slug: form.slug,
    description: form.description,
    categoryId: form.categoryId,
    difficultyId: form.difficultyId,
    prepTime: parseInt(form.prepTime) || 0,
    cookTime: parseInt(form.cookTime) || 0,
    servings: parseInt(form.servings) || 1,
    tips: form.tips.filter(Boolean),
    imageId: form.imageId,
    videoId: form.videoId,
    ingredients: form.ingredients.filter((i) => i.item.trim()).map((i, idx) => ({ ...i, sortOrder: idx })),
    steps: form.steps.filter((s) => s.instruction.trim()).map((s, idx) => ({
      step: idx + 1,
      instruction: s.instruction,
      media: s.media.map((m, i) => ({ mediaId: m.mediaId, sortOrder: m.sortOrder ?? i })),
    })),
  };
}

interface RecipeEditorProps {
  editing: BackendRecipe | null;
  categories: BackendRecipeCategory[];
  difficulties: BackendRecipeDifficulty[];
  onSaved: () => void;
  onCancel: () => void;
}

const RecipeEditor: React.FC<RecipeEditorProps> = ({ editing, categories, difficulties, onSaved, onCancel }) => {
  const [form, setForm] = useState<RecipeForm>(() => {
    if (!editing) return EMPTY_FORM;
    return {
      title: editing.title,
      slug: editing.slug,
      description: editing.description,
      categoryId: editing.categoryId,
      difficultyId: editing.difficultyId,
      prepTime: String(editing.prepTime),
      cookTime: String(editing.cookTime),
      servings: String(editing.servings),
      tips: editing.tips,
      imageId: editing.image?.id,
      imageUrl: editing.image?.url,
      videoId: editing.video?.id,
      videoUrl: editing.video?.url,
      ingredients: editing.ingredients.map(({ item, quantity }) => ({ item, quantity })),
      steps: editing.steps.map((s) => ({
        instruction: s.instruction,
        media: s.media.map((m, i) => ({ mediaId: m.mediaId, url: m.media.url, mimeType: m.media.mimeType, sortOrder: m.sortOrder ?? i })),
      })),
    };
  });

  const [slugManual, setSlugManual] = useState(!!editing);
  const [saving, setSaving] = useState(false);
  // null = fermé, 'cover' = image couverture, 'video' = vidéo, number = index étape
  const [mediaTarget, setMediaTarget] = useState<null | 'cover' | 'video' | number>(null);

  const slugStatus = useRecipeSlugCheck(form.slug, editing?.id);

  const set = <K extends keyof RecipeForm>(key: K, value: RecipeForm[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleTitleChange = (v: string) => {
    set('title', v);
    if (!slugManual) set('slug', slugify(v));
  };

  // Ingrédients
  const setIngredient = (idx: number, field: keyof IngredientRow, value: string) =>
    setForm((p) => {
      const ingredients = [...p.ingredients];
      ingredients[idx] = { ...ingredients[idx], [field]: value };
      return { ...p, ingredients };
    });
  const addIngredient = () => setForm((p) => ({ ...p, ingredients: [...p.ingredients, { item: '', quantity: '' }] }));
  const removeIngredient = (idx: number) => setForm((p) => ({ ...p, ingredients: p.ingredients.filter((_, i) => i !== idx) }));

  // Étapes
  const setStep = (idx: number, value: string) =>
    setForm((p) => { const steps = [...p.steps]; steps[idx] = { ...steps[idx], instruction: value }; return { ...p, steps }; });
  const addStepMedia = (stepIdx: number, item: StepMediaItem) =>
    setForm((p) => {
      const steps = [...p.steps];
      const media = [...steps[stepIdx].media, item];
      steps[stepIdx] = { ...steps[stepIdx], media };
      return { ...p, steps };
    });
  const removeStepMedia = (stepIdx: number, mediaId: string) =>
    setForm((p) => {
      const steps = [...p.steps];
      steps[stepIdx] = { ...steps[stepIdx], media: steps[stepIdx].media.filter((m) => m.mediaId !== mediaId) };
      return { ...p, steps };
    });
  const addStep = () => setForm((p) => ({ ...p, steps: [...p.steps, { instruction: '', media: [] }] }));
  const removeStep = (idx: number) => setForm((p) => ({ ...p, steps: p.steps.filter((_, i) => i !== idx) }));

  // Conseils
  const setTip = (idx: number, value: string) =>
    setForm((p) => { const tips = [...p.tips]; tips[idx] = value; return { ...p, tips }; });
  const addTip = () => setForm((p) => ({ ...p, tips: [...p.tips, ''] }));
  const removeTip = (idx: number) => setForm((p) => ({ ...p, tips: p.tips.filter((_, i) => i !== idx) }));

  const handleSelectMedia = (media: Media) => {
    if (mediaTarget === 'cover') {
      setForm((p) => ({ ...p, imageId: media.id, imageUrl: media.url }));
    } else if (mediaTarget === 'video') {
      setForm((p) => ({ ...p, videoId: media.id, videoUrl: media.url }));
    } else if (typeof mediaTarget === 'number') {
      const stepIdx = mediaTarget;
      const alreadyExists = form.steps[stepIdx].media.some((m) => m.mediaId === media.id);
      if (!alreadyExists) {
        addStepMedia(stepIdx, {
          mediaId: media.id,
          url: media.url,
          mimeType: media.mimeType,
          sortOrder: form.steps[stepIdx].media.length,
        });
      }
    }
    setMediaTarget(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) { toast.error('Choisissez une catégorie.'); return; }
    if (!form.difficultyId) { toast.error('Choisissez un niveau de difficulté.'); return; }
    setSaving(true);
    try {
      const payload = buildPayload(form);
      if (editing) {
        await updateRecipe(editing.id, payload);
        toast.success('Recette mise à jour.');
      } else {
        await createRecipe(payload);
        toast.success('Recette créée.');
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    } finally { setSaving(false); }
  };

  const catOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const diffOptions = difficulties.map((d) => ({ value: d.id, label: d.name }));

  const inputCls = 'w-full px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary';

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button type="button" onClick={onCancel} className="p-2 rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors">
            <Icon name="arrow_back" size="sm" />
          </button>
          <h1 className="text-xl font-bold font-headline text-on-surface flex-1">
            {editing ? 'Modifier la recette' : 'Nouvelle recette'}
          </h1>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {saving && <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />}
            {editing ? 'Enregistrer' : 'Publier'}
          </button>
        </div>

        <div className="space-y-6">
          {/* Image de couverture */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Image de couverture</label>
            <div
              onClick={() => setMediaTarget('cover')}
              className="relative h-48 rounded-2xl overflow-hidden bg-surface-container border-2 border-dashed border-outline-variant hover:border-primary cursor-pointer transition-colors flex items-center justify-center"
            >
              {form.imageUrl ? (
                <>
                  <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Icon name="photo_camera" className="text-white" />
                  </div>
                </>
              ) : (
                <div className="text-center text-on-surface-variant">
                  <Icon name="add_photo_alternate" size="xl" className="mb-2 mx-auto" />
                  <p className="text-sm">Choisir une image</p>
                </div>
              )}
            </div>
            {form.imageUrl && (
              <button type="button" onClick={() => setForm((p) => ({ ...p, imageId: undefined, imageUrl: undefined }))} className="mt-1.5 text-xs text-error hover:underline">
                Retirer l'image
              </button>
            )}
          </div>

          {/* Vidéo */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Vidéo (optionnel)</label>
            {form.videoUrl ? (
              <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant">
                <Icon name="videocam" className="text-primary flex-shrink-0" />
                <span className="flex-1 text-sm text-on-surface truncate">{form.videoUrl}</span>
                <button
                  type="button"
                  onClick={() => setMediaTarget('video')}
                  className="text-xs text-primary hover:underline flex-shrink-0"
                >
                  Changer
                </button>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, videoId: undefined, videoUrl: undefined }))}
                  className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors flex-shrink-0"
                >
                  <Icon name="close" size="sm" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setMediaTarget('video')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary text-sm transition-colors"
              >
                <Icon name="video_library" size="sm" />
                Ajouter une vidéo
              </button>
            )}
          </div>

          {/* Titre + Slug */}
          <Field label="Titre *">
            <input required value={form.title} onChange={(e) => handleTitleChange(e.target.value)} className={inputCls} placeholder="Ex : Fufu au manioc" />
          </Field>

          <Field label="Slug *" hint={`URL : /recettes/${form.slug || '...'}`}>
            <div className="relative">
              <input
                required
                value={form.slug}
                onChange={(e) => { setSlugManual(true); set('slug', e.target.value); }}
                className={`${inputCls} pr-10`}
                placeholder="fufu-manioc"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {slugStatus === 'checking' && <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" />}
                {slugStatus === 'available' && <Icon name="check_circle" size="sm" className="text-green-600" />}
                {slugStatus === 'taken' && <Icon name="cancel" size="sm" className="text-error" />}
              </span>
            </div>
          </Field>

          <Field label="Description *">
            <textarea required rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputCls} resize-none`} placeholder="Description courte de la recette…" />
          </Field>

          {/* Catégorie + Difficulté */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Catégorie *">
              <Combobox options={catOptions} value={form.categoryId} onChange={(v) => set('categoryId', v)} placeholder="Choisir…" />
            </Field>
            <Field label="Difficulté *">
              <Combobox options={diffOptions} value={form.difficultyId} onChange={(v) => set('difficultyId', v)} placeholder="Choisir…" />
            </Field>
          </div>

          {/* Temps + Portions */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Préparation (min) *">
              <input required type="number" min={0} value={form.prepTime} onChange={(e) => set('prepTime', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Cuisson (min) *">
              <input required type="number" min={0} value={form.cookTime} onChange={(e) => set('cookTime', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Personnes *">
              <input required type="number" min={1} value={form.servings} onChange={(e) => set('servings', e.target.value)} className={inputCls} />
            </Field>
          </div>

          {/* Ingrédients */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Ingrédients *</label>
            <div className="space-y-2">
              {form.ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    value={ing.quantity}
                    onChange={(e) => setIngredient(idx, 'quantity', e.target.value)}
                    placeholder="Quantité (ex: 500g)"
                    className="w-32 px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary"
                  />
                  <input
                    value={ing.item}
                    onChange={(e) => setIngredient(idx, 'item', e.target.value)}
                    placeholder="Ingrédient (ex: Farine RIMAMAN)"
                    className="flex-1 px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary"
                  />
                  {form.ingredients.length > 1 && (
                    <button type="button" onClick={() => removeIngredient(idx)} className="p-2 rounded-lg hover:bg-error/10 text-error transition-colors flex-shrink-0">
                      <Icon name="remove_circle" size="sm" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addIngredient} className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
                <Icon name="add_circle" size="sm" />
                Ajouter un ingrédient
              </button>
            </div>
          </div>

          {/* Étapes */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Étapes *</label>
            <div className="space-y-4">
              {form.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    {idx + 1}
                  </span>
                  <div className="flex-1 space-y-2">
                    <textarea
                      value={step.instruction}
                      onChange={(e) => setStep(idx, e.target.value)}
                      placeholder={`Description de l'étape ${idx + 1}…`}
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary resize-none"
                    />
                    {/* Médias attachés à l'étape */}
                    {step.media.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {step.media.map((m) => (
                          <div key={m.mediaId} className="relative group w-20 h-14 rounded-lg overflow-hidden border border-outline-variant flex-shrink-0">
                            {m.mimeType.startsWith('video/') ? (
                              <div className="w-full h-full bg-surface-container flex items-center justify-center">
                                <Icon name="videocam" size="sm" className="text-on-surface-variant" />
                              </div>
                            ) : (
                              <img src={m.url} alt="" className="w-full h-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => removeStepMedia(idx, m.mediaId)}
                              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-error text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Icon name="close" size="sm" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setMediaTarget(idx)}
                      className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <Icon name="add_photo_alternate" size="sm" />
                      Ajouter un média
                    </button>
                  </div>
                  {form.steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(idx)} className="p-2 rounded-lg hover:bg-error/10 text-error transition-colors flex-shrink-0 mt-1">
                      <Icon name="remove_circle" size="sm" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addStep} className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors ml-11">
                <Icon name="add_circle" size="sm" />
                Ajouter une étape
              </button>
            </div>
          </div>

          {/* Conseils */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Conseils</label>
            <div className="space-y-2">
              {form.tips.map((tip, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Icon name="lightbulb" size="sm" className="text-primary flex-shrink-0" />
                  <input
                    value={tip}
                    onChange={(e) => setTip(idx, e.target.value)}
                    placeholder="Conseil ou astuce…"
                    className="flex-1 px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary"
                  />
                  <button type="button" onClick={() => removeTip(idx)} className="p-2 rounded-lg hover:bg-error/10 text-error transition-colors flex-shrink-0">
                    <Icon name="remove_circle" size="sm" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addTip} className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
                <Icon name="add_circle" size="sm" />
                Ajouter un conseil
              </button>
            </div>
          </div>
        </div>
      </form>

      <MediaPickerModal
        open={mediaTarget !== null}
        onSelect={handleSelectMedia}
        onClose={() => setMediaTarget(null)}
      />
    </>
  );
};

// ── Onglet Recettes (liste) ───────────────────────────────────────────────────

const RecipesTab: React.FC<{
  categories: BackendRecipeCategory[];
  difficulties: BackendRecipeDifficulty[];
}> = ({ categories, difficulties }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: recipes, loading, error } = useAsyncData(
    () => apiClient.get<BackendRecipe[]>('/recipes'),
    [refreshKey],
  );
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editing, setEditing] = useState<BackendRecipe | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = () => setRefreshKey((k) => k + 1);

  const openNew = () => { setEditing(null); setView('editor'); };
  const openEdit = (r: BackendRecipe) => { setEditing(r); setView('editor'); };

  const handleSaved = () => { refresh(); setView('list'); };
  const handleCancel = () => setView('list');

  const handleDelete = async (id: string) => {
    if (!await showConfirm('Cette recette sera supprimée définitivement.', 'Supprimer la recette ?')) return;
    setDeletingId(id);
    try {
      await deleteRecipe(id);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de supprimer.');
    } finally { setDeletingId(null); }
  };

  if (view === 'editor') {
    return (
      <RecipeEditor
        editing={editing}
        categories={categories}
        difficulties={difficulties}
        onSaved={handleSaved}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-on-surface">Recettes</h2>
          {!loading && <p className="text-sm text-on-surface-variant">{(recipes ?? []).length} recette{(recipes ?? []).length !== 1 ? 's' : ''}</p>}
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <Icon name="add" size="sm" />
          Nouvelle recette
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : error ? (
        <p className="text-center text-error py-12">Impossible de charger les recettes.</p>
      ) : (recipes ?? []).length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-outline-variant rounded-2xl">
          <Icon name="restaurant_menu" size="xl" className="text-on-surface-variant mb-4" />
          <p className="text-on-surface-variant mb-4">Aucune recette. Créez-en une !</p>
          <button onClick={openNew} className="bg-primary text-on-primary px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
            Créer une recette
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {(recipes ?? []).map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-xl border border-outline-variant flex items-center gap-4 px-4 py-3">
              <div className="w-14 h-10 rounded-lg bg-surface-container flex-shrink-0 overflow-hidden">
                {recipe.image ? (
                  <img src={recipe.image.url} alt={recipe.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="image" size="sm" className="text-on-surface-variant/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-on-surface truncate">{recipe.title}</p>
                <p className="text-xs text-on-surface-variant capitalize">
                  {recipe.category.name} · {recipe.prepTime + recipe.cookTime} min · {recipe.servings} pers.
                </p>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold flex-shrink-0 bg-surface-container text-on-surface-variant">
                {recipe.difficulty.name}
              </span>
              <div className="flex gap-1 flex-shrink-0">
                <a href={`/recettes/${recipe.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
                  <Icon name="open_in_new" size="sm" />
                </a>
                <button onClick={() => openEdit(recipe)} className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
                  <Icon name="edit" size="sm" />
                </button>
                <button
                  onClick={() => handleDelete(recipe.id)}
                  disabled={deletingId === recipe.id}
                  className="p-2 rounded-lg hover:bg-error/10 text-error transition-colors disabled:opacity-50"
                >
                  <Icon name="delete" size="sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────

type Tab = 'recettes' | 'categories' | 'difficultes';

export const AdminRecipes: React.FC = () => {
  const [tab, setTab] = useState<Tab>('recettes');
  const { data: categories } = useAsyncData(fetchRecipeCategories, []);
  const { data: difficulties } = useAsyncData(fetchRecipeDifficulties, []);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'recettes',    label: 'Recettes',    icon: 'restaurant_menu' },
    { id: 'categories',  label: 'Catégories',  icon: 'category' },
    { id: 'difficultes', label: 'Difficultés', icon: 'speed' },
  ];

  return (
    <>
      <Helmet><title>Recettes | Admin RIMAMAN</title></Helmet>

      <div>
        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-outline-variant">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name={t.icon} size="sm" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'recettes'    && <RecipesTab categories={categories ?? []} difficulties={difficulties ?? []} />}
        {tab === 'categories'  && <CategoriesTab />}
        {tab === 'difficultes' && <DifficultiesTab />}
      </div>
    </>
  );
};
