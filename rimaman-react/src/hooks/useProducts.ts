import { useMemo, useState } from 'react';
import { useAsyncData } from './useAsyncData';
import { fetchProducts } from '../api/products';

const normalizeWeight = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '');

export const useProducts = () => {
  const { data, loading, error, retry } = useAsyncData(fetchProducts, []);
  const [filter, setFilter] = useState<string>('all');

  const allProducts = useMemo(() => data ?? [], [data]);

  /**
   * Formats disponibles : si un produit a des variantes on expose leurs formats,
   * sinon on utilise le format de base du produit.
   */
  const availableWeights = useMemo(() => {
    const weights = new Set<string>();
    allProducts.forEach((p) => {
      if (p.variants.length > 0) {
        p.variants.forEach((v) => weights.add(v.weight.trim()));
      } else {
        weights.add(p.weight.trim());
      }
    });
    return Array.from(weights).sort();
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    if (filter === 'all') return allProducts;
    return allProducts.filter((p) => {
      if (p.variants.length > 0) {
        return p.variants.some((v) => normalizeWeight(v.weight) === normalizeWeight(filter));
      }
      return normalizeWeight(p.weight) === normalizeWeight(filter);
    });
  }, [allProducts, filter]);

  return {
    products: filteredProducts,
    allProducts,
    availableWeights,
    filter,
    setFilter,
    loading,
    error,
    retry,
  };
};
