import { create } from 'zustand';

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  resolve: ((value: boolean) => void) | null;
  _show: (title: string, message: string) => Promise<boolean>;
  _answer: (value: boolean) => void;
}

const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  title: '',
  message: '',
  resolve: null,
  _show: (title, message) =>
    new Promise<boolean>((resolve) => {
      set({ open: true, title, message, resolve });
    }),
  _answer: (value) => {
    get().resolve?.(value);
    set({ open: false, resolve: null });
  },
}));

export { useConfirmStore };

/** Affiche une modale de confirmation. Retourne `true` si l'utilisateur confirme. */
export const showConfirm = (message: string, title = 'Confirmer') =>
  useConfirmStore.getState()._show(title, message);
