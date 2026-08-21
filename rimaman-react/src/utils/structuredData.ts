export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'RIMAMAN',
  description: 'Farine de riz et manioc 100% naturelle et biologique du Bénin',
  url: 'https://rimaman.com',
  logo: 'https://rimaman.com/rimaman.jpeg',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+229-XX-XX-XX-XX',
    contactType: 'Customer Service',
    areaServed: 'BJ',
    availableLanguage: ['French'],
  },
  sameAs: [
    'https://facebook.com/rimaman',
    'https://instagram.com/rimaman',
  ],
};

export const productSchema = (product: {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  weight: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.image,
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'XOF',
    availability: 'https://schema.org/InStock',
  },
  brand: {
    '@type': 'Brand',
    name: 'RIMAMAN',
  },
});

export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'RIMAMAN - Moulin d\'Or',
  description: 'Producteur de farine de riz et manioc biologique au Bénin',
  image: 'https://rimaman.com/rimaman.jpeg',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'BJ',
    addressLocality: 'Cotonou',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 6.3654,
    longitude: 2.4183,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '08:00',
    closes: '18:00',
  },
};
