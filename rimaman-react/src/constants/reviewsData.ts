// Données de reviews pour démo (en attendant le backend)

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
}

export const REVIEWS: Review[] = [
  {
    id: '1',
    productId: '1',
    author: 'Marie K.',
    rating: 5,
    date: '2026-05-20',
    title: 'Excellente qualité !',
    comment: 'Le goût est authentique, exactement comme celui de ma grand-mère. Mes enfants adorent et la préparation est vraiment rapide. Je recommande vivement !',
    verified: true,
    helpful: 24,
  },
  {
    id: '2',
    productId: '1',
    author: 'Jean-Paul D.',
    rating: 5,
    date: '2026-05-18',
    title: 'Parfait pour le fufu',
    comment: 'Texture parfaite, pas de grumeaux. La farine se mélange facilement et le résultat est toujours réussi. Format familial très pratique.',
    verified: true,
    helpful: 18,
  },
  {
    id: '3',
    productId: '1',
    author: 'Aïcha M.',
    rating: 4,
    date: '2026-05-15',
    title: 'Très bon produit',
    comment: 'Bonne qualité, sans gluten comme indiqué. Seul petit bémol : j\'aurais aimé un format encore plus grand pour ma grande famille.',
    verified: true,
    helpful: 12,
  },
  {
    id: '4',
    productId: '2',
    author: 'Fatou S.',
    rating: 5,
    date: '2026-05-22',
    title: 'Format familial parfait',
    comment: 'Le format 2kg est idéal pour nous. La qualité est au rendez-vous et le prix est très correct. On ne change plus !',
    verified: true,
    helpful: 31,
  },
  {
    id: '5',
    productId: '2',
    author: 'Ibrahim T.',
    rating: 5,
    date: '2026-05-19',
    title: 'Rapport qualité-prix imbattable',
    comment: 'Pour le prix, c\'est vraiment excellent. La farine est fine, le goût est là, et ça dure longtemps. Parfait pour les grandes occasions.',
    verified: true,
    helpful: 27,
  },
  {
    id: '6',
    productId: '3',
    author: 'Sophie L.',
    rating: 5,
    date: '2026-05-21',
    title: 'Idéal pour découvrir',
    comment: 'J\'hésitais à essayer, le format découverte m\'a permis de tester sans risque. Conquise ! Je vais commander le format familial.',
    verified: true,
    helpful: 15,
  },
  {
    id: '7',
    productId: '3',
    author: 'Marc B.',
    rating: 4,
    date: '2026-05-17',
    title: 'Bon pour commencer',
    comment: 'Format pratique pour tester. La qualité est là, maintenant je sais que je vais prendre le grand format.',
    verified: false,
    helpful: 8,
  },
  {
    id: '8',
    productId: '1',
    author: 'Aminata D.',
    rating: 5,
    date: '2026-05-16',
    title: 'Comme au village !',
    comment: 'Ça me rappelle le fufu de mon enfance au Bénin. Vraiment authentique, mes parents sont ravis. Merci RIMAMAN !',
    verified: true,
    helpful: 42,
  },
];

export const getReviewsByProduct = (productId: string) => {
  return REVIEWS.filter(review => review.productId === productId);
};

export const getAverageRating = (productId: string) => {
  const reviews = getReviewsByProduct(productId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / reviews.length;
};

export const getRatingDistribution = (productId: string) => {
  const reviews = getReviewsByProduct(productId);
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  reviews.forEach(review => {
    distribution[review.rating as keyof typeof distribution]++;
  });
  
  return distribution;
};
