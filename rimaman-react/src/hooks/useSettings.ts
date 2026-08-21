import { useAsyncData } from './useAsyncData';
import { fetchSettings } from '../api/settings';

export const useSettings = () => useAsyncData(fetchSettings, []);
