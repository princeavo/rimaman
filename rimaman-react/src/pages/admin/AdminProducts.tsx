import { toast } from '../../store/toastStore';
import { showConfirm } from '../../store/confirmStore';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../../components/common/Icon';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchMediaLibrary } from '../../api/media';
import type { BackendProduct } from '../../api/backend-types';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductInput,
} from '../../api/products';
import { apiClient } from '../../api/client';

const EMPTY_FORM: ProductInput = {
  name: '',
  description: '',
  price: 0,
  weight: '',
  category: 'farine',
  features: [],
  isBestseller: false,
  imageId: undefined,
};

export const AdminProducts: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: products, loading, error } = useAsyncData(
    () => apiClient.get<BackendProduct[]>('/products'),
    [refreshKey],
  );
  const { data: mediaList } = useAsyncData(fetchMediaLibrary, []);

  const [editingProduct, setEditingProduct] = useState<BackendProduct | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<ProductInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [featureInput, setFeatureInput] = useState('');

  const openNew = () => {
    setForm(EMPTY_FORM);
    setIsNew(true);
    setEditingProduct(null);
  };

  const openEdit = (p: BackendProduct) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      weight: p.weight,
      category: p.category,
      features: [...p.features],
      isBestseller: p.isBestseller,
      imageId: p.image?.id,
    });
    setIsNew(false);
    setEditingProduct(p);
  };

  const closeModal = () => { setEditingProduct(null); setIsNew(false); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        await createProduct(form);
      } else if (editingProduct) {
        await updateProduct(editingProduct.id, form);
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

  const addFeature = () => {
    const f = featureInput.trim();
    if (f && !form.features.includes(f)) {
      setForm((p) => ({ ...p, features: [...p.features, f] }));
      setFeatureInput('');
    }
  };

  const showModal = isNew || editingProduct !== null;

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
            {(products ?? []).map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-outline-variant flex items-center gap-4 px-5 py-4">
                {p.image && (
                  <img src={p.image.url} alt={p.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface">{p.name}</p>
                  <p className="text-sm text-on-surface-variant">{p.weight} &middot; {p.price.toLocaleString()} FCFA{p.isBestseller ? ' · Bestseller' : ''}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(p)}
                    className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant sticky top-0 bg-white">
              <h2 className="font-bold text-on-surface">{isNew ? 'Nouveau produit' : 'Modifier le produit'}</h2>
              <button onClick={closeModal} className="p-1 text-on-surface-variant hover:text-on-surface">
                <Icon name="close" size="sm" />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Image</label>
                <select
                  value={form.imageId ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, imageId: e.target.value || undefined }))}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">— Aucune image —</option>
                  {(mediaList ?? [])
                    .filter((m) => m.mimeType.startsWith('image'))
                    .map((m) => (
                      <option key={m.id} value={m.id}>{m.alt || m.url.split('/').pop()}</option>
                    ))}
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Nom *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Prix (FCFA) *</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Poids/Format *</label>
                  <input
                    required
                    type="text"
                    placeholder="1kg"
                    value={form.weight}
                    onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Caractéristiques</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                    placeholder="Appuyer sur Entrée pour ajouter"
                    className="flex-1 px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary"
                  />
                  <button type="button" onClick={addFeature} className="px-3 py-2 bg-surface-container rounded-xl text-sm hover:bg-surface-container-high">
                    <Icon name="add" size="sm" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.features.map((f) => (
                    <span key={f} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full">
                      {f}
                      <button type="button" onClick={() => setForm((p) => ({ ...p, features: p.features.filter((x) => x !== f) }))}>
                        <Icon name="close" size="sm" />
                      </button>
                    </span>
                  ))}
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

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm rounded-xl border border-outline-variant hover:bg-surface-container transition-colors">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {saving && <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />}
                  {isNew ? 'Créer' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
