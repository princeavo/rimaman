import React from 'react';
import { Icon } from './Icon';
import type { ToastType } from '../../store/toastStore';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const toastStyles = {
  success: 'bg-primary text-on-primary',
  error: 'bg-error text-on-error',
  warning: 'bg-secondary text-on-secondary',
  info: 'bg-surface-container-high text-on-surface',
};

const toastIcons = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  return (
    <div
      className={`${toastStyles[type]} px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px] animate-fade-in`}
      role="alert"
    >
      <Icon name={toastIcons[type]} filled size="sm" />
      <p className="flex-1 font-medium text-sm">{message}</p>
      <button
        onClick={onClose}
        className="hover:opacity-70 transition-opacity"
        aria-label="Fermer"
      >
        <Icon name="close" size="sm" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};
