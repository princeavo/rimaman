/**
 * Seed minimal : crée le compte admin initial et injecte le contenu de départ
 * des pages du page builder (home, à-propos, b2b). Tout le reste (produits,
 * recettes, FAQ, blog, galerie, points de vente, réglages) est géré via
 * l'interface d'administration.
 *
 * Idempotent : peut être relancé sans dupliquer les données.
 */
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, extname, basename } from 'path';
import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const FRONTEND_PUBLIC_DIR = join(__dirname, '..', '..', 'rimaman-react', 'public');
const UPLOADS_DIR = process.env.MEDIA_LOCAL_PATH ?? './uploads';
const PUBLIC_URL = process.env.MEDIA_PUBLIC_URL ?? 'http://localhost:3000/uploads';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const mimeByExt: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const mediaCache = new Map<string, string>();

/**
 * Résout un chemin image local (relatif à /public) vers une entrée Media en
 * base. Copie le fichier dans le dossier uploads si nécessaire. Retourne null
 * si le fichier n'existe pas.
 */
async function resolveMedia(sourcePath: string | undefined): Promise<string | null> {
  if (!sourcePath) return null;
  if (mediaCache.has(sourcePath)) return mediaCache.get(sourcePath)!;

  const localPath = join(FRONTEND_PUBLIC_DIR, sourcePath);
  if (!existsSync(localPath)) {
    console.warn(`  ⚠ Image introuvable, ignorée : ${sourcePath}`);
    return null;
  }

  mkdirSync(UPLOADS_DIR, { recursive: true });
  const ext = extname(localPath);
  const filename = `${slugify(basename(localPath, ext))}-${Date.now()}${ext}`;
  copyFileSync(localPath, join(UPLOADS_DIR, filename));

  const media = await prisma.media.create({
    data: {
      filename,
      url: `${PUBLIC_URL}/${filename}`,
      mimeType: mimeByExt[ext.toLowerCase()] ?? 'application/octet-stream',
      sizeBytes: 0,
      alt: '',
    },
  });
  mediaCache.set(sourcePath, media.id);
  return media.id;
}

// ── Compte admin ──────────────────────────────────────────────────────────────

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn('SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD non définis : compte admin non créé.');
    return;
  }
  const passwordHash = await argon2.hash(password);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
  console.log(`✔ Compte admin prêt (${email})`);
}

// ── Pages (page builder) ──────────────────────────────────────────────────────

type BlockDef = {
  type: string;
  sortOrder: number;
  data: Record<string, unknown>;
  mediaPath?: string;
};
type ColumnDef = { width: number; settings?: Record<string, unknown>; blocks: BlockDef[] };
type RowDef = { settings?: Record<string, unknown>; columns: ColumnDef[] };
type PageDef = { slug: string; title: string; metaDescription: string; rows: RowDef[] };

function richText(...paragraphs: string[]) {
  return {
    content: {
      type: 'doc',
      content: paragraphs.map((text) => ({
        type: 'paragraph',
        content: [{ type: 'text', text }],
      })),
    },
  };
}

