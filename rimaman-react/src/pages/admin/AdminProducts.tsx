import { toast } from '../../store/toastStore';
import { showConfirm } from '../../store/confirmStore';
import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../../components/common/Icon';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchProductCategories } from '../../api/products';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';
import type { Media } from '../../api/media';
import type { BackendProduct, BackendProductVariant } from '../../api/backend-types';
import type { ProductCategory } from '../../types';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  type ProductInput,
  type VariantInput,
} from '../../api/products';
import { apiClient } from '../../api/client';

type ModalTab = 'infos' | 'details' | 'nutrition' | 'features' | 'variants';

type NutritionRow = { label: string; value: string; sub: string };

const EMPTY_FORM: ProductInput = {
  name: '',
  slug: '',
  description: '',
  price: 0,
  weight: '',
  categoryId: '',
  features: [],
  isBestseller: false,
  imageId: undefined,
  nutrition: [],
  servings: undefined,
  storageInfo: '',
  allergens: '',
};

const EMPTY_VARIANT: VariantInput = {
  weight: '',
  price: 0,
  stock: undefined,
  isDefault: false,
  sortOrder: 0,
  imageId: undefined,
};

const TABS: { key: ModalTab; label: string }[] = [
  { key: 'infos', label: 'Infos' },
  { key: 'details', label: 'Détails' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'features', label: 'Caractéristiques' },
  { key: 'variants', label: 'Variantes' },
];

