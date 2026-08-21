import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../../components/common/Icon';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchSettings, updateSettings } from '../../api/settings';
import type { SiteSettings, SocialLink } from '../../api/settings';
import { BrandIcon, hasBrandIcon } from '../../components/common/BrandIcon';

/* ------------------------------------------------------------------ */
/* Plateformes sociales prédéfinies                                      */
/* ------------------------------------------------------------------ */

const SOCIAL_PLATFORMS = [
  { platform: 'Facebook',    icon: 'facebook',   placeholder: 'https://facebook.com/rimaman' },
  { platform: 'Instagram',   icon: 'instagram',  placeholder: 'https://instagram.com/rimaman' },
  { platform: 'WhatsApp',    icon: 'whatsapp',   placeholder: 'https://wa.me/229...' },
  { platform: 'YouTube',     icon: 'youtube',    placeholder: 'https://youtube.com/@rimaman' },
  { platform: 'TikTok',      icon: 'tiktok',     placeholder: 'https://tiktok.com/@rimaman' },
  { platform: 'LinkedIn',    icon: 'linkedin',   placeholder: 'https://linkedin.com/company/rimaman' },
  { platform: 'Twitter / X', icon: 'twitter',    placeholder: 'https://x.com/rimaman' },
  { platform: 'Telegram',    icon: 'telegram',   placeholder: 'https://t.me/rimaman' },
] as const;

/* ------------------------------------------------------------------ */
/* Champs texte simples                                                  */
/* ------------------------------------------------------------------ */

const BASIC_FIELDS: Array<{
  field: keyof Pick<SiteSettings, 'whatsappNumber' | 'contactEmail' | 'contactPhone' | 'companyAddress'>;
  label: string;
  icon: string;
  placeholder: string;
  hint: string;
}> = [
  { field: 'whatsappNumber', label: 'Numéro WhatsApp', icon: 'chat', placeholder: '+22961000000', hint: 'Format international sans espaces, ex. +22961000000' },
  { field: 'contactEmail', label: 'Email de contact', icon: 'mail', placeholder: 'contact@rimaman.bj', hint: '' },
  { field: 'contactPhone', label: 'Téléphone de contact', icon: 'phone', placeholder: '+22961000000', hint: '' },
  { field: 'companyAddress', label: "Adresse de l'entreprise", icon: 'location_on', placeholder: 'Cotonou, Bénin', hint: '' },
];

/* ------------------------------------------------------------------ */
/* Formulaire principal (reçoit les données chargées en props)          */
/* ------------------------------------------------------------------ */

