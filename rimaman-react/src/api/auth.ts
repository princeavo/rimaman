import { apiClient } from './client';

export interface AdminSession {
  email: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function login(email: string, password: string): Promise<AdminSession> {
  return apiClient.post<AdminSession>('/auth/login', { email, password });
}

export function logout(): Promise<{ status: string }> {
  return apiClient.post<{ status: string }>('/auth/logout');
}

/**
 * Vérifie silencieusement la session courante.
 * Sur 401 (access_token expiré), tente un refresh silencieux avant de déclarer
 * la session invalide — évite la déconnexion alors que le refresh_token est encore valide.
 * Utilise fetch brut pour ne pas déclencher le redirect automatique de apiClient.
 */
export async function fetchCurrentAdmin(): Promise<AdminSession | null> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
    if (res.ok) return res.json() as Promise<AdminSession>;

    if (res.status === 401) {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!refreshRes.ok) return null;

      const retry = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
      if (!retry.ok) return null;
      return retry.json() as Promise<AdminSession>;
    }

    return null;
  } catch {
    return null;
  }
}
