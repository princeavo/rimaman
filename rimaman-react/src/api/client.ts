const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
}

function redirectToLogin() {
  window.location.href = '/admin/connexion';
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Client HTTP partagé par tous les modules `api/*`. Envoie toujours les
 * cookies (`credentials: 'include'`) : la session admin est gérée par un
 * cookie httpOnly posé par le backend, jamais manipulée côté JS.
 *
 * Sur 401 : tente un refresh silencieux, rejoue la requête originale.
 * Si le refresh échoue également, redirige vers la page de connexion.
 */
async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && !isRetry && path !== '/auth/login') {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, options, true);
    }
    redirectToLogin();
    throw new ApiError(401, 'Session expirée');
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    let extractedMessage: string | undefined;

    if (payload?.message) {
      if (typeof payload.message === 'string') {
        extractedMessage = payload.message;
      } else if (Array.isArray(payload.message)) {
        extractedMessage = payload.message.join(', ');
      } else if (typeof payload.message === 'object' && payload.message !== null) {
        const nestedMsg = payload.message.message;
        if (typeof nestedMsg === 'string') {
          extractedMessage = nestedMsg;
        } else if (Array.isArray(nestedMsg)) {
          extractedMessage = nestedMsg.join(', ');
        }
      }
    }

    const message = extractedMessage ?? `Erreur ${response.status}`;
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export async function uploadFile<T>(path: string, file: File, alt = ''): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('alt', alt);

  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (response.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) return uploadFile<T>(path, file, alt);
    redirectToLogin();
    throw new ApiError(401, 'Session expirée');
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(response.status, payload?.message ?? `Erreur ${response.status}`);
  }

  return response.json();
}
