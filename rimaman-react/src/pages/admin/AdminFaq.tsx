import { toast } from '../../store/toastStore';
import { showConfirm } from '../../store/confirmStore';
import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon } from '../../components/common/Icon';
import { Combobox } from '../../components/common/Combobox';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAsyncData } from '../../hooks/useAsyncData';
import {
  fetchFaqCategoriesFull,
  createFaqCategory,
  updateFaqCategory,
  deleteFaqCategory,
  reorderFaqCategories,
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,
  reorderFaqItems,
} from '../../api/faq';
import type { BackendFaqCategory, BackendFaqItem } from '../../api/backend-types';

// ── Icônes disponibles ────────────────────────────────────────────────────────

const ICON_OPTIONS = [
  { value: 'help',              label: 'Aide' },
  { value: 'inventory_2',       label: 'Produit' },
  { value: 'restaurant_menu',   label: 'Cuisine' },
  { value: 'local_shipping',    label: 'Livraison' },
  { value: 'health_and_safety', label: 'Santé' },
  { value: 'payments',          label: 'Paiement' },
  { value: 'eco',               label: 'Écologie' },
  { value: 'star',              label: 'Étoile' },
  { value: 'info',              label: 'Info' },
  { value: 'storefront',        label: 'Boutique' },
];

// ── Carte FAQ sortable ────────────────────────────────────────────────────────

