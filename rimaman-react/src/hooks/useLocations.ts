import { useAsyncData } from './useAsyncData';
import { fetchLocations } from '../api/locations';

export const useLocations = () => useAsyncData(fetchLocations, []);
