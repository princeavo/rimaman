import { create } from 'zustand';
import { fetchSettings, type SiteSettings } from '../api/settings';

// Valeurs de repli : identiques aux données migrées en base via le seed,
// affichées tant que le fetch n'a pas résolu (et si jamais l'API est
// indisponible), pour ne jamais laisser le header/footer vides.
const FALLBACK_SETTINGS: SiteSettings = {
  whatsappNumber: '2290140692269',
  contactEmail: 'aanselme92@gmail.com',
  contactPhone: '+229 01 40 69 22 69',
  companyAddress: "En face du campus d'Abomey-Calavi, von après le restaurant Chawarma Express, troisième maison à droite au premier étage",
  mapGoogleUrl: null,
  mapLat: null,
  mapLng: null,
  socialLinks: [],
};

interface SettingsStore {
  settings: SiteSettings;
  loaded: boolean;
  load: () => void;
}

let loadPromise: Promise<void> | null = null;

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: FALLBACK_SETTINGS,
  loaded: false,

  load: () => {
    if (loadPromise) return;
    loadPromise = fetchSettings()
      .then((settings) => set({ settings, loaded: true }))
      .catch(() => set({ loaded: true })); // garde les valeurs de repli en cas d'échec
  },
}));