function SortableFaqCard({
  item,
  onEdit,
  onDelete,
  deleting,
}: {
  item: BackendFaqItem;
  onEdit: (item: BackendFaqItem) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`bg-white rounded-xl border border-outline-variant px-5 py-4 flex gap-3 items-start ${isDragging ? 'opacity-50 shadow-xl' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 p-1 text-on-surface-variant/40 hover:text-on-surface-variant cursor-grab active:cursor-grabbing flex-shrink-0"
      >
        <Icon name="drag_indicator" size="sm" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-on-surface text-sm">{item.question}</p>
        <p className="text-on-surface-variant text-sm mt-1 line-clamp-2">{item.answer}</p>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(item)}
          className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
        >
          <Icon name="edit" size="sm" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          disabled={deleting}
          className="p-2 rounded-lg hover:bg-error/10 text-error transition-colors disabled:opacity-50"
        >
          <Icon name="delete" size="sm" />
        </button>
      </div>
    </div>
  );
}

// ── Groupe catégorie sortable ─────────────────────────────────────────────────

function SortableCategoryGroup({
  cat,
  setLocalCats,
  onRename,
  onChangeIcon,
  onDeleteCat,
  onAddItem,
  onEditItem,
  onDeleteItem,
  deletingItemId,
}: {
  cat: BackendFaqCategory;
  setLocalCats: React.Dispatch<React.SetStateAction<BackendFaqCategory[]>>;
  onRename: (id: string, name: string) => void;
  onChangeIcon: (id: string, icon: string) => void;
  onDeleteCat: (id: string, name: string, count: number) => void;
  onAddItem: (categoryId: string) => void;
  onEditItem: (item: BackendFaqItem) => void;
  onDeleteItem: (id: string, categoryId: string) => void;
  deletingItemId: string | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(cat.name);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cat.id,
  });

  const innerSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const commitRename = () => {
    setRenaming(false);
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== cat.name) onRename(cat.id, trimmed);
    else setNameInput(cat.name);
  };

  const handleItemDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLocalCats((prev) =>
      prev.map((c) => {
        if (c.id !== cat.id) return c;
        const oldIdx = c.items.findIndex((i) => i.id === active.id);
        const newIdx = c.items.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(c.items, oldIdx, newIdx).map((item, idx) => ({
          ...item,
          sortOrder: idx,
        }));
        reorderFaqItems(reordered.map((i, idx) => ({ id: i.id, sortOrder: idx }))).catch(() => {});
        return { ...c, items: reordered };
      }),
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`bg-surface-container-low rounded-2xl border border-outline-variant overflow-hidden ${isDragging ? 'opacity-50 shadow-2xl' : ''}`}
    >
      {/* En-tête catégorie */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant bg-white">
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-on-surface-variant/40 hover:text-on-surface-variant cursor-grab active:cursor-grabbing flex-shrink-0"
        >
          <Icon name="drag_indicator" size="sm" />
        </button>

        <select
          value={cat.icon}
          onChange={(e) => onChangeIcon(cat.id, e.target.value)}
          className="text-sm border-none bg-transparent focus:outline-none text-on-surface-variant cursor-pointer"
          title="Changer l'icône"
        >
          {ICON_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {renaming ? (
          <input
            autoFocus
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') { setRenaming(false); setNameInput(cat.name); }
            }}
            className="flex-1 font-semibold text-on-surface bg-surface-container rounded-lg px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        ) : (
          <button
            onClick={() => setRenaming(true)}
            className="flex-1 text-left font-semibold text-on-surface text-sm hover:text-primary transition-colors"
          >
            {cat.name}
            <span className="ml-2 text-xs font-normal text-on-surface-variant">
              {cat.items.length} question{cat.items.length !== 1 ? 's' : ''}
            </span>
          </button>
        )}

        <button
          onClick={() => onAddItem(cat.id)}
          className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors flex-shrink-0"
          title="Ajouter une question"
        >
          <Icon name="add" size="sm" />
        </button>
        <button
          onClick={() => onDeleteCat(cat.id, cat.name, cat.items.length)}
          className="p-1.5 rounded-lg text-error hover:bg-error/10 transition-colors flex-shrink-0"
          title="Supprimer la catégorie"
        >
          <Icon name="delete" size="sm" />
        </button>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors flex-shrink-0"
        >
          <Icon name={collapsed ? 'expand_more' : 'expand_less'} size="sm" />
        </button>
      </div>

      {/* Items */}
      {!collapsed && (
        <div className="p-3 space-y-2">
          {cat.items.length === 0 ? (
            <button
              onClick={() => onAddItem(cat.id)}
              className="w-full py-6 text-sm text-on-surface-variant border-2 border-dashed border-outline-variant rounded-xl hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Icon name="add" size="sm" className="inline mr-1" />
              Ajouter une question
            </button>
          ) : (
            <DndContext sensors={innerSensors} collisionDetection={closestCenter} onDragEnd={handleItemDragEnd}>
              <SortableContext items={cat.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                {cat.items.map((item) => (
                  <SortableFaqCard
                    key={item.id}
                    item={item}
                    onEdit={onEditItem}
                    onDelete={(id) => onDeleteItem(id, cat.id)}
                    deleting={deletingItemId === item.id}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

type ItemForm = { categoryId: string; question: string; answer: string };
const EMPTY_FORM: ItemForm = { categoryId: '', question: '', answer: '' };

export const AdminFaq: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: serverCats, loading, error } = useAsyncData(fetchFaqCategoriesFull, [refreshKey]);
  const [localCats, setLocalCats] = useState<BackendFaqCategory[]>([]);

  React.useEffect(() => {
    if (serverCats) setLocalCats(serverCats);
  }, [serverCats]);

  const [itemModal, setItemModal] = useState<{ open: boolean; editing: BackendFaqItem | null }>({
    open: false,
    editing: null,
  });
  const [itemForm, setItemForm] = useState<ItemForm>(EMPTY_FORM);
  const [savingItem, setSavingItem] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const [catModal, setCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', icon: 'help' });
  const [savingCat, setSavingCat] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const refresh = () => setRefreshKey((k) => k + 1);

  // ── Catégories ──────────────────────────────────────────────────────────────

  const handleRenameCategory = async (id: string, name: string) => {
    try {
      await updateFaqCategory(id, { name });
      setLocalCats((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
      refresh();
    }
  };

  const handleChangeIcon = async (id: string, icon: string) => {
    setLocalCats((prev) => prev.map((c) => (c.id === id ? { ...c, icon } : c)));
    try {
      await updateFaqCategory(id, { icon });
    } catch { refresh(); }
  };

  const handleDeleteCategory = async (id: string, name: string, count: number) => {
    const msg =
      count > 0
        ? `Supprimer "${name}" et ses ${count} question(s) ? Cette action est irréversible.`
        : `Supprimer la catégorie "${name}" ?`;
    if (!await showConfirm(msg, 'Supprimer la catégorie ?')) return;
    try {
      await deleteFaqCategory(id);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de supprimer.');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCat(true);
    try {
      await createFaqCategory(catForm);
      toast.success('Catégorie créée.');
      setCatModal(false);
      setCatForm({ name: '', icon: 'help' });
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setSavingCat(false);
    }
  };

  const handleCatDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = localCats.findIndex((c) => c.id === active.id);
    const newIdx = localCats.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(localCats, oldIdx, newIdx).map((c, idx) => ({
      ...c,
      sortOrder: idx,
    }));
    setLocalCats(reordered);
    reorderFaqCategories(reordered.map((c, idx) => ({ id: c.id, sortOrder: idx }))).catch(() =>
      refresh(),
    );
  };

  // ── Questions ───────────────────────────────────────────────────────────────

  const openNewItem = (categoryId: string) => {
    setItemForm({ ...EMPTY_FORM, categoryId });
    setItemModal({ open: true, editing: null });
  };

  const openEditItem = (item: BackendFaqItem) => {
    setItemForm({ categoryId: item.categoryId, question: item.question, answer: item.answer });
    setItemModal({ open: true, editing: item });
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingItem(true);
    try {
      if (itemModal.editing) {
        await updateFaqItem(itemModal.editing.id, itemForm);
        toast.success('Question mise à jour.');
      } else {
        await createFaqItem(itemForm);
        toast.success('Question créée.');
      }
      setItemModal({ open: false, editing: null });
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (id: string, categoryId: string) => {
    if (!await showConfirm('Cette question sera supprimée définitivement.', 'Supprimer la question ?')) return;
    setDeletingItemId(id);
    try {
      await deleteFaqItem(id);
      setLocalCats((prev) =>
        prev.map((c) =>
          c.id === categoryId ? { ...c, items: c.items.filter((i) => i.id !== id) } : c,
        ),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de supprimer.');
      refresh();
    } finally {
      setDeletingItemId(null);
    }
  };

  const totalItems = useMemo(
    () => localCats.reduce((s, c) => s + c.items.length, 0),
    [localCats],
  );

  return (
    <>
      <Helmet><title>FAQ | Admin RIMAMAN</title></Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-headline text-on-surface">FAQ</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">
              {localCats.length} catégorie{localCats.length !== 1 ? 's' : ''} · {totalItems}{' '}
              question{totalItems !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setCatModal(true)}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <Icon name="add" size="sm" />
            Nouvelle catégorie
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <p className="text-center text-error py-12">Impossible de charger la FAQ.</p>
        ) : localCats.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-outline-variant rounded-2xl">
            <Icon name="quiz" size="xl" className="text-on-surface-variant mb-4" />
            <p className="text-on-surface-variant mb-4">
              Aucune catégorie. Commencez par en créer une.
            </p>
            <button
              onClick={() => setCatModal(true)}
              className="bg-primary text-on-primary px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Créer une catégorie
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleCatDragEnd}
          >
            <SortableContext
              items={localCats.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {localCats.map((cat) => (
                  <SortableCategoryGroup
                    key={cat.id}
                    cat={cat}
                    setLocalCats={setLocalCats}
                    onRename={handleRenameCategory}
                    onChangeIcon={handleChangeIcon}
                    onDeleteCat={handleDeleteCategory}
                    onAddItem={openNewItem}
                    onEditItem={openEditItem}
                    onDeleteItem={handleDeleteItem}
                    deletingItemId={deletingItemId}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* ── Modal nouvelle catégorie ── */}
      {catModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
              <h2 className="font-bold text-on-surface">Nouvelle catégorie</h2>
              <button
                onClick={() => setCatModal(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface"
              >
                <Icon name="close" size="sm" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Nom *</label>
                <input
                  required
                  autoFocus
                  value={catForm.name}
                  onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary"
                  placeholder="Ex : Livraison & Commande"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Icône</label>
                <select
                  value={catForm.icon}
                  onChange={(e) => setCatForm((p) => ({ ...p, icon: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary"
                >
                  {ICON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label} ({o.value})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCatModal(false)}
                  className="px-4 py-2 text-sm rounded-xl border border-outline-variant hover:bg-surface-container transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingCat}
                  className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {savingCat && (
                    <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  )}
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal question ── */}
      {itemModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
              <h2 className="font-bold text-on-surface">
                {itemModal.editing ? 'Modifier la question' : 'Nouvelle question'}
              </h2>
              <button
                onClick={() => setItemModal({ open: false, editing: null })}
                className="p-1 text-on-surface-variant hover:text-on-surface"
              >
                <Icon name="close" size="sm" />
              </button>
            </div>
            <form onSubmit={handleSaveItem} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Catégorie</label>
                <Combobox
                  options={localCats.map((c) => ({ value: c.id, label: c.name }))}
                  value={itemForm.categoryId}
                  onChange={(v) => setItemForm((p) => ({ ...p, categoryId: v }))}
                  placeholder="Choisir une catégorie…"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Question *</label>
                <input
                  required
                  value={itemForm.question}
                  onChange={(e) => setItemForm((p) => ({ ...p, question: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Réponse *</label>
                <textarea
                  required
                  rows={5}
                  value={itemForm.answer}
                  onChange={(e) => setItemForm((p) => ({ ...p, answer: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setItemModal({ open: false, editing: null })}
                  className="px-4 py-2 text-sm rounded-xl border border-outline-variant hover:bg-surface-container transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {savingItem && (
                    <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  )}
                  {itemModal.editing ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