const PAGES: PageDef[] = [
  // ── Accueil ────────────────────────────────────────────────────────────────
  {
    slug: 'home',
    title: "Accueil | RIMAMAN – Farines du Moulin d'Or",
    metaDescription: "Farine de Riz & Manioc 100% Bio du Bénin. Le goût authentique du fufu traditionnel, prêt en 15 minutes.",
    rows: [
      {
        settings: { background: 'surface-container-low', paddingTop: 28, paddingBottom: 20, alignItems: 'center' },
        columns: [
          {
            width: 7,
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Le fufu traditionnel, prêt en 15 minutes', level: 1 } },
              { type: 'rich_text', sortOrder: 1, data: richText("Farine de Riz & Manioc 100% Bio, produite au Bénin. Le goût de la tradition, la simplicité du quotidien.") },
              { type: 'button_group', sortOrder: 2, data: { buttons: [{ label: 'Commander', href: '/nos-farines', variant: 'primary' }, { label: 'Voir les recettes', href: '/recettes', variant: 'outline' }] } },
            ],
          },
          {
            width: 5,
            blocks: [
              { type: 'image', sortOrder: 0, data: { alt: 'Farine RIMAMAN' }, mediaPath: '/rimaman.jpeg' },
            ],
          },
        ],
      },
      {
        settings: { background: 'surface', paddingY: 20 },
        columns: [
          {
            width: 6,
            blocks: [
              { type: 'image', sortOrder: 0, data: { alt: 'Fondateur de RIMAMAN' }, mediaPath: '/promoteur/promoteur-1.jpeg' },
            ],
          },
          {
            width: 6,
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: "L'homme derrière RIMAMAN", level: 2 } },
              {
                type: 'rich_text', sortOrder: 1, data: richText(
                  "RIMAMAN est née d'une envie simple : offrir aux familles béninoises une farine de qualité, fidèle au goût du fufu traditionnel, sans les heures de pilage.",
                  "Le Moulin d'Or sélectionne et transforme localement le riz et le manioc pour produire une farine 100% bio et sans gluten, vendue directement sur les marchés du Bénin."
                ),
              },
              { type: 'button', sortOrder: 2, data: { label: 'Notre histoire', href: '/a-propos', variant: 'outline' } },
            ],
          },
        ],
      },
      {
        settings: { background: 'surface-container-low', paddingY: 20 },
        columns: [
          {
            width: 12,
            settings: { align: 'center' },
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Notre gamme', level: 2 } },
              { type: 'rich_text', sortOrder: 1, data: richText("Trois formats pour s'adapter à vos besoins, du test à la grande famille.") },
              { type: 'product_grid', sortOrder: 2, data: { productIds: [] } },
            ],
          },
        ],
      },
      {
        settings: { background: 'primary', paddingY: 20 },
        columns: [
          {
            width: 12,
            blocks: [
              {
                type: 'cta_banner', sortOrder: 0, data: {
                  title: 'Disponible sur les marchés du Bénin',
                  text: 'RIMAMAN est en vente sur plusieurs marchés de Cotonou et Porto-Novo. Retrouvez la liste complète et leur localisation sur la carte des points de vente.',
                  buttonLabel: 'Voir la carte des points de vente',
                  buttonHref: '/ou-acheter',
                },
              },
            ],
          },
        ],
      },
      {
        settings: { background: 'surface', paddingY: 20 },
        columns: [
          {
            width: 12,
            settings: { align: 'center' },
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: "Plus d'idées avec RIMAMAN", level: 2 } },
              { type: 'rich_text', sortOrder: 1, data: richText('Fufu, beignets, pain maison... découvrez toutes nos recettes.') },
              { type: 'recipe_grid', sortOrder: 2, data: { recipeIds: [] } },
            ],
          },
        ],
      },
    ],
  },

  // ── À propos ───────────────────────────────────────────────────────────────
  {
    slug: 'a-propos',
    title: "À Propos | RIMAMAN - Le Moulin d'Or",
    metaDescription: "Découvrez l'histoire et les valeurs de RIMAMAN, le Moulin d'Or. De la terre béninoise à votre table.",
    rows: [
      {
        settings: { background: 'surface-container-low', paddingTop: 28, paddingBottom: 20 },
        columns: [
          {
            width: 7,
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Notre histoire & nos valeurs', level: 1 } },
              { type: 'rich_text', sortOrder: 1, data: richText("De la terre béninoise à votre table : le parcours d'une farine pensée pour la santé et le plaisir au quotidien.") },
            ],
          },
          {
            width: 5,
            blocks: [
              { type: 'image', sortOrder: 0, data: { alt: 'Famille RIMAMAN' }, mediaPath: '/famille-rimaman.jpeg' },
            ],
          },
        ],
      },
      {
        settings: { background: 'surface', paddingY: 20 },
        columns: [
          {
            width: 6,
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: "Un moulin artisanal au cœur du Bénin", level: 2 } },
              {
                type: 'rich_text', sortOrder: 1, data: richText(
                  "Le Moulin d'Or est né d'une vision simple : transformer les richesses agricoles du Bénin en produits de qualité, accessibles au quotidien. Notre marque, RIMAMAN, porte cette promesse de pureté et de simplicité.",
                  "Nous allions savoir-faire traditionnel et attention portée à chaque étape de transformation pour proposer une farine 100% naturelle, sans additifs."
                ),
              },
            ],
          },
          {
            width: 6,
            blocks: [
              { type: 'image', sortOrder: 0, data: { alt: 'Production RIMAMAN' }, mediaPath: '/promoteur/promoteur-2.jpeg' },
            ],
          },
        ],
      },
      {
        settings: { background: 'surface-container-low', paddingY: 20 },
        columns: [
          {
            width: 6,
            blocks: [
              { type: 'image', sortOrder: 0, data: { alt: 'Contrôle qualité RIMAMAN' }, mediaPath: '/promoteur/promoteur-3.jpeg' },
            ],
          },
          {
            width: 6,
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Notre engagement qualité', level: 2 } },
              {
                type: 'rich_text', sortOrder: 1, data: richText(
                  "Chaque sachet de farine RIMAMAN est le résultat d'un processus rigoureux : sélection des matières premières, transformation soignée, contrôle qualité à chaque étape.",
                  "Nous travaillons en direct avec les producteurs locaux pour garantir la traçabilité de nos produits et soutenir l'économie béninoise."
                ),
              },
            ],
          },
        ],
      },
      {
        settings: { background: 'surface', paddingY: 20 },
        columns: [
          {
            width: 12,
            blocks: [
              { type: 'image', sortOrder: 0, data: { alt: 'RIMAMAN avec les producteurs' }, mediaPath: '/promoteur/promoteur-4.jpeg' },
            ],
          },
        ],
      },
      {
        settings: { background: 'primary', paddingY: 20 },
        columns: [
          {
            width: 12,
            blocks: [
              {
                type: 'cta_banner', sortOrder: 0, data: {
                  title: 'Découvrez nos farines',
                  text: 'Produits 100% bio, sans gluten, directement du Bénin à votre table.',
                  buttonLabel: 'Voir nos farines',
                  buttonHref: '/nos-farines',
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // ── B2B ────────────────────────────────────────────────────────────────────
  {
    slug: 'b2b',
    title: 'Espace Professionnel B2B | RIMAMAN',
    metaDescription: 'Restaurateurs, hôtels, boulangeries, revendeurs : commandez la farine bio RIMAMAN en volume. Tarifs dégressifs, devis sous 48h, livraison à Cotonou.',
    rows: [
      // 1. Hero
      {
        settings: { background: 'primary', paddingTop: 36, paddingBottom: 28 },
        columns: [
          {
            width: 12,
            settings: { align: 'center' },
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'RIMAMAN pour les Professionnels', level: 1 } },
              { type: 'rich_text', sortOrder: 1, data: richText('Farine de riz et manioc 100 % bio, produite au Bénin. Des offres sur-mesure pour les restaurateurs, hôteliers, traiteurs, boulangeries et revendeurs qui exigent qualité et régularité.') },
              { type: 'button_group', sortOrder: 2, data: { buttons: [{ label: 'Demander un devis', href: '/contact', variant: 'secondary' }, { label: 'Voir nos produits', href: '/nos-farines', variant: 'outline' }] } },
            ],
          },
        ],
      },
      // 2. Chiffres clés
      {
        settings: { background: 'surface-container-low', paddingY: 16 },
        columns: [
          {
            width: 12,
            blocks: [
              { type: 'stats', sortOrder: 0, data: { items: [{ value: '100 % Bio', label: 'Certifié, sans pesticides ni additifs chimiques' }, { value: 'Sans Gluten', label: 'Naturellement adapté aux régimes spéciaux' }, { value: '< 48 h', label: 'Délai de réponse garanti à votre demande de devis' }, { value: 'Made in Bénin', label: 'Cultivé, transformé et conditionné localement' }] } },
            ],
          },
        ],
      },
      // 3. Pour qui — intro
      {
        settings: { background: 'surface', paddingTop: 20, paddingBottom: 8 },
        columns: [
          {
            width: 12,
            settings: { align: 'center' },
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: "À qui s'adresse l'offre B2B ?", level: 2 } },
              { type: 'rich_text', sortOrder: 1, data: richText("Nous travaillons avec toute structure ayant des besoins réguliers en farine de qualité. Notre offre s'adapte à votre volume, votre rythme et vos contraintes.") },
            ],
          },
        ],
      },
      // 3. Pour qui — 3 colonnes
      {
        settings: { background: 'surface', paddingTop: 4, paddingBottom: 20 },
        columns: [
          {
            width: 4,
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Restauration', level: 3 } },
              { type: 'rich_text', sortOrder: 1, data: richText('Restaurants, maquis, cantines, food trucks. Une farine constante pour des préparations reproductibles et une cuisine de qualité au quotidien.') },
            ],
          },
          {
            width: 4,
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Hôtellerie & Événementiel', level: 3 } },
              { type: 'rich_text', sortOrder: 1, data: richText("Hôtels, lodges, traiteurs, cuisines d'événements. Des volumes adaptés à vos plannings, avec la régularité que vos clients attendent.") },
            ],
          },
          {
            width: 4,
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Distribution & Revente', level: 3 } },
              { type: 'rich_text', sortOrder: 1, data: richText('Supermarchés, épiceries, distributeurs, exportateurs. Conditionnements disponibles en marque propre pour les commandes supérieures à 500 kg.') },
            ],
          },
        ],
      },
      // 4. Produits
      {
        settings: { background: 'surface-container-low', paddingY: 20 },
        columns: [
          {
            width: 12,
            settings: { align: 'center' },
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Nos produits disponibles en volume', level: 2 } },
              { type: 'rich_text', sortOrder: 1, data: richText("Toute notre gamme est disponible en commande B2B. Les formats et conditionnements s'adaptent à votre besoin.") },
              { type: 'product_grid', sortOrder: 2, data: {} },
            ],
          },
        ],
      },
      // 5. Conditionnements — intro
      {
        settings: { background: 'surface', paddingTop: 20, paddingBottom: 8 },
        columns: [
          {
            width: 12,
            settings: { align: 'center' },
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Conditionnements disponibles', level: 2 } },
              { type: 'rich_text', sortOrder: 1, data: richText('Nous adaptons le format à vos besoins de stockage et de production. Plusieurs options disponibles dès la première commande.') },
            ],
          },
        ],
      },
      // 5. Conditionnements — stats
      {
        settings: { background: 'surface', paddingTop: 4, paddingBottom: 20 },
        columns: [
          {
            width: 12,
            blocks: [
              { type: 'stats', sortOrder: 0, data: { items: [{ value: 'Sachet 500 g', label: "Buffets, hôtels, vente à l'unité en épicerie" }, { value: 'Sac 5 kg', label: 'Petite restauration et test produit avant montée en volume' }, { value: 'Sac 25 kg', label: 'Cuisine professionnelle — format standard recommandé' }, { value: 'Sac 50 kg', label: 'Grand volume, optimisé pour la logistique et le stockage' }] } },
            ],
          },
        ],
      },
      // 6. Tarifs — intro
      {
        settings: { background: 'surface-container-low', paddingTop: 20, paddingBottom: 8 },
        columns: [
          {
            width: 12,
            settings: { align: 'center' },
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Des tarifs pensés pour vos volumes', level: 2 } },
              { type: 'rich_text', sortOrder: 1, data: richText("Plus vous commandez, meilleur est votre prix unitaire. Nos paliers de remise s'appliquent dès la première commande confirmée.") },
            ],
          },
        ],
      },
      // 6. Tarifs — 2 colonnes
      {
        settings: { background: 'surface-container-low', paddingTop: 4, paddingBottom: 20 },
        columns: [
          {
            width: 6,
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Paliers de volume', level: 3 } },
              { type: 'rich_text', sortOrder: 1, data: richText('25 à 99 kg — Tarif professionnel de base, applicable sans engagement.', '100 à 499 kg — Remise supplémentaire négociée à la commande.', "500 kg et plus — Offre grand compte avec conditions préférentielles, priorité de stock et livraison dédiée.") },
            ],
          },
          {
            width: 6,
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: "Contrats d'approvisionnement", level: 3 } },
              { type: 'rich_text', sortOrder: 1, data: richText("Les partenaires s'engageant sur un calendrier régulier (mensuel ou trimestriel) bénéficient d'un prix bloqué sur la durée du contrat, d'une priorité d'allocation en cas de forte demande et d'une livraison garantie à date.", "Contactez-nous pour établir ensemble un programme d'approvisionnement adapté à votre activité et votre saisonnalité.") },
            ],
          },
        ],
      },
      // 7. Comment ça marche — intro
      {
        settings: { background: 'surface', paddingTop: 20, paddingBottom: 8 },
        columns: [
          {
            width: 12,
            settings: { align: 'center' },
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Comment passer une commande B2B ?', level: 2 } },
              { type: 'rich_text', sortOrder: 1, data: richText('Un processus simple en 4 étapes, de la demande initiale à la réception de votre commande.') },
            ],
          },
        ],
      },
      // 7. Comment ça marche — étapes
      {
        settings: { background: 'surface', paddingTop: 4, paddingBottom: 20 },
        columns: [
          {
            width: 12,
            blocks: [
              { type: 'stats', sortOrder: 0, data: { items: [{ value: '① Demande', label: 'Remplissez le formulaire de contact avec vos besoins : produit, volume estimé et fréquence de commande.' }, { value: '② Devis', label: 'Notre équipe vous envoie une offre personnalisée et détaillée sous 48 heures ouvrables.' }, { value: '③ Confirmation', label: 'Vous validez le bon de commande et procédez au paiement ou à la signature du contrat.' }, { value: '④ Livraison', label: 'Réception à Cotonou ou enlèvement directement au moulin RIMAMAN selon votre préférence.' }] } },
            ],
          },
        ],
      },
      // 8. Engagements qualité — intro
      {
        settings: { background: 'surface-container-low', paddingTop: 20, paddingBottom: 8 },
        columns: [
          {
            width: 12,
            settings: { align: 'center' },
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Nos engagements qualité', level: 2 } },
              { type: 'rich_text', sortOrder: 1, data: richText('Ce que vous commandez la première fois est exactement ce que vous recevrez à chaque livraison.') },
            ],
          },
        ],
      },
      // 8. Engagements qualité — 3 colonnes
      {
        settings: { background: 'surface-container-low', paddingTop: 4, paddingBottom: 20 },
        columns: [
          {
            width: 4,
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Traçabilité complète', level: 3 } },
              { type: 'rich_text', sortOrder: 1, data: richText("Chaque lot est identifié et tracé de la matière première jusqu'au produit fini. Vous savez exactement d'où vient la farine que vous servez à vos clients.") },
            ],
          },
          {
            width: 4,
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Constance lot après lot', level: 3 } },
              { type: 'rich_text', sortOrder: 1, data: richText('Notre process de transformation garantit une granulométrie, une texture et un goût identiques à chaque commande. Vos recettes ne varient pas, votre réputation non plus.') },
            ],
          },
          {
            width: 4,
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Certification & Conformité', level: 3 } },
              { type: 'rich_text', sortOrder: 1, data: richText("Produit fabriqué selon les normes HACCP. Fiche technique et certificat d'analyse disponibles sur demande pour vos dossiers réglementaires et vos audits.") },
            ],
          },
        ],
      },
      // 9. FAQ — titre
      {
        settings: { background: 'surface', paddingTop: 20, paddingBottom: 8 },
        columns: [
          {
            width: 12,
            settings: { align: 'center' },
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Questions fréquentes', level: 2 } },
            ],
          },
        ],
      },
      // 9. FAQ — 2 colonnes
      {
        settings: { background: 'surface', paddingTop: 4, paddingBottom: 20 },
        columns: [
          {
            width: 6,
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Y a-t-il un minimum de commande ?', level: 3 } },
              { type: 'rich_text', sortOrder: 1, data: richText('Oui, la commande minimum est de 25 kg par produit. En dessous de ce seuil, nous vous orientons vers notre boutique en ligne.') },
              { type: 'heading', sortOrder: 2, data: { text: 'Quelle est la durée de conservation ?', level: 3 } },
              { type: 'rich_text', sortOrder: 3, data: richText("Nos farines se conservent 12 mois dans un endroit sec, à l'abri de la lumière et de l'humidité. La DLUO est imprimée sur chaque emballage.") },
              { type: 'heading', sortOrder: 4, data: { text: 'Livrez-vous en dehors de Cotonou ?', level: 3 } },
              { type: 'rich_text', sortOrder: 5, data: richText("Oui, nous livrons sur tout le territoire béninois. Pour les commandes à l'international, contactez-nous pour un devis transport spécifique.") },
            ],
          },
          {
            width: 6,
            blocks: [
              { type: 'heading', sortOrder: 0, data: { text: 'Proposez-vous le marquage à la marque (private label) ?', level: 3 } },
              { type: 'rich_text', sortOrder: 1, data: richText('Oui, pour les commandes supérieures à 500 kg nous pouvons conditionner la farine avec votre propre étiquetage. Un délai de production supplémentaire est à prévoir.') },
              { type: 'heading', sortOrder: 2, data: { text: 'Puis-je avoir un échantillon avant de commander ?', level: 3 } },
              { type: 'rich_text', sortOrder: 3, data: richText('Absolument. Envoyez-nous une demande via le formulaire de contact. Nous expédions gratuitement un kit de découverte de nos principales références.') },
              { type: 'heading', sortOrder: 4, data: { text: 'Quels modes de paiement acceptez-vous ?', level: 3 } },
              { type: 'rich_text', sortOrder: 5, data: richText('Virement bancaire, Mobile Money (MTN, Moov) et chèque pour les partenaires établis. Un acompte de 50 % est demandé à la confirmation de commande.') },
            ],
          },
        ],
      },
      // 10. CTA final
      {
        settings: { background: 'primary', paddingY: 20 },
        columns: [
          {
            width: 12,
            blocks: [
              { type: 'cta_banner', sortOrder: 0, data: { title: "Prêt à passer à l'échelle ?", text: "Envoyez-nous votre demande aujourd'hui et recevez un devis personnalisé sous 48 heures. Notre équipe est disponible pour répondre à toutes vos questions.", buttonLabel: 'Demander un devis', buttonHref: '/contact' } },
            ],
          },
        ],
      },
    ],
  },
];

