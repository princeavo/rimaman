import { toast } from '../../store/toastStore';
import { showConfirm } from '../../store/confirmStore';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon } from '../../components/common/Icon';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Combobox } from '../../components/common/Combobox';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';
import { useAsyncData } from '../../hooks/useAsyncData';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGalleryItems,
} from '../../api/gallery';
import type { BackendGalleryCategory, BackendGalleryItem } from '../../api/backend-types';
import type { Media } from '../../api/media';

// ── Carte média sortable ───────────────────────────────────────────────────────

const SortableCard: React.FC<{
  item: BackendGalleryItem;
  onEdit: (item: BackendGalleryItem) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}> = ({ item, onEdit, onDelete, isDeleting }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 10 : undefined,
  };
  const thumb = item.media.thumbnailUrl ?? item.media.url;
  const isVideo = item.media.mimeType.startsWith('video/');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-white rounded-xl overflow-hidden border border-outline-variant"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 w-7 h-7 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center cursor-grab active:cursor-grabbing text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        title="Glisser pour réordonner"
      >
        <Icon name="drag_indicator" size="sm" />
      </div>

      <div className="aspect-square relative">
        <img
          src={thumb}
          alt={item.media.alt || item.category.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
              <Icon name="play_arrow" size="sm" className="text-primary" />
            </div>
          </div>
        )}
      </div>

      {item.media.alt && (
        <div className="px-3 py-2">
          <p className="text-xs text-on-surface-variant line-clamp-1">{item.media.alt}</p>
        </div>
      )}

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(item)}
          className="w-7 h-7 rounded-lg bg-white shadow flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          title="Modifier"
        >
          <Icon name="edit" size="sm" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          disabled={isDeleting}
          className="w-7 h-7 rounded-lg bg-white shadow flex items-center justify-center text-error hover:bg-error/10 transition-colors disabled:opacity-50"
          title="Supprimer"
        >
          {isDeleting
            ? <span className="w-3 h-3 border-2 border-error/30 border-t-error rounded-full animate-spin" />
            : <Icon name="delete" size="sm" />}
        </button>
      </div>
    </div>
  );
};

// ── Groupe catégorie (avec DnD interne + renommer/supprimer) ──────────────────

