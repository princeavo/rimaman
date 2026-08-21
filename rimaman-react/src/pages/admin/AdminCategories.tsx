import { toast } from '../../store/toastStore';
import { showConfirm } from '../../store/confirmStore';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../../components/common/Icon';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAsyncData } from '../../hooks/useAsyncData';
import {
  fetchProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
} from '../../api/products';
import type { ProductCategory } from '../../types';

const EMPTY = { name: '', icon: 'category', sortOrder: 0 };

export const AdminCategories: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: categories, loading, error } = useAsyncData(
    fetchProductCategories as () => Promise<ProductCategory[]>,
    [refreshKey],
  );

  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openNew = () => {
    setForm({ ...EMPTY, sortOrder: (categories ?? []).length });
    setIsNew(true);
    setEditing(null);
  };

  const openEdit = (cat: ProductCategory) => {
    setForm({ name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder });
    setIsNew(false);
    setEditing(cat);
  };

  const closeModal = () => { setEditing(null); setIsNew(false); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        await createProductCategory(form);
      } else if (editing) {
        await updateProductCategory(editing.id, form);
      }
      setRefreshKey((k) => k + 1);
      closeModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: ProductCategory) => {
    if (!await showConfirm(
      `La catégorie "${cat.name}" sera supprimée. Les produits associés devront être réassignés.`,
      'Supprimer cette catégorie ?',
    )) return;
    setDeletingId(cat.id);
    try {
      await deleteProductCategory(cat.id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de supprimer — des produits y sont peut-être liés.');
    } finally {
      setDeletingId(null);
    }
  };

  const inputCls = 'w-full px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary bg-white';

  return (
    <>
      <Helmet><title>Catégories produit | Admin RIMAMAN</title></Helmet>

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-headline text-on-surface">Catégories produit</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Utilisées pour filtrer et organiser les produits dans la boutique.
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <Icon name="add" size="sm" />
            Nouvelle catégorie
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : error ? (
          <p className="text-center text-error py-12">Impossible de charger les catégories.</p>
        ) : (
          <div className="space-y-2">
            {(categories ?? []).length === 0 && (
              <p className="text-center text-on-surface-variant py-12">Aucune catégorie. Créez-en une ci-dessus.</p>
            )}
            {(categories ?? []).map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-xl border border-outline-variant flex items-center gap-4 px-5 py-3.5"
              >
                <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">
                  {cat.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-on-surface">{cat.name}</p>
                  <p className="text-xs text-on-surface-variant font-mono">icon: {cat.icon} · ordre: {cat.sortOrder}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    disabled={deletingId === cat.id}
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

      {/* ── Modal ── */}
      {(isNew || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
              <h2 className="font-bold text-on-surface">
                {isNew ? 'Nouvelle catégorie' : 'Modifier la catégorie'}
              </h2>
              <button onClick={closeModal} className="p-1 text-on-surface-variant hover:text-on-surface">
                <Icon name="close" size="sm" />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Nom *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex : Farines, Épices…"
                  className={inputCls}
                />
              </div>

              {/* Icône */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Icône{' '}
                  <a
                    href="https://fonts.google.com/icons"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary font-normal hover:underline"
                  >
                    Material Symbols
                  </a>
                </label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl w-10 flex-shrink-0 text-center">
                    {form.icon || 'category'}
                  </span>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value.trim() }))}
                    placeholder="grain"
                    className={`${inputCls} flex-1`}
                  />
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Entrez le nom exact de l'icône (ex: <span className="font-mono">grain</span>, <span className="font-mono">spa</span>, <span className="font-mono">agriculture</span>).
                </p>
              </div>

              {/* Ordre */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Ordre d'affichage</label>
                <input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                  className={inputCls}
                />
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm rounded-xl border border-outline-variant hover:bg-surface-container transition-colors"
                >
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
