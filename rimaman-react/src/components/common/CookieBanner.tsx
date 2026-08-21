import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

const STORAGE_KEY = 'rimaman_cookie_consent';

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) setVisible(true);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, 'accepted'); } catch { /* noop */ }
    setVisible(false);
  };

  const decline = () => {
    try { localStorage.setItem(STORAGE_KEY, 'declined'); } catch { /* noop */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentement aux cookies"
      className="fixed bottom-6 left-6 z-50 max-w-sm w-full bg-on-surface text-surface rounded-2xl shadow-2xl p-5"
    >
      <div className="flex items-start gap-3 mb-4">
        <Icon name="cookie" className="text-primary-container flex-shrink-0 mt-0.5" size="md" />
        <p className="text-sm text-surface/80 leading-relaxed">
          Nous utilisons des cookies pour améliorer votre expérience.{' '}
          <Link to="/politique-de-confidentialite" className="text-primary-container underline hover:no-underline">
            En savoir plus
          </Link>
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={accept}
          className="flex-1 bg-primary text-on-primary py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Accepter
        </button>
        <button
          onClick={decline}
          className="flex-1 border border-surface/20 text-surface/70 py-2 rounded-xl text-sm font-semibold hover:bg-surface/10 transition-colors"
        >
          Refuser
        </button>
      </div>
    </div>
  );
};
