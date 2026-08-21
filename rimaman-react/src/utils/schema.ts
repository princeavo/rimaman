import type { Recipe } from '../types';

export function recipeJsonLd(recipe: Recipe, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    image: recipe.image,
    prepTime: `PT${recipe.prepTime}M`,
    cookTime: `PT${recipe.cookTime}M`,
    totalTime: `PT${recipe.prepTime + recipe.cookTime}M`,
    recipeYield: `${recipe.servings} personnes`,
    recipeIngredient: recipe.ingredients.map((i) => `${i.quantity} ${i.item}`),
    recipeInstructions: recipe.steps.map((s) => ({
      '@type': 'HowToStep',
      position: s.step,
      text: s.instruction,
      ...(s.image ? { image: s.image } : {}),
    })),
    author: { '@type': 'Organization', name: 'RIMAMAN - Moulin d\'Or' },
    publisher: {
      '@type': 'Organization',
      name: 'RIMAMAN - Moulin d\'Or',
      logo: { '@type': 'ImageObject', url: '/logo.png' },
    },
    url,
  };
}

export function articleJsonLd(
  post: {
    title: string;
    excerpt: string;
    publishedAt?: string | null;
    image?: { url: string; alt?: string | null } | null;
    category: { name: string };
  },
  url: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    ...(post.image ? { image: post.image.url } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    author: { '@type': 'Organization', name: 'RIMAMAN - Moulin d\'Or' },
    publisher: {
      '@type': 'Organization',
      name: 'RIMAMAN - Moulin d\'Or',
      logo: { '@type': 'ImageObject', url: '/logo.png' },
    },
    articleSection: post.category.name,
    url,
  };
}

export function organizationJsonLd(phone: string, address: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RIMAMAN - Moulin d\'Or',
    description: 'Farine de Riz & Manioc 100% naturelle du Bénin.',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    logo: '/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: phone,
      contactType: 'customer service',
      availableLanguage: ['French'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BJ',
      streetAddress: address,
    },
  };
}
