// Métadonnées d'affichage des catégories FAQ (icône, libellé) — les
// questions/réponses elles-mêmes viennent désormais de l'API (voir
// src/hooks/useFaqItems.ts).
export const FAQ_CATEGORIES = [
  { id: 'product', label: 'Produit', icon: 'inventory_2' },
  { id: 'usage', label: 'Utilisation', icon: 'restaurant_menu' },
  { id: 'order', label: 'Commande & Livraison', icon: 'local_shipping' },
  { id: 'nutrition', label: 'Nutrition & Santé', icon: 'health_and_safety' },
] as const;