const SettingsForm: React.FC<{ initial: SiteSettings }> = ({ initial }) => {
  const [form, setForm] = useState<SiteSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  /* Réseau social en cours d'édition (-1 = nouveau) */
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [socialDraft, setSocialDraft] = useState<SocialLink>({ platform: '', icon: '', url: '' });

  const setField = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /* ---- réseaux sociaux ---- */

  const openNew = () => {
    setSocialDraft({ platform: '', icon: '', url: '' });
    setEditingIdx(-1);
  };

  const openEdit = (idx: number) => {
    setSocialDraft({ ...form.socialLinks[idx] });
    setEditingIdx(idx);
  };

  const cancelEdit = () => setEditingIdx(null);

  const saveLink = () => {
    if (!socialDraft.platform || !socialDraft.icon || !socialDraft.url) return;
    const links = [...form.socialLinks];
    if (editingIdx === -1) {
      links.push(socialDraft);
    } else if (editingIdx !== null) {
      links[editingIdx] = socialDraft;
    }
    setField('socialLinks', links);
    setEditingIdx(null);
  };

  const removeLink = (idx: number) => {
    setField('socialLinks', form.socialLinks.filter((_, i) => i !== idx));
  };

  /* ---- soumission ---- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await updateSettings(form);
      setForm(saved);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Champs de base */}
      <div className="bg-white rounded-2xl border border-outline-variant p-8 space-y-5">
        <h2 className="text-lg font-semibold text-on-surface">Informations de contact</h2>
        {BASIC_FIELDS.map(({ field, label, icon, placeholder, hint }) => (
          <div key={field}>
            <label className="block text-sm font-medium text-on-surface mb-1.5">{label}</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Icon name={icon} size="sm" className="text-on-surface-variant" />
              </div>
              <input
                type="text"
                value={form[field]}
                onChange={(e) => setField(field, e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
            </div>
            {hint && <p className="text-xs text-on-surface-variant mt-1">{hint}</p>}
          </div>
        ))}
      </div>

      {/* Localisation */}
      <div className="bg-white rounded-2xl border border-outline-variant p-8 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-on-surface mb-1">Carte de localisation</h2>
          <p className="text-sm text-on-surface-variant">
            Collez n'importe quel lien Google Maps — lien court{' '}
            <code className="bg-surface-container px-1 rounded text-xs">maps.app.goo.gl/…</code>,
            lien de partage ou URL complète. Les coordonnées sont extraites automatiquement.
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon name="map" size="sm" className="text-on-surface-variant" />
          </div>
          <input
            type="url"
            value={form.mapGoogleUrl ?? ''}
            onChange={(e) => setField('mapGoogleUrl', e.target.value || null)}
            placeholder="https://maps.app.goo.gl/…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
          />
        </div>
        {form.mapLat && form.mapLng ? (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-xl">
            <Icon name="location_on" size="sm" />
            Coordonnées : {form.mapLat.toFixed(5)}, {form.mapLng.toFixed(5)} — carte active sur la page contact.
          </div>
        ) : form.mapGoogleUrl ? (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant bg-surface-container-low px-4 py-3 rounded-xl">
            <Icon name="info" size="sm" />
            Lien détecté — sauvegardez pour extraire les coordonnées.
          </div>
        ) : null}
      </div>

      {/* Réseaux sociaux */}
      <div className="bg-white rounded-2xl border border-outline-variant p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-on-surface">Réseaux sociaux</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Choisissez la plateforme et collez l'URL de votre profil.
            </p>
          </div>
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-1.5 text-sm bg-primary text-on-primary px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Icon name="add" size="sm" />
            Ajouter
          </button>
        </div>

        {/* Liste des liens */}
        {form.socialLinks.length === 0 && editingIdx === null && (
          <p className="text-sm text-on-surface-variant text-center py-4">
            Aucun réseau social configuré.
          </p>
        )}

        <div className="space-y-3">
          {form.socialLinks.map((link, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3"
            >
              <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                {hasBrandIcon(link.icon)
                  ? <BrandIcon name={link.icon} size={18} className="text-on-surface-variant" />
                  : <Icon name={link.icon} size="sm" className="text-on-surface-variant" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface">{link.platform}</p>
                <p className="text-xs text-on-surface-variant truncate">{link.url}</p>
              </div>
              <button
                type="button"
                onClick={() => openEdit(idx)}
                className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
              >
                <Icon name="edit" size="sm" />
              </button>
              <button
                type="button"
                onClick={() => removeLink(idx)}
                className="p-2 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors"
              >
                <Icon name="delete" size="sm" />
              </button>
            </div>
          ))}
        </div>

        {/* Formulaire d'ajout / édition inline */}
        {editingIdx !== null && (
          <div className="bg-surface-container-low rounded-xl p-5 space-y-4 border border-primary/20">
            <p className="text-sm font-semibold text-on-surface">
              {editingIdx === -1 ? 'Nouveau réseau social' : 'Modifier le lien'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sélecteur de plateforme */}
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Plateforme
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={
                      SOCIAL_PLATFORMS.find((p) => p.platform === socialDraft.platform)
                        ? socialDraft.platform
                        : socialDraft.platform
                        ? '__custom__'
                        : ''
                    }
                    onChange={(e) => {
                      const found = SOCIAL_PLATFORMS.find((p) => p.platform === e.target.value);
                      if (found) {
                        setSocialDraft((d) => ({ ...d, platform: found.platform, icon: found.icon }));
                      } else {
                        setSocialDraft((d) => ({ ...d, platform: '', icon: '' }));
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  >
                    <option value="" disabled>Choisir une plateforme…</option>
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p.platform} value={p.platform}>{p.platform}</option>
                    ))}
                    <option value="__custom__">Autre…</option>
                  </select>
                  {socialDraft.icon && (
                    <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                      {hasBrandIcon(socialDraft.icon)
                        ? <BrandIcon name={socialDraft.icon} size={18} className="text-on-surface-variant" />
                        : <Icon name={socialDraft.icon} size="sm" className="text-on-surface-variant" />}
                    </div>
                  )}
                </div>
                {/* Champs libres uniquement si "Autre" */}
                {socialDraft.platform !== '' &&
                  !SOCIAL_PLATFORMS.find((p) => p.platform === socialDraft.platform) && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={socialDraft.platform}
                      onChange={(e) => setSocialDraft((d) => ({ ...d, platform: e.target.value }))}
                      placeholder="Nom de la plateforme"
                      className="px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                    <input
                      type="text"
                      value={socialDraft.icon}
                      onChange={(e) => setSocialDraft((d) => ({ ...d, icon: e.target.value }))}
                      placeholder="Nom icône Material"
                      className="px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                  </div>
                )}
              </div>

              {/* URL du profil */}
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  URL du profil
                </label>
                <input
                  type="url"
                  value={socialDraft.url}
                  onChange={(e) => setSocialDraft((d) => ({ ...d, url: e.target.value }))}
                  placeholder={
                    SOCIAL_PLATFORMS.find((p) => p.platform === socialDraft.platform)?.placeholder ??
                    'https://…'
                  }
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={cancelEdit}
                className="text-sm px-4 py-2 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={saveLink}
                disabled={!socialDraft.platform || !socialDraft.icon || !socialDraft.url}
                className="text-sm px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {editingIdx === -1 ? 'Ajouter' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feedback */}
      {saveError && (
        <div className="flex items-center gap-2 text-error text-sm bg-error/5 border border-error/20 px-4 py-3 rounded-xl">
          <Icon name="error" size="sm" />
          {saveError}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 px-4 py-3 rounded-xl">
          <Icon name="check_circle" size="sm" />
          Réglages sauvegardés avec succès.
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-on-primary font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              Sauvegarde…
            </>
          ) : (
            <>
              <Icon name="save" size="sm" />
              Enregistrer tout
            </>
          )}
        </button>
      </div>
    </form>
  );
};

/* ------------------------------------------------------------------ */
/* Shell de chargement                                                  */
/* ------------------------------------------------------------------ */

export const AdminSettings: React.FC = () => {
  const { data: settings, loading, error } = useAsyncData(fetchSettings, []);

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  if (error || !settings)
    return (
      <p className="text-center text-error py-12">Impossible de charger les réglages.</p>
    );

  return (
    <>
      <Helmet>
        <title>Réglages | Admin RIMAMAN</title>
      </Helmet>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold font-headline text-on-surface mb-6">Réglages du site</h1>
        <SettingsForm initial={settings} />
        <p className="text-xs text-on-surface-variant mt-4 text-center">
          Ces informations sont affichées dans le footer, la page contact et les emails de
          notification.
        </p>
      </div>
    </>
  );
};
