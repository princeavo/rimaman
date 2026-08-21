import { z } from 'zod';

/**
 * Convertit une variable d'environnement texte en booléen strict.
 * `z.coerce.boolean()` ne convient pas : `Boolean("false")` vaut `true` en
 * JS (chaîne non vide), ce qui activerait WhatsApp même avec
 * WHATSAPP_ENABLED=false dans le .env.
 */
const booleanFromString = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

/**
 * Schéma de validation des variables d'environnement.
 * Le process s'arrête au démarrage si une variable obligatoire manque ou est mal formée
 * plutôt que d'échouer plus tard avec une erreur obscure.
 */
export const envSchema = z.object({
  DATABASE_URL: z.string().min(1),

  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  FRONTEND_ORIGIN: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),

  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(8).optional(),

  MEDIA_STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  MEDIA_LOCAL_PATH: z.string().default('./uploads'),
  MEDIA_PUBLIC_URL: z.string().url(),

  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: booleanFromString,
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  NOTIFICATION_EMAIL_FROM: z.string().email(),
  NOTIFICATION_EMAIL_TO: z.string().email(),

  WHATSAPP_ENABLED: booleanFromString,
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional().default(''),
  WHATSAPP_ACCESS_TOKEN: z.string().optional().default(''),
  WHATSAPP_RECIPIENT_NUMBER: z.string().optional().default(''),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Configuration d'environnement invalide :\n${issues}`);
  }
  return result.data;
}
