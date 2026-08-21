export type NutritionRow = {
  label: string;
  value: string;
  sub?: string;
};

export type ProductCategory = {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
};

export type ProductVariant = {
  id: string;
  weight: string;
  price: number;
  stock?: number | null;
  isDefault: boolean;
  sortOrder: number;
  image?: string | null;
};

export type Product = {
  id: string;
  /** Slug URL-friendly. Utilisé dans les liens à la place de l'UUID quand disponible. */
  slug?: string | null;
  name: string;
  description: string;
  /** Prix effectif : variante par défaut si elle existe, sinon prix de base. */
  price: number;
  /** Format effectif : variante par défaut si elle existe, sinon format de base. */
  weight: string;
  image: string;
  productCategory: ProductCategory;
  features: string[];
  isBestseller?: boolean;
  nutrition?: NutritionRow[] | null;
  /** Nombre de personnes rassasiées (par format de base ou variante par défaut). */
  servings?: number | null;
  storageInfo?: string | null;
  allergens?: string | null;
  /** Toutes les variantes disponibles (vide = produit sans variante, utiliser price/weight). */
  variants: ProductVariant[];
};

export type Testimonial = {
  id: string;
  name: string;
  location: string;
  content: string;
  avatar?: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
};

export type Location = {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number];
  address?: string;
  url: string;
};

export type Benefit = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

// Checkout & Order types
export type ShippingAddress = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  additionalInfo?: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  weight: string;
  image: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  shippingAddress: ShippingAddress;
  deliveryMethod: 'delivery' | 'pickup';
  paymentMethod: 'mtn' | 'moov' | 'card' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  promoCode?: string;
  createdAt: string;
  updatedAt: string;
};

// FAQ types
export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: 'product' | 'usage' | 'order' | 'nutrition';
};

// Recipe types
export type RecipeIngredient = {
  item: string;
  quantity: string;
};

export type RecipeStepMedia = {
  id: string;
  mediaId: string;
  url: string;
  mimeType: string;
  sortOrder: number;
};

export type RecipeStep = {
  step: number;
  instruction: string;
  media: RecipeStepMedia[];
};

export type RecipeCategory = {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
};

export type RecipeDifficulty = {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
};

export type Recipe = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  video?: string;
  category: RecipeCategory;
  difficulty: RecipeDifficulty;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  tips: string[];
  relatedProducts: string[];
};

// Re-export payment types
export type {
  PaymentProvider,
  PaymentMethod,
  PaymentConfig,
  PaymentRequest,
  PaymentResponse,
  FedaPayTransaction,
  KKiaPayTransaction,
} from './payment';
