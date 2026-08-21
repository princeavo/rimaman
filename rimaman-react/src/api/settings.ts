import { apiClient } from './client';

export interface SocialLink {
  platform: string;
  icon: string;
  url: string;
}

export interface OpeningHoursSlot {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  open: string;  // "HH:mm"
  close: string; // "HH:mm"
}

export interface ImpactStat {
  value: string;
  label: string;
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
  openingHours: OpeningHoursSlot[];
  impactStats: ImpactStat[];
}

export function fetchSettings(): Promise<SiteSettings> {
  return apiClient.get<SiteSettings>('/settings');
}

export function updateSettings(settings: SiteSettings): Promise<SiteSettings> {
  const { whatsappNumber, contactEmail, contactPhone, companyAddress, mapGoogleUrl, socialLinks, openingHours, impactStats } =
    settings;
  return apiClient.put<SiteSettings>('/settings', {
    whatsappNumber,
    contactEmail,
    contactPhone,
    companyAddress,
    mapGoogleUrl,
    socialLinks,
    openingHours,
    impactStats,
  });
}
