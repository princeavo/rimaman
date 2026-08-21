import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';
import type { BlogComment } from '../../api/blogComments';
import type { RecipeComment } from '../../api/recipeComments';

type AnyComment = (BlogComment | RecipeComment) & { replies: { id: string; authorName: string; content: string; createdAt: string }[] };

type Status = 'idle' | 'loading' | 'success' | 'error';

interface CommentFormState {
  name: string;
  email: string;
  content: string;
}

const EMPTY_FORM: CommentFormState = { name: '', email: '', content: '' };

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

function RelativeTime({ date }: { date: string }) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const label =
    diff < 60 ? "À l'instant" :
    diff < 3600 ? `Il y a ${Math.floor(diff / 60)} min` :
    diff < 86400 ? `Il y a ${Math.floor(diff / 3600)} h` :
    new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return <span className="text-xs text-on-surface-variant">{label}</span>;
}

interface CommentSectionProps {
  targetId: string;
  fetchComments: (id: string) => Promise<AnyComment[]>;
  postComment: (id: string, data: { authorName: string; authorEmail: string; content: string; parentId?: string }) => Promise<unknown>;
  label?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  targetId,
  fetchComments,
  postComment,
  label = 'commentaire',
}) => {
  const [comments, setComments] = useState<AnyComment[]>([]);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'done'>('loading');
  const [form, setForm] = useState<CommentFormState>(EMPTY_FORM);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyForm, setReplyForm] = useState<CommentFormState>(EMPTY_FORM);
  const [submitStatus, setSubmitStatus] = useState<Status>('idle');
  const [replyStatus, setReplyStatus] = useState<Status>('idle');

  useEffect(() => {
    setLoadStatus('loading');
    fetchComments(targetId)
      .then((data) => { setComments(data as AnyComment[]); setLoadStatus('done'); })
      .catch(() => { setLoadStatus('done'); });
  }, [targetId, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.content.trim()) return;
    setSubmitStatus('loading');
    try {
      await postComment(targetId, { authorName: form.name, authorEmail: form.email, content: form.content });
      setForm(EMPTY_FORM);
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyForm.name.trim() || !replyForm.email.trim() || !replyForm.content.trim()) return;
    setReplyStatus('loading');
    try {
      await postComment(targetId, { authorName: replyForm.name, authorEmail: replyForm.email, content: replyForm.content, parentId });
      setReplyForm(EMPTY_FORM);
      setReplyTo(null);
      setReplyStatus('success');
    } catch {
      setReplyStatus('error');
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-surface-container-low border-2 border-outline-variant focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant transition-colors';

  return (
    <section className="mt-12">
      <h3 className="text-2xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
        <Icon name="chat_bubble" className="text-primary" />
        Commentaires
        {comments.length > 0 && (
          <span className="ml-2 text-base font-semibold text-on-surface-variant bg-surface-container px-2.5 py-0.5 rounded-full">
            {comments.length}
          </span>
        )}
      </h3>

      {/* Comment list */}
      {loadStatus === 'loading' ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : comments.length === 0 ? (
        <p className="text-on-surface-variant text-sm mb-8">Soyez le premier à laisser un {label} !</p>
      ) : (
        <div className="space-y-6 mb-10">
          {comments.map((c) => (
            <div key={c.id}>
              <div className="flex gap-3">
                <Avatar name={c.authorName} />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-sm text-on-surface">{c.authorName}</span>
                    <RelativeTime date={c.createdAt} />
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed">{c.content}</p>
                  <button
                    type="button"
                    onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                    className="mt-2 text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <Icon name="reply" size="sm" />
                    Répondre
                  </button>

                  {/* Reply form */}
                  {replyTo === c.id && (
                    <form onSubmit={(e) => handleReplySubmit(e, c.id)} className="mt-3 space-y-3 pl-4 border-l-2 border-primary/20">
                      <div className="grid grid-cols-2 gap-3">
                        <input value={replyForm.name} onChange={(e) => setReplyForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Votre nom *" required className={inputClass} />
                        <input type="email" value={replyForm.email} onChange={(e) => setReplyForm((p) => ({ ...p, email: e.target.value }))}
                          placeholder="Email (non publié) *" required className={inputClass} />
                      </div>
                      <textarea value={replyForm.content} onChange={(e) => setReplyForm((p) => ({ ...p, content: e.target.value }))}
                        placeholder="Votre réponse..." required rows={2} className={inputClass} />
                      <div className="flex gap-2">
                        <button type="submit" disabled={replyStatus === 'loading'}
                          className="px-4 py-2 bg-primary text-on-primary text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors">
                          {replyStatus === 'loading' ? '...' : 'Envoyer'}
                        </button>
                        <button type="button" onClick={() => setReplyTo(null)}
                          className="px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                          Annuler
                        </button>
                      </div>
                      {replyStatus === 'success' && (
                        <p className="text-xs text-primary">Réponse envoyée — en attente de modération.</p>
                      )}
                    </form>
                  )}

                  {/* Replies */}
                  {c.replies.length > 0 && (
                    <div className="mt-4 space-y-4 pl-4 border-l-2 border-outline-variant">
                      {c.replies.map((r) => (
                        <div key={r.id} className="flex gap-3">
                          <Avatar name={r.authorName} />
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="font-semibold text-sm text-on-surface">{r.authorName}</span>
                              <RelativeTime date={r.createdAt} />
                            </div>
                            <p className="text-sm text-on-surface leading-relaxed">{r.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit form */}
      {submitStatus === 'success' ? (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Icon name="check_circle" className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-on-surface text-sm">Commentaire envoyé !</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Il sera publié après modération.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-surface-container-low rounded-2xl p-6 space-y-4">
          <p className="font-semibold text-on-surface text-sm">Laisser un {label}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Votre nom *" required className={inputClass} />
            <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="Email (non publié) *" required className={inputClass} />
          </div>
          <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            placeholder="Votre commentaire..." required rows={4} className={inputClass} />
          {submitStatus === 'error' && (
            <p className="text-sm text-error flex items-center gap-1.5">
              <Icon name="error" size="sm" />
              Une erreur est survenue. Réessayez.
            </p>
          )}
          <button type="submit" disabled={submitStatus === 'loading'}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {submitStatus === 'loading' ? <LoadingSpinner size="sm" /> : <Icon name="send" size="sm" />}
            Publier
          </button>
        </form>
      )}
    </section>
  );
};
