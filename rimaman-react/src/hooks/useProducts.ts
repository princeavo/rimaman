import { useMemo, useState } from 'react';
import { useAsyncData } from './useAsyncData';
import { fetchProducts } from '../api/products';

const normalizeWeight = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '');

export const useProducts = () => {
  const { data, loading, error, retry } = useAsyncData(fetchProducts, []);
  const [filter, setFilter] = useState<string>('all');

  const allProducts = useMemo(() => data ?? [], [data]);

  const availableWeights = useMemo(() => {
    const weights = new Set(allProducts.map((p) => p.weight.trim()));
    return Array.from(weights).sort();
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    if (filter === 'all') return allProducts;
    return allProducts.filter((p) => normalizeWeight(p.weight) === normalizeWeight(filter));
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
