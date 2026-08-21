import { apiClient } from './client';
import type { BackendLocationType } from './backend-types';

export type { BackendLocationType as LocationType };

export function fetchLocationTypes(): Promise<BackendLocationType[]> {
  return apiClient.get<BackendLocationType[]>('/location-types');
}

export function createLocationType(label: string): Promise<BackendLocationType> {
  return apiClient.post<BackendLocationType>('/location-types', { label });
}

export function deleteLocationType(id: string): Promise<{ id: string }> {
  return apiClient.delete<{ id: string }>(`/location-types/${id}`);
}
