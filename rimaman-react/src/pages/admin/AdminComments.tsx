import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../../components/common/Icon';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAsyncData } from '../../hooks/useAsyncData';
import { toast } from '../../store/toastStore';
import { showConfirm } from '../../store/confirmStore';
import {
  fetchAllBlogCommentsAdmin,
  updateBlogCommentStatus,
  deleteBlogComment,
  type AdminBlogComment,
} from '../../api/blogComments';
import {
  fetchAllRecipeCommentsAdmin,
  updateRecipeCommentStatus,
  deleteRecipeComment,
  type AdminRecipeComment,
} from '../../api/recipeComments';

type CommentStatus = 'pending' | 'approved' | 'rejected';

const STATUS_LABELS: Record<CommentStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
};
const STATUS_COLORS: Record<CommentStatus, string> = {
  pending: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};
const FILTERS: Array<{ value: CommentStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'approved', label: 'Approuvés' },
  { value: 'rejected', label: 'Rejetés' },
];

function CommentRow({
  comment,
  onStatus,
  onDelete,
  acting,
}: {
  comment: (AdminBlogComment | AdminRecipeComment) & { post?: { title: string }; recipe?: { title: string } };
  onStatus: (id: string, status: CommentStatus) => void;
  onDelete: (id: string) => void;
  acting: string | null;
}) {
  const isActing = acting === comment.id;
  const context = comment.post?.title ?? comment.recipe?.title ?? '—';
  return (
    <div className="bg-surface rounded-xl border border-outline-variant p-4 space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm text-on-surface">{comment.authorName}</span>
            <span className="text-xs text-on-surface-variant">{comment.authorEmail}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[comment.status]}`}>
              {STATUS_LABELS[comment.status]}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mb-1 truncate">
            Sur : <span className="text-on-surface">{context}</span>
          </p>
          <p className="text-sm text-on-surface leading-relaxed">{comment.content}</p>
          <p className="text-xs text-on-surface-variant mt-1">
            {new Date(comment.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {comment.status !== 'approved' && (
            <button onClick={() => onStatus(comment.id, 'approved')} disabled={isActing}
              className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 transition-colors" title="Approuver">
              {isActing ? <LoadingSpinner size="sm" /> : <Icon name="check" size="sm" />}
            </button>
          )}
          {comment.status !== 'rejected' && (
            <button onClick={() => onStatus(comment.id, 'rejected')} disabled={isActing}
              className="p-2 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 disabled:opacity-50 transition-colors" title="Rejeter">
              <Icon name="block" size="sm" />
            </button>
          )}
          <button onClick={() => onDelete(comment.id)} disabled={isActing}
            className="p-2 rounded-lg bg-error/5 text-error hover:bg-error/10 disabled:opacity-50 transition-colors" title="Supprimer">
            <Icon name="delete" size="sm" />
          </button>
        </div>
      </div>
    </div>
  );
}

export const AdminComments: React.FC = () => {
  const [tab, setTab] = useState<'blog' | 'recipe'>('blog');
  const [filter, setFilter] = useState<CommentStatus | 'all'>('pending');
  const [refreshKey, setRefreshKey] = useState(0);
  const [actingId, setActingId] = useState<string | null>(null);

  const { data: blogComments, loading: blogLoading } = useAsyncData(
    () => fetchAllBlogCommentsAdmin(),
    [refreshKey],
  );
  const { data: recipeComments, loading: recipeLoading } = useAsyncData(
    () => fetchAllRecipeCommentsAdmin(),
    [refreshKey],
  );

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleStatus = async (id: string, status: CommentStatus) => {
    setActingId(id);
    try {
      if (tab === 'blog') await updateBlogCommentStatus(id, status);
      else await updateRecipeCommentStatus(id, status);
      refresh();
    } catch {
      toast.error('Erreur lors de la mise à jour.');
    } finally {
      setActingId(null);
    }
  };

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Supprimer ce commentaire ?',
      message: 'Cette action est irréversible.',
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        setActingId(id);
        try {
          if (tab === 'blog') await deleteBlogComment(id);
          else await deleteRecipeComment(id);
          refresh();
        } catch {
          toast.error('Erreur lors de la suppression.');
        } finally {
          setActingId(null);
        }
      },
    });
  };

  const comments = (tab === 'blog' ? blogComments : recipeComments) ?? [];
  const filtered = comments.filter((c) => filter === 'all' || (c as any).status === filter);
  const loading = tab === 'blog' ? blogLoading : recipeLoading;
  const pendingCount = comments.filter((c) => (c as any).status === 'pending').length;

  return (
    <>
      <Helmet><title>Commentaires | Admin RIMAMAN</title></Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-headline text-on-surface">Commentaires</h1>
          {pendingCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-sm font-semibold">
              {pendingCount} en attente
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-surface-container-low rounded-xl p-1 w-fit">
          {(['blog', 'recipe'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {t === 'blog' ? 'Articles de blog' : 'Recettes'}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === f.value ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-highest'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <Icon name="chat_bubble" size="xl" className="mb-3 opacity-30" />
            <p className="font-medium">Aucun commentaire</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <CommentRow
                key={c.id}
                comment={c as any}
                onStatus={handleStatus}
                onDelete={handleDelete}
                acting={actingId}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};
