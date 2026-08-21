import { useAsyncData } from './useAsyncData';
import { fetchFaqItems } from '../api/faq';

export const useFaqItems = () => useAsyncData(fetchFaqItems, []);
