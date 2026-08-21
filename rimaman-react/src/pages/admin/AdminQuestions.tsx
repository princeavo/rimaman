import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../../components/common/Icon';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAsyncData } from '../../hooks/useAsyncData';
import { toast } from '../../store/toastStore';
import { showConfirm } from '../../store/confirmStore';
import {
  fetchAllRecipeQuestionsAdmin,
  answerRecipeQuestion,
  updateRecipeQuestionStatus,
  deleteRecipeQuestion,
  type AdminRecipeQuestion,
} from '../../api/recipeQuestions';

type QStatus = 'pending' | 'answered' | 'rejected';

const STATUS_COLORS: Record<QStatus, string> = {
  pending: 'bg-orange-100 text-orange-800',
  answered: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};
const STATUS_LABELS: Record<QStatus, string> = {
  pending: 'En attente',
  answered: 'Répondu',
  rejected: 'Rejeté',
};

const FILTERS: Array<{ value: QStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'answered', label: 'Répondues' },
  { value: 'rejected', label: 'Rejetées' },
];

export const AdminQuestions: React.FC = () => {
  const [filter, setFilter] = useState<QStatus | 'all'>('pending');
  const [refreshKey, setRefreshKey] = useState(0);
  const [actingId, setActingId] = useState<string | null>(null);
  const [answerDraft, setAnswerDraft] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: questions, loading } = useAsyncData(
    () => fetchAllRecipeQuestionsAdmin(),
    [refreshKey],
  );

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleAnswer = async (q: AdminRecipeQuestion) => {
    const text = (answerDraft[q.id] ?? '').trim();
    if (!text) return;
    setActingId(q.id);
    try {
      await answerRecipeQuestion(q.id, text);
      setAnswerDraft((p) => { const n = { ...p }; delete n[q.id]; return n; });
      setExpandedId(null);
      refresh();
    } catch {
      toast.error('Erreur lors de l\'envoi de la réponse.');
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActingId(id);
    try {
      await updateRecipeQuestionStatus(id, 'rejected');
      refresh();
    } catch {
      toast.error('Erreur lors du rejet.');
    } finally {
      setActingId(null);
    }
  };

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Supprimer cette question ?',
      message: 'Cette action est irréversible.',
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        setActingId(id);
        try {
          await deleteRecipeQuestion(id);
          refresh();
        } catch {
          toast.error('Erreur lors de la suppression.');
        } finally {
          setActingId(null);
        }
      },
    });
  };

  const all = questions ?? [];
  const filtered = all.filter((q) => filter === 'all' || q.status === filter);
  const pendingCount = all.filter((q) => q.status === 'pending').length;

  return (
    <>
      <Helmet><title>Questions recettes | Admin RIMAMAN</title></Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-headline text-on-surface">Questions recettes</h1>
          {pendingCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-sm font-semibold">
              {pendingCount} en attente
            </span>
          )}
        </div>

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
            <Icon name="help" size="xl" className="mb-3 opacity-30" />
            <p className="font-medium">Aucune question</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((q) => {
              const isExpanded = expandedId === q.id;
              const isActing = actingId === q.id;
              return (
                <div key={q.id} className="bg-surface rounded-xl border border-outline-variant p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm text-on-surface">{q.authorName}</span>
                        <span className="text-xs text-on-surface-variant">{q.authorEmail}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[q.status]}`}>
                          {STATUS_LABELS[q.status]}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mb-2">
                        Recette : <span className="text-on-surface">{q.recipe.title}</span>
                        {' · '}
                        {new Date(q.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-sm font-medium text-on-surface flex items-start gap-2">
                        <Icon name="help_outline" size="sm" className="text-primary mt-0.5 flex-shrink-0" />
                        {q.question}
                      </p>
                      {q.answer && (
                        <p className="mt-2 text-sm text-on-surface-variant pl-6 border-l-2 border-primary/30 ml-1">
                          {q.answer}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {q.status === 'pending' && (
                        <button onClick={() => setExpandedId(isExpanded ? null : q.id)}
                          className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Répondre">
                          <Icon name="reply" size="sm" />
                        </button>
                      )}
                      {q.status === 'pending' && (
                        <button onClick={() => handleReject(q.id)} disabled={isActing}
                          className="p-2 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 disabled:opacity-50 transition-colors" title="Rejeter">
                          <Icon name="block" size="sm" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(q.id)} disabled={isActing}
                        className="p-2 rounded-lg bg-error/5 text-error hover:bg-error/10 disabled:opacity-50 transition-colors" title="Supprimer">
                        <Icon name="delete" size="sm" />
                      </button>
                    </div>
                  </div>

                  {/* Answer form */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-outline-variant space-y-3">
                      <textarea
                        value={answerDraft[q.id] ?? ''}
                        onChange={(e) => setAnswerDraft((p) => ({ ...p, [q.id]: e.target.value }))}
                        placeholder="Votre réponse..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-surface-container-low border-2 border-transparent focus:border-primary focus:outline-none text-sm text-on-surface"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleAnswer(q)} disabled={isActing || !(answerDraft[q.id] ?? '').trim()}
                          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
                          {isActing ? <LoadingSpinner size="sm" /> : <Icon name="send" size="sm" />}
                          Publier la réponse
                        </button>
                        <button onClick={() => setExpandedId(null)}
                          className="px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
