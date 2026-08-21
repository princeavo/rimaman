// Structure nutritionnelle complète RIMAMAN
// Les valeurs null = en attente d'analyse de laboratoire

export interface NutritionFacts {
  per100g: {
    energy_kcal: number | null;
    energy_kj: number | null;
    protein_g: number | null;
    carbs_g: number | null;
    sugars_g: number | null;
    fat_g: number | null;
    saturated_fat_g: number | null;
    fiber_g: number | null;
    salt_g: number | null;
    iron_mg: number | null;
    calcium_mg: number | null;
    potassium_mg: number | null;
  };
  serving_g: number;
}

export interface DietCompatibility {
  glutenFree: boolean;
  vegetarian: boolean;
  vegan: boolean;
  lactoseFree: boolean;
  diabeticFriendly: boolean | null;
}

export interface ProductNutrition {
  productId: string;
  productName: string;
  tagline: string;
  ingredients: string;
  allergens: string[];
  traces: string[];
  facts: NutritionFacts;
  diet: DietCompatibility;
  benefits: string[];
  storageInfo: string;
  shelfLifeClosedMonths: number | null;
  shelfLifeOpenedDays: number | null;
}

// Fiche unique pour toute la gamme — même recette, mêmes proportions pour tous les formats.
export const GAMME_NUTRITION: ProductNutrition = {
  productId: 'gamme',
  productName: 'Toute la gamme RIMAMAN',
  tagline: 'Même recette, même qualité — quel que soit le format',
  ingredients: 'Riz décortiqué (60 %), Manioc séché (40 %). Fabriqué dans un atelier ne traitant pas d\'allergènes majeurs.',
  allergens: [],
  traces: [],
  facts: {
    per100g: {
      energy_kcal: 354,
      energy_kj: 1481,
      protein_g: 3.8,
      carbs_g: 80.2,
      sugars_g: 0.8,
      fat_g: 0.9,
      saturated_fat_g: 0.3,
      fiber_g: 2.1,
      salt_g: 0.02,
      iron_mg: 0.8,
      calcium_mg: 18,
      potassium_mg: 115,
    },
    serving_g: 100,
  },
  diet: {
    glutenFree: true,
    vegetarian: true,
    vegan: true,
    lactoseFree: true,
    diabeticFriendly: false,
  },
  benefits: [
    'Naturellement sans gluten — adaptée aux personnes cœliaques',
    'Source d\'énergie durable grâce aux glucides complexes du riz',
    'Facile à digérer — légère sur le système digestif',
    'Polyvalente : fufu, beignets, pain, bouillie, sauces',
    'Sans additifs, sans conservateurs, sans colorants',
  ],
  storageInfo: 'Conserver dans un endroit sec, frais et à l\'abri de la lumière directe. Refermer hermétiquement après ouverture.',
  shelfLifeClosedMonths: 12,
  shelfLifeOpenedDays: 30,
};

export const HEALTH_BENEFITS = [
  {
    icon: 'bolt',
    title: 'Énergie durable',
    description: 'Les glucides complexes du riz et du manioc fournissent une énergie progressive, sans pic glycémique brutal.',
  },
  {
    icon: 'spa',
    title: 'Digestibilité',
    description: 'Sans gluten naturellement, nos farines sont bien tolérées par les personnes sensibles au gluten ou atteintes de maladie cœliaque.',
  },
  {
    icon: 'family_restroom',
    title: 'Pour toute la famille',
    description: 'Adaptée à tous les âges, y compris les jeunes enfants en diversification alimentaire et les personnes âgées.',
  },
  {
    icon: 'eco',
    title: 'Ingrédients simples',
    description: 'Riz et manioc uniquement. Aucun additif, aucun conservateur, aucun agent de texture artificiel.',
  },
];

export const NUTRITION_FAQ = [
  {
    question: 'Vos farines sont-elles certifiées sans gluten ?',
    answer: 'Nos farines sont fabriquées à partir de riz et de manioc, deux ingrédients naturellement exempts de gluten. Une certification officielle est en cours d\'obtention. En attendant, elles conviennent aux personnes intolérantes, mais nous recommandons de consulter votre médecin pour les cas de maladie cœliaque sévère.',
  },
  {
    question: 'Peut-on utiliser ces farines dans un régime diabétique ?',
    answer: 'Le riz blanc et le manioc ont un indice glycémique élevé (riz blanc : IG ≈ 72, manioc : IG ≈ 65). Notre farine n\'est donc pas recommandée en grande quantité pour les personnes diabétiques ou insulino-résistantes. Nous recommandons de consulter votre nutritionniste avant de l\'intégrer à un régime thérapeutique.',
  },
  {
    question: 'Quels sont les allergènes présents ?',
    answer: 'Nos farines ne contiennent aucun des 14 allergènes majeurs définis par la réglementation alimentaire (gluten, lait, œufs, arachides, fruits à coque, soja, poisson, crustacés, mollusques, céleri, moutarde, sésame, lupin, dioxyde de soufre). Elles sont fabriquées dans un atelier dédié.',
  },
  {
    question: 'Les valeurs nutritionnelles sont-elles fiables ?',
    answer: 'Les valeurs affichées (354 kcal, 80 g de glucides, 3,8 g de protéines pour 100 g) sont des estimations basées sur la composition connue du riz décortiqué et du manioc séché. Elles constituent une bonne référence indicative. Des analyses officielles en laboratoire accrédité permettront de confirmer et affiner ces chiffres.',
  },
  {
    question: 'Combien de temps peut-on conserver la farine après ouverture ?',
    answer: 'Une fois ouverte, la farine se conserve 30 jours dans un récipient hermétique, à l\'abri de l\'humidité et de la chaleur. Non ouverte, la durée de conservation est de 12 mois. Ces informations seront confirmées par une analyse officielle de durée de vie.',
  },
];
