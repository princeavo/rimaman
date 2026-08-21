import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  
  showToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type };
    
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(toast => toast.id !== id) }));
    }, 3000);
  },
  
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter(toast => toast.id !== id) }));
  },
}));

/** Appelable hors composant React (dans les handlers async) */
export const toast = {
  success: (message: string) => useToastStore.getState().showToast(message, 'success'),
  error: (message: string) => useToastStore.getState().showToast(message, 'error'),
  info: (message: string) => useToastStore.getState().showToast(message, 'info'),
};
