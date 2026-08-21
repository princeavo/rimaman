# Architecture RIMAMAN React - Documentation Technique

## 🏗️ Vue d'ensemble de l'Architecture

Cette application React suit les principes d'architecture logicielle moderne avec une séparation claire des responsabilités, une scalabilité optimale et une maintenabilité élevée.

## 📐 Principes Architecturaux

### 1. **Separation of Concerns (SoC)**
- **Présentation** : Composants React purs
- **Logique Métier** : Hooks personnalisés et services
- **Données** : State management centralisé
- **Styles** : Tailwind CSS avec design system

### 2. **Component-Driven Development**
```
Atomic Design Pattern:
├── Atoms (Button, Icon, Input)
├── Molecules (ProductCard, TestimonialCard)
├── Organisms (Header, Footer, ProductGrid)
├── Templates (Layout)
└── Pages (Home, About, Products, etc.)
```

### 3. **Type Safety**
- TypeScript strict mode activé
- Interfaces pour tous les types de données
- Props typées pour tous les composants

## 📁 Structure Détaillée

```
rimaman-react/
├── public/                          # Assets statiques
│   ├── rimaman.jpeg
│   └── famille-rimaman.jpeg
│
├── src/
│   ├── components/
│   │   ├── common/                  # Composants réutilisables (Atoms/Molecules)
│   │   │   ├── Button.tsx          # Bouton avec variants
│   │   │   ├── Icon.tsx            # Wrapper Material Symbols
│   │   │   └── ProductCard.tsx     # Card produit
│   │   │
│   │   ├── layout/                  # Composants de layout (Organisms)
│   │   │   ├── Header.tsx          # Navigation principale
│   │   │   ├── Footer.tsx          # Pied de page
│   │   │   └── Layout.tsx          # Template de page
│   │   │
│   │   └── features/                # Composants spécifiques aux fonctionnalités
│   │       ├── products/           # Fonctionnalités produits
│   │       ├── blog/               # Fonctionnalités blog
│   │       └── locations/          # Fonctionnalités localisation
│   │
│   ├── pages/                       # Pages de l'application (Templates)
│   │   ├── Home.tsx                # Page d'accueil ✅
│   │   ├── About.tsx               # À propos (à créer)
│   │   ├── Products.tsx            # Nos farines (à créer)
│   │   ├── Locations.tsx           # Où acheter (à créer)
│   │   ├── Blog.tsx                # Blog (à créer)
│   │   └── Contact.tsx             # Contact (à créer)
│   │
│   ├── hooks/                       # Custom React Hooks
│   │   ├── useCart.ts              # Gestion panier (à créer)
│   │   ├── useProducts.ts          # Gestion produits (à créer)
│   │   └── useLocations.ts         # Gestion localisations (à créer)
│   │
│   ├── services/                    # Services API et logique métier
│   │   ├── api.ts                  # Client API (à créer)
│   │   ├── products.service.ts     # Service produits (à créer)
│   │   └── contact.service.ts      # Service contact (à créer)
│   │
│   ├── store/                       # State Management (Zustand)
│   │   ├── cartStore.ts            # Store panier (à créer)
│   │   └── uiStore.ts              # Store UI (à créer)
│   │
│   ├── types/                       # Types TypeScript
│   │   └── index.ts                # Types principaux ✅
│   │
│   ├── utils/                       # Fonctions utilitaires
│   │   ├── formatters.ts           # Formatage (à créer)
│   │   └── validators.ts           # Validation (à créer)
│   │
│   ├── constants/                   # Constantes et configuration
│   │   └── data.ts                 # Données statiques ✅
│   │
│   ├── assets/                      # Assets (images, fonts)
│   │
│   ├── App.tsx                      # Composant racine ✅
│   ├── main.tsx                     # Point d'entrée ✅
│   └── index.css                    # Styles globaux ✅
│
├── tailwind.config.js               # Configuration Tailwind ✅
├── postcss.config.js                # Configuration PostCSS ✅
├── tsconfig.json                    # Configuration TypeScript
├── vite.config.ts                   # Configuration Vite
└── package.json                     # Dépendances
```

## 🎨 Design System

### Palette de Couleurs (Material Design 3)
```typescript
Primary: #006b32      // Vert principal
Secondary: #835500    // Ambre/Or
Tertiary: #904917     // Terre cuite
Surface: #fbf9f5      // Fond clair
```

### Typographie
```typescript
Headline: Plus Jakarta Sans (titres)
Body: Inter (corps de texte)
Label: Inter (labels et boutons)
```

### Composants de Base

#### Button Component
```typescript
<Button 
  variant="primary" | "secondary" | "outline" | "ghost"
  size="sm" | "md" | "lg"
  icon="icon_name"
>
  Texte
</Button>
```

#### Icon Component
```typescript
<Icon 
  name="icon_name"
  size="sm" | "md" | "lg" | "xl"
  filled={boolean}
/>
```

## 🔄 Flux de Données

