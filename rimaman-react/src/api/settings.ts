import { apiClient } from './client';

export interface SocialLink {
  platform: string;
  icon: string;
  url: string;
}

export interface SiteSettings {
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  companyAddress: string;
  mapGoogleUrl: string | null;
  mapLat: number | null;
  mapLng: number | null;
  socialLinks: SocialLink[];
}

export function fetchSettings(): Promise<SiteSettings> {
  return apiClient.get<SiteSettings>('/settings');
}

export function updateSettings(settings: SiteSettings): Promise<SiteSettings> {
  const { whatsappNumber, contactEmail, contactPhone, companyAddress, mapGoogleUrl, socialLinks } =
    settings;
  return apiClient.put<SiteSettings>('/settings', {
    whatsappNumber,
    contactEmail,
    contactPhone,
    companyAddress,
    mapGoogleUrl,
    socialLinks,
  });
}
