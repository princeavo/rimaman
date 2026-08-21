import type { Product, Benefit, Location } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Farine de Riz & Manioc',
    description: 'Notre farine signature, à base de riz et de manioc, pour préparer un fufu à la texture tendre et sans grumeaux en 15 minutes. Naturellement sans gluten. Convient aussi pour des beignets et des pains maison. Produite au Bénin.',
    price: 1000,
    weight: '1kg',
    image: '/rimaman.jpeg',
    category: 'Bestseller',
    features: ['Sans gluten', 'Prêt en 15 minutes', '100% Bio', 'Mouture fine'],
    isBestseller: true,
  },
  {
    id: '2',
    name: 'Mélange Homogène Familial',
    description: 'Le format 2kg pour les familles nombreuses : même recette que notre farine signature, dans un sachet refermable pour une conservation optimale.',
    price: 5500,
    weight: '2kg',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZc06IrU3_0t8-X3L30mkKCG4sPwW-bj8fEFselUpDQcRtTAofzlyRRee17SYwZcIIT_ncz4j9_KuCMDctpIVIwvSiZbSt85Skodzk2q1YX93C5Yy2KBrkA6oeXgTW0krSz3-cdVv600vMIVl-oHoseRpeSK5mXySAx0jWRi79So4nQGy0xTjPJ_qeoNdjM4XdcEedkomW53WkDAFlJVmfZxoar6bOlm1NMriDCNPsdCwpuC2hWfZ6HYqN1-JXqFGm-Wn5y72ZsLE',
    category: 'Familial',
    features: ['Format 2kg économique', 'Mélange homogène', 'Emballage refermable'],
  },
  {
    id: '3',
    name: 'Format Découverte',
    description: 'Un sachet de 1kg pour découvrir la farine RIMAMAN sans engagement, avant de passer au format familial.',
    price: 2900,
    weight: '1kg',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCa4zWfW0sooXuv5LdLu1dYrlTCh6o6MNgfVIXhUz5ycOW_f5ueqkiZEt5Bo-j_hpJFlsSJGUAj_a2xZwD7_QrmhAi24DsvOebSdNH_jOvCFN1g2HoCd9zmufukmJm4-dS2oPghHJeoO2ir4sC7dvScWDinoR3zkbPkOIN3wbDtjMvbMrNXUP2VFEDHxwPVyEQQEObQ8YufN6iUxAVQwL2i6nmxlp7RY90kTA4KHoLA5aH-y6gQqquzvMEF7OUz9iHDuqvkDuT8k78',
    category: 'Découverte',
    features: ['100% Bio', 'Format découverte'],
  },
];

export const BENEFITS: Benefit[] = [
  {
    id: '1',
    icon: 'bolt',
    title: 'Énergie Durable',
    description: 'Riche en glucides complexes pour vous accompagner tout au long de la journée sans fatigue.',
  },
  {
    id: '2',
    icon: 'pill',
    title: 'Vitamines B',
    description: 'Essentielles pour votre métabolisme et le bon fonctionnement de votre système nerveux.',
  },
  {
    id: '3',
    icon: 'ecg_heart',
    title: 'Minéraux',
    description: 'Une source naturelle de Potassium et Magnésium pour votre équilibre quotidien.',
  },
  {
    id: '4',
    icon: 'bakery_dining',
    title: 'Texture Tendre',
    description: 'Avec la farine RIMAMAN, découvrez une pâte exceptionnellement tendre, souple et agréable à manger.',
  },
];

export const LOCATIONS: Location[] = [
  { id: '1', name: 'Marché de Gbegamey', type: 'Marché', coordinates: [6.363906, 2.405080], url: 'https://maps.app.goo.gl/SBY7ACyWmKVi7rCJ6' },
  { id: '2', name: 'Marché de Menontin', type: 'Marché', coordinates: [6.390275, 2.369535], url: 'https://maps.app.goo.gl/KWKiHynWUB7x1q3Z9' },
  { id: '3', name: 'Tokplegbe Market', type: 'Marché', coordinates: [6.368335, 2.482473], url: 'https://maps.app.goo.gl/7414ib1QZW6F3swH7' },
  { id: '4', name: 'Nouveau Marché de Cadjehoun', type: 'Marché', coordinates: [6.360117, 2.394333], url: 'https://www.google.com/maps/place/Nouveau+March%C3%A9+de+Cadjehoun' },
  { id: '5', name: 'Marché Dantokpa du Bénin', type: 'Marché', coordinates: [6.371949, 2.432187], url: 'https://www.google.com/maps/place/March%C3%A9+Dantokpa+du+B%C3%A9nin' },
  { id: '6', name: 'Marché moderne cococodji', type: 'Marché', coordinates: [6.386993, 2.272528], url: 'https://www.google.com/maps/place/March%C3%A9+moderne+cococodji' },
  { id: '7', name: 'Marché Ganhi', type: 'Marché', coordinates: [6.353925, 2.433361], url: 'https://www.google.com/maps/place/March%C3%A9+Ganhi' },
  { id: '8', name: 'Marché Ouando', type: 'Marché', coordinates: [6.506466, 2.609791], url: 'https://www.google.com/maps/place/March%C3%A9+Ouando' },
  { id: '9', name: 'Grand Marché de Porto-Novo', type: 'Marché', coordinates: [6.483910, 2.614288], url: 'https://www.google.com/maps/place/Grand+March%C3%A9+de+Porto-Novo' },
];

export const WHATSAPP_NUMBER = '2240692269';
export const CONTACT_EMAIL = 'aanselme92@gmail.com';
export const CONTACT_PHONE = '+229 01 40 69 22 69';
export const COMPANY_ADDRESS = 'En face du campus d\'Abomey-Calavi, von après le restaurant Chawarma Express, troisième maison à droite au premier étage';
