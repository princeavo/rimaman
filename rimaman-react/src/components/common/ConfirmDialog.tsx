import React from 'react';
import { useConfirmStore } from '../../store/confirmStore';
import { Icon } from './Icon';

export const ConfirmDialog: React.FC = () => {
  const { open, title, message, _answer } = useConfirmStore();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4"
      onClick={() => _answer(false)}
    >
      <div
        className="bg-surface rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
            <Icon name="warning" size="sm" className="text-error" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-on-surface text-base mb-1">{title}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={() => _answer(false)}
            className="px-4 py-2 rounded-xl border border-outline-variant text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => _answer(true)}
            className="px-4 py-2 rounded-xl bg-error text-on-error text-sm font-semibold hover:bg-error/90 transition-colors"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};
