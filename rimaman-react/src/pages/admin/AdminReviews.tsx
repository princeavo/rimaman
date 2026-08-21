import { toast } from '../../store/toastStore';
import { showConfirm } from '../../store/confirmStore';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../../components/common/Icon';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAllReviewsForModeration, updateReviewStatus, deleteReview } from '../../api/reviews';
import type { Review } from '../../api/reviews';

const STATUS_LABELS: Record<Review['status'], string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
};

const STATUS_COLORS: Record<Review['status'], string> = {
  pending: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const FILTERS: Array<{ value: Review['status'] | 'all'; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'approved', label: 'Approuvés' },
  { value: 'rejected', label: 'Rejetés' },
];

export const AdminReviews: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: reviews, loading, error } = useAsyncData(fetchAllReviewsForModeration, [refreshKey]);
  const [filter, setFilter] = useState<Review['status'] | 'all'>('pending');
  const [actingId, setActingId] = useState<string | null>(null);

  const filtered = (reviews ?? []).filter((r) => filter === 'all' || r.status === filter);

  const act = async (id: string, action: () => Promise<unknown>) => {
    setActingId(id);
    try {
      await action();
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setActingId(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Avis clients | Admin RIMAMAN</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold font-headline text-on-surface mb-6">Avis clients</h1>

        <div className="flex gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : error ? (
          <p className="text-center text-error py-12">Impossible de charger les avis.</p>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 && (
              <p className="text-center text-on-surface-variant py-12">Aucun avis dans cette catégorie.</p>
            )}
            {filtered.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl border border-outline-variant p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-semibold text-on-surface">{review.author}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[review.status]}`}>
                        {STATUS_LABELS[review.status]}
                      </span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Icon key={s} name="star" size="sm" className={s <= review.rating ? 'text-yellow-400' : 'text-outline-variant'} />
                        ))}
                      </div>
                    </div>
                    <p className="font-medium text-on-surface text-sm mb-1">{review.title}</p>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{review.comment}</p>
                    <p className="text-xs text-on-surface-variant mt-2">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {review.status !== 'approved' && (
                      <button
                        disabled={actingId === review.id}
                        onClick={() => act(review.id, () => updateReviewStatus(review.id, 'approved'))}
                        className="text-xs px-3 py-1.5 bg-green-100 text-green-800 rounded-lg font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                      >
                        Approuver
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button
                        disabled={actingId === review.id}
                        onClick={() => act(review.id, () => updateReviewStatus(review.id, 'rejected'))}
                        className="text-xs px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg font-medium hover:bg-orange-200 transition-colors disabled:opacity-50"
                      >
                        Rejeter
                      </button>
                    )}
                    <button
                      disabled={actingId === review.id}
                      onClick={() => {
                        showConfirm('Cet avis sera supprimé définitivement.', 'Supprimer l\'avis ?').then((ok) => {
                          if (ok) act(review.id, () => deleteReview(review.id));
                        });
                      }}
                      className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Icon name="delete" size="sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
