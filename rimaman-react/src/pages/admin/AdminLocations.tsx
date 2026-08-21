import { toast } from '../../store/toastStore';
import { showConfirm } from '../../store/confirmStore';
import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../../components/common/Icon';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAsyncData } from '../../hooks/useAsyncData';
import {
  createLocation,
  updateLocation,
  deleteLocation,
  type LocationInput,
} from '../../api/locations';
import {
  fetchLocationTypes,
  createLocationType,
  deleteLocationType,
  type LocationType,
} from '../../api/location-types';
import type { BackendLocation } from '../../api/backend-types';
import { apiClient } from '../../api/client';
import { CoordPickerMap } from '../../components/admin/CoordPickerMap';


const EMPTY: LocationInput = { name: '', type: '', latitude: 0, longitude: 0, address: '' };

export const AdminLocations: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [typesRefreshKey, setTypesRefreshKey] = useState(0);

  const { data: locations, loading, error } = useAsyncData(
    () => apiClient.get<BackendLocation[]>('/locations'),
    [refreshKey],
  );
  const { data: locationTypes, loading: typesLoading } = useAsyncData(
    fetchLocationTypes,
    [typesRefreshKey],
  );

  const [editing, setEditing] = useState<BackendLocation | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<LocationInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Types management
  const [newTypeLabel, setNewTypeLabel] = useState('');
  const [addingType, setAddingType] = useState(false);
  const [deletingTypeId, setDeletingTypeId] = useState<string | null>(null);
  const newTypeInputRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    const firstType = locationTypes?.[0]?.label ?? '';
    setForm({ ...EMPTY, type: firstType });
    setIsNew(true);
    setEditing(null);
  };
  const openEdit = (loc: BackendLocation) => {
    setForm({
      name: loc.name,
      type: loc.type,
      latitude: loc.latitude,
      longitude: loc.longitude,
      address: loc.address ?? '',
    });
    setIsNew(false);
    setEditing(loc);
  };
  const closeModal = () => { setEditing(null); setIsNew(false); };

  const handleSuggestionSelect = (name: string, address: string) => {
    setForm((p) => ({
      ...p,
      name: p.name.trim() === '' ? name : p.name,
      address,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.latitude === 0 && form.longitude === 0) {
      toast.error('Veuillez placer le point de vente sur la carte.');
      return;
    }
    setSaving(true);
    try {
      if (isNew) await createLocation(form);
      else if (editing) await updateLocation(editing.id, form);
      setRefreshKey((k) => k + 1);
      closeModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!await showConfirm('Ce point de vente sera supprimé définitivement.', 'Supprimer ?')) return;
    setDeletingId(id);
    try {
      await deleteLocation(id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de supprimer.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = newTypeLabel.trim();
    if (!label) return;
    setAddingType(true);
    try {
      await createLocationType(label);
      setNewTypeLabel('');
      setTypesRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setAddingType(false);
    }
  };

  const handleDeleteType = async (type: LocationType) => {
    if (!await showConfirm(`Le type "${type.label}" sera supprimé.`, 'Supprimer ce type ?')) return;
    setDeletingTypeId(type.id);
    try {
      await deleteLocationType(type.id);
      setTypesRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de supprimer.');
    } finally {
      setDeletingTypeId(null);
    }
  };

  return (
    <>
      <Helmet><title>Points de vente | Admin RIMAMAN</title></Helmet>

      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Liste des points de vente ── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold font-headline text-on-surface">Points de vente</h1>
            <button
              onClick={openNew}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              <Icon name="add" size="sm" />
              Ajouter un point
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : error ? (
            <p className="text-center text-error py-12">Impossible de charger les points de vente.</p>
          ) : (
            <div className="space-y-2">
              {(locations ?? []).length === 0 && (
                <p className="text-center text-on-surface-variant py-12">Aucun point de vente.</p>
              )}
              {(locations ?? []).map((loc) => (
                <div key={loc.id} className="bg-white rounded-xl border border-outline-variant flex items-center gap-4 px-5 py-3">
                  <Icon name="location_on" className="text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-on-surface">{loc.name}</p>
                    <p className="text-sm text-on-surface-variant">
                      {loc.type}
                      {loc.address ? ` · ${loc.address}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(loc)}
                      className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      onClick={() => handleDelete(loc.id)}
                      disabled={deletingId === loc.id}
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

        {/* ── Gestion des types ── */}
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-6">
          <h2 className="font-bold text-on-surface mb-1">Types de points de vente</h2>
          <p className="text-sm text-on-surface-variant mb-4">
            Ces types apparaissent dans le formulaire d'ajout et dans les popups de la carte.
          </p>

          {typesLoading ? (
            <div className="flex justify-center py-4"><LoadingSpinner size="sm" /></div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {(locationTypes ?? []).length === 0 && (
                <p className="text-sm text-on-surface-variant">Aucun type défini.</p>
              )}
              {(locationTypes ?? []).map((type) => (
                <span
                  key={type.id}
                  className="flex items-center gap-1.5 bg-white border border-outline-variant rounded-full px-3 py-1 text-sm font-medium text-on-surface"
                >
                  {type.label}
                  <button
                    onClick={() => handleDeleteType(type)}
                    disabled={deletingTypeId === type.id}
                    className="text-on-surface-variant hover:text-error transition-colors disabled:opacity-40"
                    aria-label={`Supprimer ${type.label}`}
                  >
                    <Icon name="close" size="sm" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <form onSubmit={handleAddType} className="flex gap-2">
            <input
              ref={newTypeInputRef}
              type="text"
              value={newTypeLabel}
              onChange={(e) => setNewTypeLabel(e.target.value)}
              placeholder="Ex : Supermarché"
              className="flex-1 px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={addingType || !newTypeLabel.trim()}
              className="flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {addingType
                ? <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                : <Icon name="add" size="sm" />}
              Ajouter
            </button>
          </form>
        </div>
      </div>

      {/* ── Modal ajout / édition ── */}
      {(isNew || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
              <h2 className="font-bold text-on-surface">
                {isNew ? 'Nouveau point de vente' : 'Modifier'}
              </h2>
              <button onClick={closeModal} className="p-1 text-on-surface-variant hover:text-on-surface">
                <Icon name="close" size="sm" />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Type *</label>
                {(locationTypes ?? []).length > 0 ? (
                  <select
                    required
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary bg-white"
                  >
                    <option value="">— Choisir un type —</option>
                    {(locationTypes ?? []).map((t) => (
                      <option key={t.id} value={t.label}>{t.label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-on-surface-variant py-2">
                    Aucun type disponible — ajoutez-en depuis la section "Types" ci-dessous.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Adresse</label>
                <input
                  type="text"
                  value={form.address ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-on-surface">
                    Localisation sur la carte *
                  </label>
                  {(form.latitude !== 0 || form.longitude !== 0) && (
                    <span className="text-xs text-on-surface-variant font-mono">
                      {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant mb-2">
                  {form.latitude === 0 && form.longitude === 0
                    ? 'Cliquez sur la carte pour placer le marqueur, ou collez une URL Google Maps ci-dessus.'
                    : 'Déplacez le marqueur pour ajuster la position.'}
                </p>
                <CoordPickerMap
                  lat={form.latitude}
                  lng={form.longitude}
                  onCoordsChange={(lat, lng) => setForm((p) => ({ ...p, latitude: lat, longitude: lng }))}
                  onSuggestionSelect={handleSuggestionSelect}
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
