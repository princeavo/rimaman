import { apiClient } from './client';

export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessage extends ContactMessageInput {
  id: string;
  status: 'new' | 'read' | 'archived';
  createdAt: string;
}

export function sendContactMessage(input: ContactMessageInput): Promise<ContactMessage> {
  return apiClient.post<ContactMessage>('/contact', input);
}

// --- Administration ---

export function fetchAllContactMessages(): Promise<ContactMessage[]> {
  return apiClient.get<ContactMessage[]>('/contact');
}

export function updateContactMessageStatus(
  id: string,
  status: ContactMessage['status'],
): Promise<ContactMessage> {
  return apiClient.patch<ContactMessage>(`/contact/${id}/status`, { status });
}
