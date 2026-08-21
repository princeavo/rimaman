import { apiClient } from './client';
import type { BackendLocation } from './backend-types';
import type { Location } from '../types';

function mapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function adapt(location: BackendLocation): Location {
  return {
    id: location.id,
    name: location.name,
    type: location.type,
    coordinates: [location.latitude, location.longitude],
    address: location.address ?? undefined,
    url: mapsUrl(location.latitude, location.longitude),
  };
}

export async function fetchLocations(): Promise<Location[]> {
  const locations = await apiClient.get<BackendLocation[]>('/locations');
  return locations.map(adapt);
}

// --- Administration ---

export type LocationInput = {
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address?: string;
};

export function createLocation(input: LocationInput): Promise<BackendLocation> {
  return apiClient.post<BackendLocation>('/locations', input);
}

export function updateLocation(
  id: string,
  input: Partial<LocationInput>,
): Promise<BackendLocation> {
  return apiClient.patch<BackendLocation>(`/locations/${id}`, input);
}

export function deleteLocation(id: string): Promise<{ id: string }> {
  return apiClient.delete<{ id: string }>(`/locations/${id}`);
}
