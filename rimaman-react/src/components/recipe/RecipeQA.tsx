import React, { useEffect, useState } from 'react';
import { Icon } from '../common/Icon';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { fetchRecipeQuestions, createRecipeQuestion, type RecipeQuestion } from '../../api/recipeQuestions';

interface RecipeQAProps {
  recipeId: string;
}

export const RecipeQA: React.FC<RecipeQAProps> = ({ recipeId }) => {
  const [questions, setQuestions] = useState<RecipeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', question: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchRecipeQuestions(recipeId)
      .then((data) => { setQuestions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [recipeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.question.trim()) return;
    setStatus('loading');
    try {
      await createRecipeQuestion(recipeId, { authorName: form.name, authorEmail: form.email, question: form.question });
      setForm({ name: '', email: '', question: '' });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-surface-container border-2 border-transparent focus:border-primary focus:outline-none text-sm text-on-surface placeholder:text-on-surface-variant';

  return (
    <section className="mt-10">
      <h3 className="text-xl font-headline font-bold text-on-surface mb-5 flex items-center gap-2">
        <Icon name="help" className="text-primary" />
        Questions &amp; Réponses
        {questions.length > 0 && (
          <span className="text-base font-semibold text-on-surface-variant bg-surface-container px-2.5 py-0.5 rounded-full">
            {questions.length}
          </span>
        )}
      </h3>

      {loading ? (
        <div className="flex justify-center py-6"><LoadingSpinner /></div>
      ) : questions.length === 0 ? (
        <p className="text-on-surface-variant text-sm mb-6">Aucune question pour l'instant. Posez la première !</p>
      ) : (
        <div className="space-y-3 mb-6">
          {questions.map((q) => (
            <div key={q.id} className="border border-outline-variant rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(open === q.id ? null : q.id)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-start gap-2">
                  <Icon name="help_outline" size="sm" className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="font-medium text-sm text-on-surface">{q.question}</span>
                </div>
                <Icon name={open === q.id ? 'expand_less' : 'expand_more'} size="sm" className="text-on-surface-variant flex-shrink-0" />
              </button>
              {open === q.id && (
                <div className="px-4 pb-4 pt-1 border-t border-outline-variant bg-surface-container-low">
                  <div className="flex items-start gap-2">
                    <Icon name="check_circle" size="sm" className="text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-on-surface leading-relaxed">{q.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {status === 'success' ? (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Icon name="check_circle" className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-on-surface text-sm">Question envoyée !</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Notre équipe vous répondra dès que possible.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-surface-container-low rounded-2xl p-5 space-y-3">
          <p className="font-semibold text-on-surface text-sm">Poser une question</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Votre nom *" required className={inputClass} />
            <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="Email (non publié) *" required className={inputClass} />
          </div>
          <textarea value={form.question} onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
            placeholder="Votre question sur la recette..." required rows={3} className={inputClass} />
          {status === 'error' && (
            <p className="text-sm text-error flex items-center gap-1.5">
              <Icon name="error" size="sm" />
              Une erreur est survenue. Réessayez.
            </p>
          )}
          <button type="submit" disabled={status === 'loading'}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {status === 'loading' ? <LoadingSpinner size="sm" /> : <Icon name="send" size="sm" />}
            Envoyer
          </button>
        </form>
      )}
    </section>
  );
};