const CategoryGroup: React.FC<{
  category: BackendGalleryCategory;
  localItems: BackendGalleryItem[];
  onEdit: (item: BackendGalleryItem) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
  onItemDragEnd: (event: DragEndEvent, categoryId: string) => void;
  onRenameCategory: (id: string, newName: string) => Promise<void>;
  onDeleteCategory: (id: string, name: string, count: number) => Promise<void>;
  deletingCatId: string | null;
  sensors: ReturnType<typeof useSensors>;
}> = ({
  category,
  localItems,
  onEdit,
  onDelete,
  deletingId,
  onItemDragEnd,
  onRenameCategory,
  onDeleteCategory,
  deletingCatId,
  sensors,
}) => {
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(category.name);
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleRename = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === category.name) { setRenaming(false); return; }
    setSaving(true);
    try {
      await onRenameCategory(category.id, trimmed);
    } finally {
      setSaving(false);
      setRenaming(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-outline-variant bg-surface-container-low">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <Icon name={collapsed ? 'chevron_right' : 'expand_more'} size="sm" />
        </button>

        {renaming ? (
          <input
            autoFocus
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') { setRenaming(false); setRenameValue(category.name); }
            }}
            onBlur={handleRename}
            className="flex-1 px-3 py-1 rounded-lg border border-primary text-sm font-medium focus:outline-none"
          />
        ) : (
          <span className="flex-1 font-semibold text-on-surface text-sm">
            {category.name}
            <span className="ml-2 text-xs font-normal text-on-surface-variant">
              {localItems.length} {localItems.length === 1 ? 'média' : 'médias'}
            </span>
          </span>
        )}

        {renaming ? (
          <div className="flex gap-1">
            <button
              onClick={handleRename}
              disabled={saving}
              className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {saving
                ? <span className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin block" />
                : <Icon name="check" size="sm" />}
            </button>
            <button
              onClick={() => { setRenaming(false); setRenameValue(category.name); }}
              className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
            >
              <Icon name="close" size="sm" />
            </button>
          </div>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={() => setRenaming(true)}
              className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
              title="Renommer la catégorie"
            >
              <Icon name="edit" size="sm" />
            </button>
            <button
              onClick={() => onDeleteCategory(category.id, category.name, localItems.length)}
              disabled={deletingCatId === category.id}
              className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors disabled:opacity-50"
              title="Supprimer la catégorie et tous ses médias"
            >
              {deletingCatId === category.id
                ? <span className="w-3.5 h-3.5 border-2 border-error/30 border-t-error rounded-full animate-spin block" />
                : <Icon name="delete" size="sm" />}
            </button>
          </div>
        )}
      </div>

      {/* Grille DnD */}
      {!collapsed && (
        <div className="p-4">
          {localItems.length === 0 ? (
            <p className="text-center text-sm text-on-surface-variant py-4">Aucun média.</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => onItemDragEnd(e, category.id)}
            >
              <SortableContext items={localItems.map((i) => i.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {localItems.map((item) => (
                    <SortableCard
                      key={item.id}
                      item={item}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isDeleting={deletingId === item.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
};

// ── Composant principal ────────────────────────────────────────────────────────

interface FormState {
  mediaId: string;
  categoryId: string;
  sortOrder: number;
}

const EMPTY_FORM: FormState = { mediaId: '', categoryId: '', sortOrder: 0 };

export const AdminGallery: React.FC = () => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // Source primaire : catégories avec leurs items
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: serverCats, loading, error } = useAsyncData(fetchCategories, [refreshKey]);
  const [localCats, setLocalCats] = useState<BackendGalleryCategory[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    if (serverCats) setLocalCats(serverCats);
  }, [serverCats]);

  const refresh = () => setRefreshKey((k) => k + 1);

  // ── Modal ajout/édition d'un item ──────────────────────────────────────────
  const [editing, setEditing] = useState<BackendGalleryItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Médiathèque ────────────────────────────────────────────────────────────
  const [mediaOpen, setMediaOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  // ── Suppression de catégorie ───────────────────────────────────────────────
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  // ── Handlers items ─────────────────────────────────────────────────────────

  const totalItems = localCats.reduce((sum, c) => sum + c.items.length, 0);

  const openNew = () => {
    setForm({ ...EMPTY_FORM, sortOrder: totalItems });
    setSelectedMedia(null);
    setIsNew(true);
    setEditing(null);
  };

  const openEdit = (item: BackendGalleryItem) => {
    setForm({ mediaId: item.mediaId, categoryId: item.categoryId, sortOrder: item.sortOrder });
    setSelectedMedia(item.media);
    setIsNew(false);
    setEditing(item);
  };

  const closeModal = () => {
    setEditing(null);
    setIsNew(false);
    setSelectedMedia(null);
  };

  const handleCreateCatInline = async (name: string) => {
    try {
      const created = await createCategory(name.trim());
      refresh();
      setForm((p) => ({ ...p, categoryId: created.id }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mediaId) { toast.error('Veuillez choisir un média.'); return; }
    if (!form.categoryId) { toast.error('Veuillez choisir une catégorie.'); return; }
    setSaving(true);
    try {
      if (isNew) await createGalleryItem(form);
      else if (editing) await updateGalleryItem(editing.id, form);
      toast.success(isNew ? 'Média ajouté.' : 'Média mis à jour.');
      refresh();
      closeModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!await showConfirm('Ce média sera supprimé de la galerie définitivement.', 'Supprimer le média ?')) return;
    setDeletingId(id);
    try {
      await deleteGalleryItem(id);
      toast.success('Média supprimé.');
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de supprimer.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Drag items dans une catégorie ──────────────────────────────────────────

  const handleItemDragEnd = async (event: DragEndEvent, categoryId: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const cat = localCats.find((c) => c.id === categoryId);
    if (!cat) return;

    const oldIndex = cat.items.findIndex((i) => i.id === active.id);
    const newIndex = cat.items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedItems = arrayMove(cat.items, oldIndex, newIndex);
    setLocalCats((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, items: reorderedItems } : c)),
    );

    setIsSavingOrder(true);
    try {
      await reorderGalleryItems(
        reorderedItems.map((item, index) => ({ id: item.id, sortOrder: index })),
      );
      refresh();
    } catch {
      setLocalCats(serverCats ?? []);
      toast.error("Erreur lors de la sauvegarde de l'ordre.");
    } finally {
      setIsSavingOrder(false);
    }
  };

  // ── Handlers catégories ────────────────────────────────────────────────────

  const handleRenameCategory = async (id: string, newName: string) => {
    await updateCategory(id, { name: newName });
    refresh();
  };

  const handleDeleteCategory = async (id: string, name: string, count: number) => {
    const msg = count === 0
      ? `Supprimer la catégorie "${name}" ?`
      : count === 1
        ? `Supprimer la catégorie "${name}" et son 1 média ?`
        : `Supprimer la catégorie "${name}" et ses ${count} médias ?`;
    if (!await showConfirm(msg, 'Supprimer la catégorie ?')) return;
    setDeletingCatId(id);
    try {
      await deleteCategory(id);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de supprimer.');
    } finally {
      setDeletingCatId(null);
    }
  };

  // ── Drag catégories ────────────────────────────────────────────────────────

  const handleCatDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localCats.findIndex((c) => c.id === active.id);
    const newIndex = localCats.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(localCats, oldIndex, newIndex);
    setLocalCats(reordered);

    setIsSavingOrder(true);
    try {
      await reorderCategories(
        reordered.map((cat, index) => ({ id: cat.id, sortOrder: index })),
      );
      refresh();
    } catch {
      setLocalCats(serverCats ?? []);
      toast.error("Erreur lors de la sauvegarde de l'ordre des catégories.");
    } finally {
      setIsSavingOrder(false);
    }
  };


  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Helmet><title>Galerie | Admin RIMAMAN</title></Helmet>

      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-headline text-on-surface">Galerie</h1>
            {!loading && (
              <p className="text-sm text-on-surface-variant mt-0.5">
                {localCats.length} {localCats.length === 1 ? 'catégorie' : 'catégories'}
                {' · '}{totalItems} {totalItems === 1 ? 'média' : 'médias'}
              </p>
            )}
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <Icon name="add" size="sm" />
            Ajouter un média
          </button>
        </div>

        {isSavingOrder && (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Sauvegarde de l'ordre…
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : error ? (
          <p className="text-center text-error py-12">Impossible de charger la galerie.</p>
        ) : localCats.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant">
            <Icon name="photo_library" size="xl" className="text-on-surface-variant mb-4" />
            <p className="text-on-surface-variant mb-1 font-medium">Galerie vide</p>
            <p className="text-sm text-on-surface-variant mb-6">
              Cliquez sur "Ajouter un média", choisissez un fichier dans la médiathèque,
              puis créez ou sélectionnez une catégorie.
            </p>
            <button
              onClick={openNew}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Ajouter le premier média
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-on-surface-variant mb-3 flex items-center gap-1.5">
              <Icon name="drag_indicator" size="sm" />
              Glissez les catégories ou les photos pour réordonner.
            </p>

            {/* Drag des catégories */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleCatDragEnd}
            >
              <SortableContext items={localCats.map((c) => c.id)} strategy={rectSortingStrategy}>
                <div className="space-y-4">
                  {localCats.map((cat) => (
                    <CategoryGroup
                      key={cat.id}
                      category={cat}
                      localItems={cat.items}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      deletingId={deletingId}
                      onItemDragEnd={handleItemDragEnd}
                      onRenameCategory={handleRenameCategory}
                      onDeleteCategory={handleDeleteCategory}
                      deletingCatId={deletingCatId}
                      sensors={sensors}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
      </div>

      {/* ── Modal ajout / modification d'un item ── */}
      {(isNew || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant sticky top-0 bg-white z-10">
              <h2 className="font-bold text-on-surface">
                {isNew ? 'Ajouter un média' : 'Modifier le média'}
              </h2>
              <button onClick={closeModal} className="p-1 text-on-surface-variant hover:text-on-surface">
                <Icon name="close" size="sm" />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-5">

              {/* Sélecteur de média */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Photo ou vidéo *
                </label>
                {selectedMedia ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant bg-surface-container-low">
                    <img
                      src={selectedMedia.thumbnailUrl ?? selectedMedia.url}
                      alt={selectedMedia.alt}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">
                        {selectedMedia.alt || 'Sans titre'}
                      </p>
                      <p className="text-xs text-on-surface-variant">{selectedMedia.mimeType}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMediaOpen(true)}
                      className="flex-shrink-0 text-xs text-primary hover:underline"
                    >
                      Changer
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMediaOpen(true)}
                    className="w-full py-10 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant hover:border-primary hover:text-primary transition-colors flex flex-col items-center gap-2"
                  >
                    <Icon name="add_photo_alternate" />
                    <span className="text-sm">Choisir dans la médiathèque</span>
                    <span className="text-xs opacity-60">Photos et vidéos acceptées</span>
                  </button>
                )}
              </div>

              {/* Sélecteur de catégorie */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Catégorie *
                </label>
                <Combobox
                  options={localCats.map((c) => ({ value: c.id, label: c.name }))}
                  value={form.categoryId}
                  onChange={(v) => setForm((p) => ({ ...p, categoryId: v }))}
                  placeholder="Choisir une catégorie…"
                  onCreate={handleCreateCatInline}
                  createLabel="Créer la catégorie"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
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
                  {saving && (
                    <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  )}
                  {isNew ? 'Ajouter' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Sélecteur de média ── */}
      <MediaPickerModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(media) => {
          setForm((p) => ({ ...p, mediaId: media.id }));
          setSelectedMedia(media);
        }}
        selectedId={form.mediaId}
      />
    </>
  );
};
