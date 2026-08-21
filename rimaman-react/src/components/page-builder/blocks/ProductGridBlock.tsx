import React from 'react';
import { ProductCard } from '../../common/ProductCard';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { useProducts } from '../../../hooks/useProducts';

interface Props {
  data: { productIds?: string[] };
}

export const ProductGridBlock: React.FC<Props> = ({ data }) => {
  const { allProducts, loading, error } = useProducts();

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) return null;

  const products =
    data.productIds && data.productIds.length > 0
      ? allProducts.filter((p) => data.productIds!.includes(p.id))
      : allProducts.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
