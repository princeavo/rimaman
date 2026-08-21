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
  openingHours: [
    { day: 'monday',    open: '08:00', close: '17:00' },
    { day: 'tuesday',   open: '08:00', close: '17:00' },
    { day: 'wednesday', open: '08:00', close: '17:00' },
    { day: 'thursday',  open: '08:00', close: '17:00' },
    { day: 'friday',    open: '08:00', close: '17:00' },
    { day: 'saturday',  open: '08:00', close: '13:00' },
  ],
  impactStats: [
    { value: '7+',     label: 'Années au service des familles béninoises' },
    { value: '40+',    label: 'Agriculteurs locaux partenaires certifiés bio' },
    { value: '12',     label: 'Villes couvertes au Bénin' },
    { value: '8 000+', label: 'Familles qui nous font confiance' },
  ],
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
