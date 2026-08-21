/**
 * Formes brutes renvoyées par l'API (avant adaptation vers les types
 * "métier" de `src/types/index.ts` que consomment déjà les pages).
 */

export interface BackendMedia {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  alt: string;
  mimeType: string;
}

export interface BackendProductCategory {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
}

export interface BackendProductVariant {
  id: string;
  productId: string;
  weight: string;
  price: number;
  stock: number | null;
  isDefault: boolean;
  sortOrder: number;
  image: BackendMedia | null;
}

/** Une ligne du tableau nutritionnel tel que stocké en JSON dans la DB. */
export interface NutritionRow {
  label: string;
  value: string;
  sub?: string;
}

export interface BackendProduct {
  id: string;
  name: string;
  slug: string | null;
  description: string;
  /** Prix de base (rétrocompatibilité). Utiliser variants[isDefault].price quand des variantes existent. */
  price: number;
  /** Format de base (rétrocompatibilité). Utiliser variants[isDefault].weight quand des variantes existent. */
  weight: string;
  categoryId: string;
  productCategory: BackendProductCategory;
  features: string[];
  isBestseller: boolean;
  nutrition: NutritionRow[] | null;
  servings: number | null;
  storageInfo: string | null;
  allergens: string | null;
  image: BackendMedia | null;
  variants: BackendProductVariant[];
}

export interface BackendLocationType {
  id: string;
  label: string;
  sortOrder: number;
  createdAt: string;
}

export interface BackendLocation {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address: string | null;
}

export interface BackendFaqCategory {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
  createdAt: string;
  items: BackendFaqItem[];
}

export interface BackendFaqItem {
  id: string;
  question: string;
  answer: string;
  categoryId: string;
  category: BackendFaqCategory;
  sortOrder: number;
}

export interface BackendBlogCategory {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: string;
}

export interface BackendBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: { type: 'doc'; content: Array<{ content?: Array<{ text?: string }> }> };
  categoryId: string;
  category: BackendBlogCategory;
  publishedAt: string | null;
  image: BackendMedia | null;
}

export interface BackendRecipeIngredient {
  item: string;
  quantity: string;
}

export interface BackendStepMedia {
  id: string;
  mediaId: string;
  media: BackendMedia;
  sortOrder: number;
}

export interface BackendRecipeStep {
  step: number;
  instruction: string;
  media: BackendStepMedia[];
}

export interface BackendGalleryCategory {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  items: BackendGalleryItem[];
}

export interface BackendGalleryItem {
  id: string;
  mediaId: string;
  media: BackendMedia;
  categoryId: string;
  category: BackendGalleryCategory;
  sortOrder: number;
  createdAt: string;
}

export interface BackendRecipeCategory {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
  createdAt: string;
}

export interface BackendRecipeDifficulty {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
  createdAt: string;
}

export interface BackendRecipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  category: BackendRecipeCategory;
  difficultyId: string;
  difficulty: BackendRecipeDifficulty;
  prepTime: number;
  cookTime: number;
  servings: number;
  tips: string[];
  image: BackendMedia | null;
  video: BackendMedia | null;
  ingredients: BackendRecipeIngredient[];
  steps: BackendRecipeStep[];
  relatedProducts: Array<{ productId: string }>;
}
