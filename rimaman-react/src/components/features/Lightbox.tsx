import React, { useEffect } from 'react';
import { Icon } from '../common/Icon';

export interface LightboxItem {
  type: 'image' | 'video';
  url: string;
  alt: string;
}

interface LightboxProps {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ items, index, onClose, onNavigate }) => {
  const item = items[index];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate((index + 1) % items.length);
      if (e.key === 'ArrowLeft') onNavigate((index - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, items.length, onClose, onNavigate]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        aria-label="Fermer"
      >
        <Icon name="close" />
      </button>

      {items.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index - 1 + items.length) % items.length);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Précédent"
          >
            <Icon name="chevron_left" size="lg" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index + 1) % items.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Suivant"
          >
            <Icon name="chevron_right" size="lg" />
          </button>
        </>
      )}

      <div className="max-w-5xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
        {item.type === 'video' ? (
          <video
            src={item.url}
            controls
            autoPlay
            className="w-full max-h-[85vh] rounded-lg"
          />
        ) : (
          <img
            src={item.url}
            alt={item.alt}
            className="w-full max-h-[85vh] object-contain rounded-lg mx-auto"
          />
        )}
      </div>
    </div>
  );
};
