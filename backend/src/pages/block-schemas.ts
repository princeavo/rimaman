import { z } from 'zod';
import { PageBlockType } from '@prisma/client';

/**
 * Schéma strict par type de bloc. La liberté du page builder porte sur la
 * composition (quels blocs, dans quel ordre, dans quelles colonnes) et sur
 * le contenu de chaque champ — jamais sur la structure : aucun bloc ne peut
 * stocker de HTML/CSS/JS arbitraire, seulement des champs typés.
 */
export const blockDataSchemas: Record<PageBlockType, z.ZodType> = {
  [PageBlockType.heading]: z.object({
    text: z.string().min(1).max(200),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  }),
  [PageBlockType.rich_text]: z.object({
    // Document JSON Tiptap — la forme exacte est libre (c'est le format de
    // l'éditeur), mais ça reste du JSON structuré, jamais du HTML brut.
    content: z.record(z.string(), z.unknown()),
  }),
  [PageBlockType.image]: z.object({
    alt: z.string().max(200).optional().default(''),
  }),
  [PageBlockType.image_text]: z.object({
    title: z.string().min(1).max(200),
    text: z.string().min(1).max(2000),
    imagePosition: z.enum(['left', 'right']).default('left'),
  }),
  [PageBlockType.button]: z.object({
    label: z.string().min(1).max(100),
    href: z.string().min(1).max(500),
    variant: z.enum(['primary', 'outline', 'secondary']).default('primary'),
  }),
  [PageBlockType.button_group]: z.object({
    buttons: z
      .array(
        z.object({
          label: z.string().min(1).max(100),
          href: z.string().min(1).max(500),
          variant: z.enum(['primary', 'outline', 'secondary']).default('primary'),
        }),
      )
      .min(1)
      .max(4),
  }),
  [PageBlockType.cta_banner]: z.object({
    title: z.string().min(1).max(200),
    text: z.string().max(500).optional().default(''),
    buttonLabel: z.string().min(1).max(100),
    buttonHref: z.string().min(1).max(500),
  }),
  [PageBlockType.stats]: z.object({
    items: z
      .array(
        z.object({
          value: z.string().min(1).max(50),
          label: z.string().min(1).max(100),
        }),
      )
      .min(1)
      .max(6),
  }),
  [PageBlockType.video]: z.object({}),
  [PageBlockType.spacer]: z.object({
    height: z.number().int().min(0).max(400),
  }),
  [PageBlockType.product_grid]: z.object({
    productIds: z.array(z.string().uuid()).max(12).optional().default([]),
  }),
  [PageBlockType.recipe_grid]: z.object({
    recipeIds: z.array(z.string().uuid()).max(12).optional().default([]),
  }),
};

export function validateBlockData(type: PageBlockType, data: unknown): Record<string, unknown> {
  const schema = blockDataSchemas[type];
  const result = schema.safeParse(data ?? {});
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Données invalides pour le bloc "${type}" : ${issues}`);
  }
  return result.data as Record<string, unknown>;
}
