# RIMAMAN - Site Web React

Site web professionnel pour RIMAMAN (Moulin d'Or) - Farines bio béninoises.

## 🏗️ Architecture

### Stack Technique
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS v3
- **State Management:** Zustand (à implémenter)
- **Maps:** React-Leaflet
- **SEO:** React Helmet Async

### Structure du Projet

```
src/
├── components/
│   ├── common/          # Composants réutilisables (Button, Icon, ProductCard)
│   ├── layout/          # Layout (Header, Footer, Layout)
│   └── features/        # Composants spécifiques aux fonctionnalités
├── pages/               # Pages de l'application
├── hooks/               # Custom hooks
├── services/            # Services API
├── store/               # State management
├── types/               # Types TypeScript
├── utils/               # Utilitaires
├── constants/           # Constantes et données
└── assets/              # Images, fonts
```

## 🚀 Installation

```bash
npm install
```

## 💻 Développement

```bash
npm run dev
```

Le site sera accessible sur `http://localhost:5173`

## 🏭 Build Production

```bash
npm run build
```

## 📋 Fonctionnalités Implémentées

- ✅ Configuration Vite + React + TypeScript
- ✅ Configuration Tailwind CSS avec design system RIMAMAN
- ✅ Composants de base (Button, Icon, ProductCard)
- ✅ Layout (Header, Footer)
- ✅ Page d'accueil complète
- ✅ Routing React Router
- ✅ SEO avec React Helmet

## 📋 À Implémenter

- [ ] Pages restantes (À propos, Nos Farines, Où acheter, Blog, Contact, etc.)
- [ ] Composant Map avec React-Leaflet
- [ ] State management avec Zustand
- [ ] Formulaires avec React Hook Form
- [ ] Animations avec Framer Motion
- [ ] Tests avec Vitest
- [ ] Optimisation des images
- [ ] PWA
- [ ] i18n (multilingue)

## 🎨 Design System

Le projet utilise le design system Material Design 3 adapté avec les couleurs de la marque RIMAMAN.

### Couleurs Principales
- **Primary:** #006b32 (Vert)
- **Secondary:** #835500 (Ambre)
- **Tertiary:** #904917 (Terre)

### Typographie
- **Headline:** Plus Jakarta Sans
- **Body:** Inter
- **Label:** Inter

## 📱 Responsive

Le site est entièrement responsive avec des breakpoints Tailwind :
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔧 Scripts Disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualise le build de production
- `npm run lint` - Lint du code

## 📄 License

© Moulin d'Or. Tous droits réservés.