async function seedPages() {
  for (const pageDef of PAGES) {
    const existing = await prisma.page.findUnique({ where: { slug: pageDef.slug } });
    if (existing) {
      console.log(`  ↳ Page "${pageDef.slug}" déjà présente, ignorée.`);
      continue;
    }

    const page = await prisma.page.create({
      data: {
        slug: pageDef.slug,
        title: pageDef.title,
        metaDescription: pageDef.metaDescription,
        status: 'published',
      },
    });

    for (const [rowIdx, rowDef] of pageDef.rows.entries()) {
      const row = await prisma.pageRow.create({
        data: {
          pageId: page.id,
          sortOrder: rowIdx,
          settings: (rowDef.settings ?? {}) as Prisma.InputJsonValue,
        },
      });

      for (const [colIdx, colDef] of rowDef.columns.entries()) {
        const col = await prisma.pageColumn.create({
          data: {
            rowId: row.id,
            sortOrder: colIdx,
            width: colDef.width,
            settings: (colDef.settings ?? {}) as Prisma.InputJsonValue,
          },
        });

        for (const blockDef of colDef.blocks) {
          const mediaId = await resolveMedia(blockDef.mediaPath);
          await prisma.pageBlock.create({
            data: {
              columnId: col.id,
              sortOrder: blockDef.sortOrder,
              type: blockDef.type as never,
              data: blockDef.data as never,
              mediaId,
            },
          });
        }
      }
    }

    console.log(`  ✔ Page "${pageDef.slug}" créée (${pageDef.rows.length} rangées)`);
  }
  console.log(`✔ Pages (${PAGES.length} pages)`);
}

// ── Point d'entrée ────────────────────────────────────────────────────────────

async function main() {
  console.log('Démarrage du seed...\n');
  await seedAdmin();
  await seedPages();
  console.log('\nSeed terminé.');
}

main()
  .catch((error) => {
    console.error('Échec du seed :', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
