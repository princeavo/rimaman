import React, { useState } from 'react';
import { Icon } from './Icon';
import { subscribeNewsletter } from '../../api/newsletter';

interface NewsletterFormProps {
  /** 'footer' variant = horizontal compact, 'section' variant = large centered */
  variant?: 'footer' | 'section';
}

export const NewsletterForm: React.FC<NewsletterFormProps> = ({ variant = 'footer' }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      await subscribeNewsletter(email.trim(), name.trim() || undefined);
      setStatus('success');
      setEmail('');
      setName('');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue.');
    }
  };

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-3 ${variant === 'section' ? 'justify-center' : ''}`}>
        <Icon name="check_circle" className="text-primary flex-shrink-0" />
        <p className={`text-sm font-medium ${variant === 'footer' ? 'text-surface/80' : 'text-on-surface'}`}>
          Merci ! Vous recevrez nos prochaines actualités.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={variant === 'section' ? 'max-w-md mx-auto flex flex-col gap-4' : ''}>
      {variant === 'section' ? (
        <>
          <input
            type="text"
            placeholder="Votre prénom (optionnel)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary"
          />
          <input
            type="email"
            required
            placeholder="Votre adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary placeholder:text-on-surface-variant"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full flex justify-center items-center gap-2 py-3.5 rounded-xl text-base font-bold transition-all duration-300 disabled:opacity-60 bg-inverse-surface text-inverse-on-surface hover:bg-inverse-surface/90 hover:scale-[1.02] shadow-lg"
          >
            {status === 'loading'
              ? <span className="w-5 h-5 border-2 border-inverse-on-surface/30 border-t-inverse-on-surface rounded-full animate-spin" />
              : <Icon name="send" size="sm" />}
            S'abonner
          </button>
        </>
      ) : (
        <div className="flex gap-2">
          <input
            type="email"
            required
            placeholder="Votre adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none bg-surface/10 border border-surface/20 text-surface placeholder:text-surface/40 focus:border-primary-container"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 bg-primary text-on-primary hover:bg-primary/90"
          >
            {status === 'loading'
              ? <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              : <Icon name="send" size="sm" />}
            <span className="hidden sm:inline">S'abonner</span>
          </button>
        </div>
      )}
      {status === 'error' && (
        <p className={`mt-2 text-xs font-semibold ${variant === 'section' ? 'text-inverse-surface' : 'text-error-container'}`}>
          {errorMsg}
        </p>
      )}
    </form>
  );
};
