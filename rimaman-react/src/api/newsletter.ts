import { apiClient } from './client';

export function subscribeNewsletter(
  email: string,
  name?: string,
): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/newsletter', { email, name });
}
