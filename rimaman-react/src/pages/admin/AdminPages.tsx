import { toast } from '../../store/toastStore';
import { showConfirm } from '../../store/confirmStore';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../../components/common/Icon';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAsyncData } from '../../hooks/useAsyncData';
import {
  fetchAllPagesForAdmin,
  updatePageMeta,
  deletePage,
  type PageSummary,
} from '../../api/pages';

const STATUS_LABELS = { draft: 'Brouillon', published: 'Publié' };
const STATUS_COLORS = {
  draft: 'bg-orange-100 text-orange-800',
  published: 'bg-green-100 text-green-800',
};

export const AdminPages: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: pages, loading, error } = useAsyncData(fetchAllPagesForAdmin, [refreshKey]);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleStatus = async (page: PageSummary) => {
    const next = page.status === 'published' ? 'draft' : 'published';
    setToggling(page.id);
    try {
      await updatePageMeta(page.id, { status: next });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!await showConfirm('Cette page sera supprimée définitivement.', 'Supprimer la page ?')) return;
    setDeletingId(id);
    try {
      await deletePage(id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de supprimer.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Helmet><title>Pages | Admin RIMAMAN</title></Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold font-headline text-on-surface">Pages</h1>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Icon name="info" size="sm" className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-on-surface-variant">
            <p className="font-semibold text-on-surface mb-1">Éditeur de pages (page builder)</p>
            <p>
              Les pages ci-dessous sont composées de rangées, colonnes et blocs éditables.
              L'éditeur drag-and-drop complet sera disponible dans la prochaine version.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : error ? (
          <p className="text-center text-error py-12">Impossible de charger les pages.</p>
        ) : (
          <div className="space-y-2">
            {(pages ?? []).length === 0 && (
              <p className="text-center text-on-surface-variant py-12">
                Aucune page créée pour le moment.
              </p>
            )}
            {(pages ?? []).map((page) => (
              <div key={page.id} className="bg-white rounded-xl border border-outline-variant flex items-center gap-4 px-5 py-3">
                <Icon name="web" className="text-primary flex-shrink-0" size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-on-surface">{page.title}</p>
                  <p className="text-sm text-on-surface-variant font-mono">/{page.slug}</p>
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${STATUS_COLORS[page.status]}`}>
                  {STATUS_LABELS[page.status]}
                </span>
                <div className="flex gap-1 flex-shrink-0">
                  <a
                    href={page.slug === 'home' ? '/' : `/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
                    title="Voir la page"
                  >
                    <Icon name="open_in_new" size="sm" />
                  </a>
                  <button
                    onClick={() => toggleStatus(page)}
                    disabled={toggling === page.id}
                    className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors disabled:opacity-50"
                    title={page.status === 'published' ? 'Dépublier' : 'Publier'}
                  >
                    <Icon name={page.status === 'published' ? 'visibility_off' : 'visibility'} size="sm" />
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    disabled={deletingId === page.id}
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
    </>
  );
};
