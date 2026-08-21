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
    <form onSubmit={handleSubmit} className={variant === 'section' ? 'max-w-md mx-auto' : ''}>
      {variant === 'section' && (
        <input
          type="text"
          placeholder="Votre prénom (optionnel)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm mb-3 focus:outline-none focus:border-primary"
        />
      )}
      <div className="flex gap-2">
        <input
          type="email"
          required
          placeholder="Votre adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none ${
            variant === 'footer'
              ? 'bg-surface/10 border border-surface/20 text-surface placeholder:text-surface/40 focus:border-primary-container'
              : 'bg-surface border border-outline-variant text-on-surface placeholder:text-on-surface-variant focus:border-primary'
          }`}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${
            variant === 'footer'
              ? 'bg-primary text-on-primary hover:bg-primary/90'
              : 'bg-primary text-on-primary hover:bg-primary/90'
          }`}
        >
          {status === 'loading'
            ? <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            : <Icon name="send" size="sm" />}
          <span className="hidden sm:inline">S'abonner</span>
        </button>
      </div>
      {status === 'error' && (
        <p className="mt-2 text-xs text-red-400">{errorMsg}</p>
      )}
    </form>
  );
};
