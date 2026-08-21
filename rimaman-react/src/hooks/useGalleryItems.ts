import { useAsyncData } from './useAsyncData';
import { fetchGalleryItems } from '../api/gallery';

export const useGalleryItems = () => useAsyncData(fetchGalleryItems, []);
