import { apiClient, uploadFile } from './client';
import type { BackendMedia } from './backend-types';

export type Media = BackendMedia;

export function fetchMediaLibrary(): Promise<Media[]> {
  return apiClient.get<Media[]>('/media');
}

export function uploadMedia(file: File, alt = ''): Promise<Media> {
  return uploadFile<Media>('/media', file, alt);
}

export function deleteMedia(id: string): Promise<{ id: string }> {
  return apiClient.delete<{ id: string }>(`/media/${id}`);
}