export const AdminProducts: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: products, loading, error } = useAsyncData(
    () => apiClient.get<BackendProduct[]>('/products'),
    [refreshKey],
  );
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [variantImagePickerOpen, setVariantImagePickerOpen] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [variantImagePreviewUrl, setVariantImagePreviewUrl] = useState('');
  const { data: categories } = useAsyncData(
    fetchProductCategories as () => Promise<ProductCategory[]>,
    [],
  );

  // ── Product form state ─────────────────────────────────────────────────────
  const [editingProduct, setEditingProduct] = useState<BackendProduct | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<ProductInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [featureInput, setFeatureInput] = useState('');
  const [modalTab, setModalTab] = useState<ModalTab>('infos');

  // ── Slug auto-génération + disponibilité ───────────────────────────────────
  const slugManuallyEdited = useRef(false);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const slugDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Variant state ──────────────────────────────────────────────────────────
  const [localVariants, setLocalVariants] = useState<BackendProductVariant[]>([]);
  const [variantForm, setVariantForm] = useState<VariantInput>(EMPTY_VARIANT);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [savingVariant, setSavingVariant] = useState(false);
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(null);

  // ── Slug : génération auto + vérification dispo ───────────────────────────

  const toSlug = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const checkSlugAvailability = (slug: string, excludeId?: string) => {
    if (!slug) { setSlugStatus('idle'); return; }
    setSlugStatus('checking');
    if (slugDebounceTimer.current) clearTimeout(slugDebounceTimer.current);
    slugDebounceTimer.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ slug });
        if (excludeId) params.set('excludeId', excludeId);
        const res = await apiClient.get<{ available: boolean }>(`/products/slug/check?${params}`);
        setSlugStatus(res.available ? 'available' : 'taken');
      } catch {
        setSlugStatus('idle');
      }
    }, 400);
  };

  // Auto-slug depuis le nom
  useEffect(() => {
    const showModal = isNew || editingProduct !== null;
    if (!showModal || slugManuallyEdited.current) return;
    const generated = toSlug(form.name);
    setForm((f) => ({ ...f, slug: generated }));
    checkSlugAvailability(generated, editingProduct?.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name]);

  // ── Nutrition helpers ──────────────────────────────────────────────────────
  const nutritionRows: NutritionRow[] = ((form.nutrition ?? []) as NutritionRow[]);

  const addNutritionRow = () =>
    setForm((f) => ({ ...f, nutrition: [...(f.nutrition ?? []), { label: '', value: '', sub: '' }] }));

  const removeNutritionRow = (idx: number) =>
    setForm((f) => ({ ...f, nutrition: (f.nutrition ?? []).filter((_, i) => i !== idx) }));

  const updateNutritionRow = (idx: number, field: keyof NutritionRow, val: string) =>
    setForm((f) => {
      const rows = [...(f.nutrition ?? [])] as NutritionRow[];
      rows[idx] = { ...rows[idx], [field]: val };
      return { ...f, nutrition: rows };
    });

  // ── Modal open/close ───────────────────────────────────────────────────────
  const openNew = () => {
    setForm(EMPTY_FORM);
    setImagePreviewUrl('');
    setLocalVariants([]);
    setIsNew(true);
    setEditingProduct(null);
    setModalTab('infos');
    slugManuallyEdited.current = false;
    setSlugStatus('idle');
  };

  const openEdit = (p: BackendProduct) => {
    setForm({
      name: p.name,
      slug: p.slug ?? '',
      description: p.description,
      price: p.price,
      weight: p.weight,
      categoryId: p.categoryId,
      features: [...p.features],
      isBestseller: p.isBestseller,
      imageId: p.image?.id,
      nutrition: ((p.nutrition ?? []) as NutritionRow[]).map((r) => ({
        label: r.label ?? '',
        value: r.value ?? '',
        sub: r.sub ?? '',
      })),
      servings: p.servings ?? undefined,
      storageInfo: p.storageInfo ?? '',
      allergens: p.allergens ?? '',
    });
    setImagePreviewUrl(p.image?.url ?? '');
    slugManuallyEdited.current = true; // slug existant = déjà défini, on ne l'écrase pas
    setSlugStatus('idle');
    setLocalVariants(p.variants ?? []);
    setIsNew(false);
    setEditingProduct(p);
    setModalTab('infos');
    setEditingVariantId(null);
    setVariantForm(EMPTY_VARIANT);
    setVariantImagePreviewUrl('');
  };

  const closeModal = () => {
    setEditingProduct(null);
    setIsNew(false);
    setImagePreviewUrl('');
    slugManuallyEdited.current = false;
    setSlugStatus('idle');
  };

  // Sync localVariants when editingProduct updates from list refresh
  useEffect(() => {
    if (!editingProduct) return;
    const updated = products?.find((p) => p.id === editingProduct.id);
    if (updated) setLocalVariants(updated.variants ?? []);
  }, [products, editingProduct]);

  // ── Product save ───────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slugStatus === 'taken') {
      toast.error('Ce slug est déjà utilisé. Modifiez-le avant de sauvegarder.');
      return;
    }
    setSaving(true);
    try {
      // Strip empty sub from nutrition rows
      const payload: ProductInput = {
        ...form,
        slug: form.slug?.trim() || undefined,
        nutrition: (form.nutrition ?? []).map((r) => {
          const row = r as NutritionRow;
          return row.sub?.trim() ? row : { label: row.label, value: row.value };
        }),
      };
      if (isNew) {
        await createProduct(payload);
      } else if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      }
      setRefreshKey((k) => k + 1);
      closeModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!await showConfirm('Ce produit sera supprimé définitivement.', 'Supprimer le produit ?')) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de supprimer ce produit.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Features ───────────────────────────────────────────────────────────────
  const addFeature = () => {
    const f = featureInput.trim();
    if (f && !form.features.includes(f)) {
      setForm((p) => ({ ...p, features: [...p.features, f] }));
      setFeatureInput('');
    }
  };

  // ── Variant CRUD ──────────────────────────────────────────────────────────
  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingVariant(true);
    try {
      if (editingVariantId) {
        const updated = await updateVariant(editingProduct.id, editingVariantId, variantForm);
        setLocalVariants((lv) => lv.map((v) => (v.id === editingVariantId ? updated : v)));
        setEditingVariantId(null);
      } else {
        const created = await createVariant(editingProduct.id, {
          ...variantForm,
          sortOrder: localVariants.length,
        });
        setLocalVariants((lv) => [...lv, created]);
      }
      setVariantForm(EMPTY_VARIANT);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde de la variante.');
    } finally {
      setSavingVariant(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!editingProduct) return;
    if (!await showConfirm('Cette variante sera supprimée.', 'Supprimer la variante ?')) return;
    setDeletingVariantId(variantId);
    try {
      await deleteVariant(editingProduct.id, variantId);
      setLocalVariants((lv) => lv.filter((v) => v.id !== variantId));
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de supprimer la variante.');
    } finally {
      setDeletingVariantId(null);
    }
  };

  const startEditVariant = (v: BackendProductVariant) => {
    setEditingVariantId(v.id);
    setVariantForm({
      weight: v.weight,
      price: v.price,
      stock: v.stock ?? undefined,
      isDefault: v.isDefault,
      sortOrder: v.sortOrder,
      imageId: v.image?.id,
    });
    setVariantImagePreviewUrl(v.image?.url ?? '');
  };

  const cancelEditVariant = () => {
    setEditingVariantId(null);
    setVariantForm(EMPTY_VARIANT);
    setVariantImagePreviewUrl('');
  };

  const showModal = isNew || editingProduct !== null;

  const inputCls = 'w-full px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary bg-white';

  return (
    <>
      <Helmet>
        <title>Produits | Admin RIMAMAN</title>
      </Helmet>

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-headline text-on-surface">Produits</h1>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <Icon name="add" size="sm" />
            Nouveau produit
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : error ? (
          <p className="text-center text-error py-12">Impossible de charger les produits.</p>
        ) : (
          <div className="space-y-3">
            {(products ?? []).length === 0 && (
              <p className="text-center text-on-surface-variant py-12">Aucun produit. Créez-en un ci-dessus.</p>
            )}
            {(products ?? []).map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-outline-variant flex items-center gap-4 px-5 py-4">
                {p.image && (
                  <img src={p.image.url} alt={p.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-on-surface">{p.name}</p>
                    {p.isBestseller && (
                      <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-semibold">Bestseller</span>
                    )}
                    {p.slug && (
                      <span className="text-xs bg-surface-container text-on-surface-variant px-2 py-0.5 rounded font-mono">/{p.slug}</span>
                    )}
                  </div>
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    {p.variants && p.variants.length > 0
                      ? `${p.variants.length} variante(s) : ${p.variants.map((v) => v.weight).join(', ')}`
                      : `${p.weight} · ${p.price.toLocaleString()} FCFA`}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(p)}
                    className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                    title="Modifier"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="p-2 rounded-lg hover:bg-error/10 text-error transition-colors disabled:opacity-50"
                    title="Supprimer"
                  >
                    <Icon name="delete" size="sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

            {/* Header + tab bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant flex-shrink-0">
              <h2 className="font-bold text-on-surface">{isNew ? 'Nouveau produit' : 'Modifier le produit'}</h2>
              <button onClick={closeModal} className="p-1 text-on-surface-variant hover:text-on-surface">
                <Icon name="close" size="sm" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-outline-variant overflow-x-auto flex-shrink-0">
              {TABS.filter((t) => t.key !== 'variants' || !isNew).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setModalTab(key)}
                  className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    modalTab === key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {label}
                  {key === 'variants' && localVariants.length > 0 && (
                    <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                      {localVariants.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content — scrollable */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSave} id="product-form">

                {/* ── Infos de base ── */}
                {modalTab === 'infos' && (
                  <div className="px-6 py-5 space-y-4">
                    {/* Image */}
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-1">Image principale</label>
                      <div className="rounded-xl border border-outline-variant overflow-hidden">
                        {imagePreviewUrl ? (
                          <img src={imagePreviewUrl} alt="cover" className="w-full h-36 object-cover" />
                        ) : (
                          <div className="w-full h-36 bg-surface-container flex flex-col items-center justify-center gap-1">
                            <Icon name="image" className="text-on-surface-variant/40" />
                            <p className="text-xs text-on-surface-variant">Aucune image</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setImagePickerOpen(true)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm border border-outline-variant rounded-xl hover:bg-surface-container transition-colors"
                        >
                          <Icon name="photo_library" size="sm" />
                          {imagePreviewUrl ? 'Changer' : 'Choisir une image'}
                        </button>
                        {imagePreviewUrl && (
                          <button
                            type="button"
                            onClick={() => { setForm((f) => ({ ...f, imageId: undefined })); setImagePreviewUrl(''); }}
                            className="px-3 py-2 text-sm text-error border border-error/30 rounded-xl hover:bg-error/5 transition-colors"
                          >
                            Retirer
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Nom */}
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-1">Nom *</label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        className={inputCls}
                      />
                    </div>

                    {/* Slug */}
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-1">
                        Slug URL{' '}
                        <span className="text-on-surface-variant font-normal">(auto-généré)</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-on-surface-variant text-sm">/nos-farines/</span>
                        <input
                          type="text"
                          value={form.slug ?? ''}
                          onChange={(e) => {
                            slugManuallyEdited.current = true;
                            const slug = toSlug(e.target.value);
                            setForm((p) => ({ ...p, slug }));
                            checkSlugAvailability(slug, editingProduct?.id);
                          }}
                          placeholder="farine-riz-manioc"
                          className={`${inputCls} flex-1 ${slugStatus === 'taken' ? 'border-error' : slugStatus === 'available' ? 'border-green-500' : ''}`}
                        />
                        <span className="flex-shrink-0 w-5">
                          {slugStatus === 'checking' && (
                            <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" />
                          )}
                          {slugStatus === 'available' && (
                            <Icon name="check_circle" size="sm" className="text-green-600" />
                          )}
                          {slugStatus === 'taken' && (
                            <Icon name="cancel" size="sm" className="text-error" />
                          )}
                        </span>
                      </div>
                      {slugStatus === 'taken' && (
                        <p className="text-xs text-error mt-1">Ce slug est déjà utilisé par un autre produit.</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-1">Description *</label>
                      <textarea
                        required
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        className={`${inputCls} resize-none`}
                      />
                    </div>

                    {/* Catégorie */}
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-1">Catégorie *</label>
                      <select
                        required
                        value={form.categoryId}
                        onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                        className={inputCls}
                      >
                        <option value="" disabled>— Choisir une catégorie —</option>
                        {(categories ?? []).map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Prix de base */}
                      <div>
                        <label className="block text-sm font-medium text-on-surface mb-1">
                          Prix de base (FCFA) *
                          {localVariants.length > 0 && (
                            <span className="text-xs text-on-surface-variant font-normal ml-1">(remplacé par variantes)</span>
                          )}
                        </label>
                        <input
                          required
                          type="number"
                          min={0}
                          value={form.price}
                          onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                          className={inputCls}
                        />
                      </div>
                      {/* Format de base */}
                      <div>
                        <label className="block text-sm font-medium text-on-surface mb-1">
                          Format de base *
                          {localVariants.length > 0 && (
                            <span className="text-xs text-on-surface-variant font-normal ml-1">(remplacé par variantes)</span>
                          )}
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="1kg"
                          value={form.weight}
                          onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* Bestseller */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isBestseller ?? false}
                        onChange={(e) => setForm((p) => ({ ...p, isBestseller: e.target.checked }))}
                        className="w-4 h-4 rounded accent-primary"
                      />
                      <span className="text-sm text-on-surface">Marquer comme bestseller</span>
                    </label>
                  </div>
                )}

                {/* ── Détails ── */}
                {modalTab === 'details' && (
                  <div className="px-6 py-5 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-1">
                        Portions (nb de personnes rassasiées par le format par défaut)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={form.servings ?? ''}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            servings: e.target.value ? Number(e.target.value) : undefined,
                          }))
                        }
                        placeholder="6"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-1">
                        Informations de conservation
                      </label>
                      <textarea
                        rows={3}
                        value={form.storageInfo ?? ''}
                        onChange={(e) => setForm((p) => ({ ...p, storageInfo: e.target.value }))}
                        placeholder="Conservez dans un endroit frais et sec..."
                        className={`${inputCls} resize-none`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-1">Allergènes</label>
                      <input
                        type="text"
                        value={form.allergens ?? ''}
                        onChange={(e) => setForm((p) => ({ ...p, allergens: e.target.value }))}
                        placeholder="Sans gluten. Peut contenir des traces de soja."
                        className={inputCls}
                      />
                    </div>
                  </div>
                )}

                {/* ── Nutrition ── */}
                {modalTab === 'nutrition' && (
                  <div className="px-6 py-5">
                    <p className="text-xs text-on-surface-variant mb-4">
                      Valeurs pour 100g de produit sec. Le champ "Sous-texte" est optionnel (ex : "dont sucres : 0,8 g").
                    </p>
                    <div className="space-y-2 mb-4">
                      {nutritionRows.length === 0 && (
                        <p className="text-sm text-on-surface-variant py-4 text-center">
                          Aucune ligne. Cliquez sur "Ajouter" pour commencer.
                        </p>
                      )}
                      {nutritionRows.map((row, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <input
                            type="text"
                            value={row.label}
                            onChange={(e) => updateNutritionRow(idx, 'label', e.target.value)}
                            placeholder="Nutriment"
                            className={`${inputCls} flex-[2]`}
                          />
                          <input
                            type="text"
                            value={row.value}
                            onChange={(e) => updateNutritionRow(idx, 'value', e.target.value)}
                            placeholder="357 kcal"
                            className={`${inputCls} flex-[2]`}
                          />
                          <input
                            type="text"
                            value={row.sub}
                            onChange={(e) => updateNutritionRow(idx, 'sub', e.target.value)}
                            placeholder="Sous-texte"
                            className={`${inputCls} flex-[2]`}
                          />
                          <button
                            type="button"
                            onClick={() => removeNutritionRow(idx)}
                            className="p-2 text-error hover:bg-error/10 rounded-lg flex-shrink-0 mt-0.5"
                          >
                            <Icon name="close" size="sm" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addNutritionRow}
                      className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
                    >
                      <Icon name="add" size="sm" />
                      Ajouter une ligne
                    </button>
                  </div>
                )}

                {/* ── Caractéristiques ── */}
                {modalTab === 'features' && (
                  <div className="px-6 py-5">
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                        placeholder="Appuyer sur Entrée pour ajouter"
                        className={`${inputCls} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        className="px-3 py-2 bg-surface-container rounded-xl text-sm hover:bg-surface-container-high"
                      >
                        <Icon name="add" size="sm" />
                      </button>
                    </div>
                    {form.features.length === 0 && (
                      <p className="text-sm text-on-surface-variant py-4 text-center">Aucune caractéristique ajoutée.</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {form.features.map((f) => (
                        <span key={f} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full">
                          {f}
                          <button
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, features: p.features.filter((x) => x !== f) }))}
                          >
                            <Icon name="close" size="sm" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </form>

              {/* ── Variantes (hors <form> pour éviter les submit imbriqués) ── */}
              {modalTab === 'variants' && !isNew && (
                <div className="px-6 py-5">
                  {localVariants.length === 0 && (
                    <p className="text-sm text-on-surface-variant py-2 mb-4">
                      Aucune variante. Le produit utilise son prix et format de base. Ajoutez des variantes (500g, 1kg, 2kg…) pour offrir plusieurs formats.
                    </p>
                  )}

                  {/* Liste des variantes */}
                  <div className="space-y-2 mb-6">
                    {localVariants.map((v) =>
                      editingVariantId === v.id ? (
                        /* Formulaire d'édition inline */
                        <form
                          key={v.id}
                          onSubmit={handleSaveVariant}
                          className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3"
                        >
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-on-surface mb-1">Format *</label>
                              <input
                                required
                                type="text"
                                value={variantForm.weight}
                                onChange={(e) => setVariantForm((f) => ({ ...f, weight: e.target.value }))}
                                placeholder="1kg"
                                className={inputCls}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-on-surface mb-1">Prix (FCFA) *</label>
                              <input
                                required
                                type="number"
                                min={0}
                                value={variantForm.price}
                                onChange={(e) => setVariantForm((f) => ({ ...f, price: Number(e.target.value) }))}
                                className={inputCls}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-on-surface mb-1">Stock</label>
                              <input
                                type="number"
                                min={0}
                                value={variantForm.stock ?? ''}
                                onChange={(e) =>
                                  setVariantForm((f) => ({
                                    ...f,
                                    stock: e.target.value ? Number(e.target.value) : undefined,
                                  }))
                                }
                                placeholder="illimité"
                                className={inputCls}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={variantForm.isDefault}
                                onChange={(e) => setVariantForm((f) => ({ ...f, isDefault: e.target.checked }))}
                                className="w-4 h-4 accent-primary"
                              />
                              Variante par défaut
                            </label>
                            <div className="flex items-center gap-2">
                              {variantImagePreviewUrl && (
                                <img src={variantImagePreviewUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-outline-variant" />
                              )}
                              <button
                                type="button"
                                onClick={() => setVariantImagePickerOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
                              >
                                <Icon name="photo_library" size="sm" />
                                {variantImagePreviewUrl ? 'Changer image' : 'Image variante'}
                              </button>
                              {variantImagePreviewUrl && (
                                <button
                                  type="button"
                                  onClick={() => { setVariantForm((f) => ({ ...f, imageId: undefined })); setVariantImagePreviewUrl(''); }}
                                  className="text-xs text-error hover:underline"
                                >
                                  Retirer
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={cancelEditVariant}
                              className="px-3 py-1.5 text-sm border border-outline-variant rounded-lg hover:bg-surface-container"
                            >
                              Annuler
                            </button>
                            <button
                              type="submit"
                              disabled={savingVariant}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-on-primary rounded-lg disabled:opacity-60"
                            >
                              {savingVariant && <span className="w-3 h-3 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />}
                              Enregistrer
                            </button>
                          </div>
                        </form>
                      ) : (
                        /* Ligne de variante */
                        <div key={v.id} className="flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3 border border-outline-variant">
                          {v.isDefault && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                              Défaut
                            </span>
                          )}
                          <span className="font-semibold text-on-surface text-sm">{v.weight}</span>
                          <span className="text-on-surface-variant text-sm">
                            {v.price.toLocaleString()} FCFA
                            {v.stock != null ? ` · Stock : ${v.stock}` : ''}
                          </span>
                          <div className="ml-auto flex gap-1">
                            <button
                              onClick={() => startEditVariant(v)}
                              className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                              <Icon name="edit" size="sm" />
                            </button>
                            <button
                              onClick={() => handleDeleteVariant(v.id)}
                              disabled={deletingVariantId === v.id}
                              className="p-1.5 rounded-lg hover:bg-error/10 text-error disabled:opacity-50 transition-colors"
                            >
                              <Icon name="delete" size="sm" />
                            </button>
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  {/* Formulaire d'ajout */}
                  {editingVariantId === null && (
                    <form onSubmit={handleSaveVariant} className="border border-outline-variant rounded-xl p-4 space-y-3">
                      <p className="text-sm font-semibold text-on-surface">Nouvelle variante</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-on-surface mb-1">Format *</label>
                          <input
                            required
                            type="text"
                            value={variantForm.weight}
                            onChange={(e) => setVariantForm((f) => ({ ...f, weight: e.target.value }))}
                            placeholder="500g"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-on-surface mb-1">Prix (FCFA) *</label>
                          <input
                            required
                            type="number"
                            min={0}
                            value={variantForm.price || ''}
                            onChange={(e) => setVariantForm((f) => ({ ...f, price: Number(e.target.value) }))}
                            placeholder="1000"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-on-surface mb-1">Stock</label>
                          <input
                            type="number"
                            min={0}
                            value={variantForm.stock ?? ''}
                            onChange={(e) =>
                              setVariantForm((f) => ({
                                ...f,
                                stock: e.target.value ? Number(e.target.value) : undefined,
                              }))
                            }
                            placeholder="illimité"
                            className={inputCls}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={variantForm.isDefault}
                            onChange={(e) => setVariantForm((f) => ({ ...f, isDefault: e.target.checked }))}
                            className="w-4 h-4 accent-primary"
                          />
                          Variante par défaut
                        </label>
                        <div className="flex items-center gap-2">
                          {variantImagePreviewUrl && (
                            <img src={variantImagePreviewUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-outline-variant" />
                          )}
                          <button
                            type="button"
                            onClick={() => setVariantImagePickerOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
                          >
                            <Icon name="photo_library" size="sm" />
                            {variantImagePreviewUrl ? 'Changer image' : 'Image variante'}
                          </button>
                          {variantImagePreviewUrl && (
                            <button
                              type="button"
                              onClick={() => { setVariantForm((f) => ({ ...f, imageId: undefined })); setVariantImagePreviewUrl(''); }}
                              className="text-xs text-error hover:underline"
                            >
                              Retirer
                            </button>
                          )}
                        </div>
                        <button
                          type="submit"
                          disabled={savingVariant}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-on-primary rounded-xl font-medium disabled:opacity-60 hover:bg-primary/90 transition-colors"
                        >
                          {savingVariant && <span className="w-3 h-3 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />}
                          <Icon name="add" size="sm" />
                          Ajouter
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Footer avec le bouton principal (toutes tabs sauf Variantes) */}
            {modalTab !== 'variants' && (
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-outline-variant flex-shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm rounded-xl border border-outline-variant hover:bg-surface-container transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  form="product-form"
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {saving && <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />}
                  {isNew ? 'Créer' : 'Enregistrer'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <MediaPickerModal
        open={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        onSelect={(media: Media) => {
          setForm((f) => ({ ...f, imageId: media.id }));
          setImagePreviewUrl(media.url);
          setImagePickerOpen(false);
        }}
        selectedId={form.imageId}
        imagesOnly
      />

      <MediaPickerModal
        open={variantImagePickerOpen}
        onClose={() => setVariantImagePickerOpen(false)}
        onSelect={(media: Media) => {
          setVariantForm((f) => ({ ...f, imageId: media.id }));
          setVariantImagePreviewUrl(media.url);
          setVariantImagePickerOpen(false);
        }}
        selectedId={variantForm.imageId}
        imagesOnly
      />
    </>
  );
};
