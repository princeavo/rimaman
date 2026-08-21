import { create } from 'zustand';
import { login as apiLogin, logout as apiLogout, fetchCurrentAdmin } from '../api/auth';
import { ApiError } from '../api/client';

type AdminUser = { email: string };

interface AdminState {
  user: AdminUser | null;
  /** true while the initial session check (or login) is in flight */
  loading: boolean;
  /** true once checkSession has run at least once */
  checked: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  user: null,
  loading: false,
  checked: false,
  error: null,

  checkSession: async () => {
    set({ loading: true });
    const user = await fetchCurrentAdmin(); // renvoie null si pas de session, jamais d'exception
    set({ user, loading: false, checked: true });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const user = await apiLogin(email, password);
      set({ user, loading: false, checked: true });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erreur de connexion. Vérifiez vos identifiants.';
      set({ user: null, loading: false, error: message });
    }
  },

  clearError: () => set({ error: null }),

  logout: async () => {
    await apiLogout().catch(() => null);
    set({ user: null, checked: true });
  },
}));
