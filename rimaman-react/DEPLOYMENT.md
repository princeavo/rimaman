# 🚀 Guide de Déploiement - RIMAMAN React

## Options de Déploiement

### 1. Vercel (Recommandé) ⭐

**Avantages:**
- Déploiement automatique depuis Git
- CDN global
- HTTPS automatique
- Preview deployments
- Gratuit pour projets personnels

**Étapes:**

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Se connecter
vercel login

# 3. Déployer
vercel

# 4. Déploiement production
vercel --prod
```

**Ou via l'interface web:**
1. Aller sur [vercel.com](https://vercel.com)
2. Importer le repo GitHub
3. Vercel détecte automatiquement Vite
4. Cliquer sur "Deploy"

### 2. Netlify

**Avantages:**
- Interface simple
- Formulaires intégrés
- Functions serverless
- Gratuit

**Étapes:**

```bash
# 1. Build
npm run build

# 2. Installer Netlify CLI
npm i -g netlify-cli

# 3. Déployer
netlify deploy --prod --dir=dist
```

**Configuration `netlify.toml`:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. GitHub Pages

**Étapes:**

```bash
# 1. Installer gh-pages
npm install -D gh-pages

# 2. Ajouter dans package.json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://username.github.io/rimaman-react"
}

# 3. Déployer
npm run deploy
```

**Configuration `vite.config.ts`:**

```typescript
export default defineConfig({
  base: '/rimaman-react/',
  // ...
})
```

### 4. Firebase Hosting

**Étapes:**

```bash
# 1. Installer Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Initialiser
firebase init hosting

# 4. Build
npm run build

# 5. Déployer
firebase deploy
```

**Configuration `firebase.json`:**

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 5. AWS S3 + CloudFront

**Étapes:**

```bash
# 1. Build
npm run build

# 2. Installer AWS CLI
# Suivre: https://aws.amazon.com/cli/

# 3. Configurer
aws configure

# 4. Créer bucket S3
aws s3 mb s3://rimaman-website

# 5. Upload
aws s3 sync dist/ s3://rimaman-website --delete

# 6. Configurer CloudFront pour CDN
```

## 📋 Checklist Pré-Déploiement

### Performance

- [ ] Build de production testé (`npm run build`)
- [ ] Taille du bundle vérifiée (`npm run build -- --report`)
- [ ] Images optimisées (WebP, compression)
- [ ] Lazy loading implémenté
- [ ] Code splitting configuré

### SEO

- [ ] Meta tags sur toutes les pages
- [ ] Sitemap.xml généré
- [ ] Robots.txt configuré
- [ ] Open Graph tags
- [ ] Twitter Cards
- [ ] Structured data (JSON-LD)

### Sécurité

- [ ] Variables d'environnement sécurisées
- [ ] HTTPS activé
- [ ] Headers de sécurité configurés
- [ ] CSP (Content Security Policy)
- [ ] CORS configuré si nécessaire

### Analytics

- [ ] Google Analytics installé
- [ ] Google Search Console configuré
- [ ] Monitoring d'erreurs (Sentry)
- [ ] Performance monitoring

### Accessibilité

- [ ] Test avec screen reader
- [ ] Contraste des couleurs vérifié
- [ ] Navigation au clavier testée
- [ ] ARIA labels présents

## 🔧 Variables d'Environnement

Créer `.env.production`:

```env
VITE_API_URL=https://api.rimaman.com
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

## 📊 Optimisations Production

### 1. Compression

Activer gzip/brotli sur le serveur:

**Vercel** - Automatique ✅
**Netlify** - Automatique ✅
**Nginx:**

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 2. Caching

Headers de cache recommandés:

```
Cache-Control: public, max-age=31536000, immutable  # Assets
Cache-Control: no-cache  # HTML
```

### 3. CDN

- Images sur CDN (Cloudinary, ImageKit)
- Fonts sur Google Fonts CDN
- Assets statiques sur CDN

## 🔍 Monitoring

### Google Analytics

```typescript
// src/utils/analytics.ts
export const pageview = (url: string) => {
  window.gtag('config', 'G-XXXXXXXXXX', {
    page_path: url,
  });
};
```

### Sentry (Error Tracking)

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

## 🌐 Domaine Personnalisé

### Vercel

1. Aller dans Project Settings
2. Domains
3. Ajouter `www.rimaman.com`
4. Configurer DNS:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Netlify

1. Domain Settings
2. Add custom domain
3. Configurer DNS:

```
Type: CNAME
Name: www
Value: your-site.netlify.app
```

## 📱 PWA (Progressive Web App)

```bash
npm install -D vite-plugin-pwa
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'RIMAMAN - Farines du Moulin d\'Or',
        short_name: 'RIMAMAN',
        description: 'Farines bio béninoises',
        theme_color: '#006b32',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 📈 Performance Budget

Objectifs:

- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.8s
- Total Bundle Size: < 200KB (gzipped)
- Lighthouse Score: > 90

## 🎯 Post-Déploiement

1. **Tester le site en production**
   - Toutes les pages
   - Tous les liens
   - Formulaires
   - Responsive

2. **Soumettre à Google**
   - Google Search Console
   - Sitemap

3. **Monitoring**
   - Vérifier Analytics
   - Vérifier Sentry
   - Performance monitoring

4. **Backup**
   - Code sur GitHub
   - Base de données (si applicable)
   - Assets

---

**Le site RIMAMAN est prêt pour le monde ! 🌍**