```
User Action
    ↓
Component Event Handler
    ↓
Custom Hook / Service
    ↓
State Update (Zustand Store)
    ↓
Component Re-render
    ↓
UI Update
```

## 🚀 Patterns et Best Practices

### 1. **Composition over Inheritance**
```typescript
// ✅ Bon
<Layout>
  <Home />
</Layout>

// ❌ Éviter
class HomePage extends Layout { }
```

### 2. **Custom Hooks pour la Logique Réutilisable**
```typescript
// useCart.ts
export const useCart = () => {
  const addToCart = (product: Product) => { /* ... */ };
  const removeFromCart = (id: string) => { /* ... */ };
  return { addToCart, removeFromCart };
};
```

### 3. **Props Drilling Solution**
- Utiliser Context API pour les données globales
- Zustand pour le state management complexe
- Props pour les données locales

### 4. **Code Splitting**
```typescript
const About = lazy(() => import('./pages/About'));
const Products = lazy(() => import('./pages/Products'));
```

### 5. **Error Boundaries**
```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

## 📊 State Management Strategy

### Local State (useState)
- État UI temporaire
- Formulaires simples
- Toggles, modals

### Context API
- Thème (dark/light mode)
- Langue (i18n)
- Authentification

### Zustand Store
- Panier d'achat
- Filtres produits
- État global complexe

## 🔐 Sécurité

### 1. **Validation des Entrées**
- Zod pour la validation des formulaires
- Sanitization des données utilisateur

### 2. **Protection XSS**
- Utilisation de `dangerouslySetInnerHTML` uniquement si nécessaire
- Sanitization avec DOMPurify

### 3. **HTTPS Only**
- Toutes les requêtes API en HTTPS
- Cookies sécurisés

## ⚡ Performance

### 1. **Optimisations React**
```typescript
// Memoization
const MemoizedComponent = React.memo(Component);

// useMemo pour calculs coûteux
const expensiveValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// useCallback pour fonctions
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

### 2. **Code Splitting**
- Lazy loading des routes
- Dynamic imports pour les composants lourds

### 3. **Image Optimization**
- WebP format
- Lazy loading images
- Responsive images

### 4. **Bundle Optimization**
- Tree shaking
- Minification
- Compression gzip/brotli

## 🧪 Testing Strategy

### Unit Tests (Vitest)
```typescript
describe('Button', () => {
  it('renders with correct variant', () => {
    render(<Button variant="primary">Click</Button>);
    expect(screen.getByText('Click')).toBeInTheDocument();
  });
});
```

### Integration Tests
- Test des flux utilisateur complets
- Test des interactions entre composants

### E2E Tests (Playwright/Cypress)
- Parcours utilisateur critiques
- Formulaires et checkout

## 📱 Responsive Design

### Breakpoints Tailwind
```typescript
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large
```

### Mobile-First Approach
```typescript
// ✅ Bon
<div className="text-sm md:text-base lg:text-lg">

// ❌ Éviter
<div className="lg:text-lg md:text-base text-sm">
```

## 🌐 SEO Strategy

### React Helmet Async
```typescript
<Helmet>
  <title>Page Title | RIMAMAN</title>
  <meta name="description" content="..." />
  <meta property="og:title" content="..." />
</Helmet>
```

### Structured Data
- JSON-LD pour les produits
- Schema.org markup

### Performance Metrics
- Lighthouse score > 90
- Core Web Vitals optimisés

## 🔄 CI/CD Pipeline (Recommandé)

```yaml
Build → Test → Lint → Deploy
  ↓       ↓      ↓       ↓
 Vite   Vitest ESLint  Vercel/Netlify
```

## 📚 Documentation

### Code Comments
- JSDoc pour les fonctions complexes
- Inline comments pour la logique métier

### Component Documentation
- Storybook pour le design system
- Props documentation

## 🎯 Prochaines Étapes

### Phase 1 - Pages Principales
- [ ] Page À propos
- [ ] Page Nos Farines
- [ ] Page Où acheter (avec carte Leaflet)
- [ ] Page Blog
- [ ] Page Contact

### Phase 2 - Fonctionnalités
- [ ] Panier d'achat
- [ ] Recherche produits
- [ ] Filtres avancés
- [ ] Newsletter

### Phase 3 - Optimisations
- [ ] PWA
- [ ] i18n (FR/EN)
- [ ] Analytics
- [ ] Performance monitoring

### Phase 4 - Backend Integration
- [ ] API REST/GraphQL
- [ ] CMS Headless (Strapi/Contentful)
- [ ] Paiement en ligne
- [ ] Authentification

## 🤝 Contribution Guidelines

### Code Style
- ESLint + Prettier
- Conventional Commits
- Pull Request reviews

### Git Workflow
```
main (production)
  ↓
develop (staging)
  ↓
feature/nom-feature (développement)
```

---

**Auteur:** Équipe RIMAMAN Dev  
**Version:** 1.0.0  
**Dernière mise à jour:** 2026-05-25
