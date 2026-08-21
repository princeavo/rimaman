import { apiClient } from './client';
import type { BackendProduct, BackendProductVariant, BackendProductCategory } from './backend-types';
import type { Product, ProductVariant, ProductCategory } from '../types';

function adaptVariant(v: BackendProductVariant): ProductVariant {
  return {
    id: v.id,
    weight: v.weight,
    price: v.price,
    stock: v.stock,
    isDefault: v.isDefault,
    sortOrder: v.sortOrder,
    image: v.image?.url ?? null,
  };
}

function adaptCategory(c: BackendProductCategory): ProductCategory {
  return { id: c.id, name: c.name, icon: c.icon, sortOrder: c.sortOrder };
}

function adapt(bp: BackendProduct): Product {
  const variants = (bp.variants ?? []).map(adaptVariant);
  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0] ?? null;
  return {
    id: bp.id,
    slug: bp.slug ?? null,
    name: bp.name,
    description: bp.description,
    // Prix et format effectifs : variante par défaut si elle existe, sinon valeurs de base
    price: defaultVariant?.price ?? bp.price,
    weight: defaultVariant?.weight ?? bp.weight,
    image: defaultVariant?.image ?? bp.image?.url ?? '',
    productCategory: adaptCategory(bp.productCategory),
    features: bp.features,
    isBestseller: bp.isBestseller,
    nutrition: bp.nutrition ?? null,
    servings: bp.servings ?? null,
    storageInfo: bp.storageInfo ?? null,
    allergens: bp.allergens ?? null,
    variants,
  };
}

// ── Lecture publique ───────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const products = await apiClient.get<BackendProduct[]>('/products');
  return products.map(adapt);
}

/** Accepte un UUID ou un slug — le backend résout les deux. */
export async function fetchProduct(idOrSlug: string): Promise<Product> {
  const product = await apiClient.get<BackendProduct>(`/products/${idOrSlug}`);
  return adapt(product);
}

// ── Catégories ────────────────────────────────────────────────────────────────

export function fetchProductCategories(): Promise<ProductCategory[]> {
  return apiClient.get<BackendProductCategory[]>('/products/categories');
}

export function createProductCategory(data: {
  name: string;
  icon?: string;
  sortOrder?: number;
}): Promise<ProductCategory> {
  return apiClient.post('/products/categories', data);
}

export function updateProductCategory(
  id: string,
  data: { name?: string; icon?: string; sortOrder?: number },
): Promise<ProductCategory> {
  return apiClient.patch(`/products/categories/${id}`, data);
}

export function deleteProductCategory(id: string): Promise<{ id: string }> {
  return apiClient.delete(`/products/categories/${id}`);
}

// ── Administration produits ───────────────────────────────────────────────────

export type ProductInput = {
  name: string;
  slug?: string;
  description: string;
  price: number;
  weight: string;
  categoryId: string;
  features: string[];
  isBestseller?: boolean;
  nutrition?: Array<{ label: string; value: string; sub?: string }>;
  servings?: number;
  storageInfo?: string;
  allergens?: string;
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

// ── Administration variantes ──────────────────────────────────────────────────

export type VariantInput = {
  weight: string;
  price: number;
  stock?: number;
  isDefault: boolean;
  sortOrder?: number;
  imageId?: string;
};

export function createVariant(productId: string, input: VariantInput): Promise<BackendProductVariant> {
  return apiClient.post<BackendProductVariant>(`/products/${productId}/variants`, input);
}

export function updateVariant(
  productId: string,
  variantId: string,
  input: Partial<VariantInput>,
): Promise<BackendProductVariant> {
  return apiClient.patch<BackendProductVariant>(`/products/${productId}/variants/${variantId}`, input);
}

export function deleteVariant(productId: string, variantId: string): Promise<{ id: string }> {
  return apiClient.delete<{ id: string }>(`/products/${productId}/variants/${variantId}`);
}
