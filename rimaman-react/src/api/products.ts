import { apiClient } from './client';
import type { BackendProduct } from './backend-types';
import type { Product } from '../types';

function adapt(product: BackendProduct): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    weight: product.weight,
    image: product.image?.url ?? '',
    category: product.category,
    features: product.features,
    isBestseller: product.isBestseller,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const products = await apiClient.get<BackendProduct[]>('/products');
  return products.map(adapt);
}

export async function fetchProduct(id: string): Promise<Product> {
  const product = await apiClient.get<BackendProduct>(`/products/${id}`);
  return adapt(product);
}

// --- Administration ---

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  weight: string;
  category: string;
  features: string[];
  isBestseller?: boolean;
  imageId?: string;
};

export function createProduct(input: ProductInput): Promise<BackendProduct> {
  return apiClient.post<BackendProduct>('/products', input);
}

export function updateProduct(id: string, input: Partial<ProductInput>): Promise<BackendProduct> {
  return apiClient.patch<BackendProduct>(`/products/${id}`, input);
}

export function deleteProduct(id: string): Promise<{ id: string }> {
  return apiClient.delete<{ id: string }>(`/products/${id}`);
}
