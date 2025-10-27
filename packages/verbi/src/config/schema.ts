import { z } from 'zod';

export const LocaleSchema = z.enum([
  'en', 'en-US', 'en-GB',
  'es', 'es-ES', 'es-CR', 'es-MX',
  'fr', 'fr-FR', 'fr-CA',
  'de', 'de-DE', 'de-AT',
  'it', 'it-IT',
  'pt', 'pt-BR', 'pt-PT',
  'nl', 'nl-NL', 'nl-BE',
  'ja', 'ja-JP',
  'ko', 'ko-KR',
  'zh', 'zh-CN', 'zh-TW',
  'ar', 'ar-SA',
  'ru', 'ru-RU',
  'pl', 'pl-PL',
  'tr', 'tr-TR',
  'sv', 'sv-SE',
  'da', 'da-DK',
  'fi', 'fi-FI',
  'no', 'no-NO',
  'cs', 'cs-CZ',
  'el', 'el-GR',
  'he', 'he-IL',
  'th', 'th-TH',
  'vi', 'vi-VN',
  'id', 'id-ID',
  'hi', 'hi-IN',
]).or(z.string()); // Allow custom locales

export const GlossaryTermSchema = z.object({
  term: z.string(),
  keep: z.boolean().default(true),
  translation: z.record(LocaleSchema, z.string()).optional(),
});

export const ProviderConfigSchema = z.object({
  name: z.string(),
  config: z.record(z.unknown()),
});

export const CacheConfigSchema = z.object({
  kind: z.enum(['file', 'memory']),
  path: z.string().optional(),
});

export const ValidationConfigSchema = z.object({
  icu: z.boolean().default(true),
  placeholders: z.boolean().default(true),
  maxParaphraseDelta: z.number().min(0).max(1).default(0.15),
  failOnMissing: z.boolean().default(false),
});

export const VerbiConfigSchema = z.object({
  sourceLocale: LocaleSchema.default('en-US'),
  locales: z.array(LocaleSchema),
  messagesDir: z.string().default('./messages'),
  include: z.array(z.string()).default(['src/**/*.{ts,tsx,js,jsx}']),
  exclude: z.array(z.string()).default(['**/*.test.*', '**/*.spec.*', '**/node_modules/**']),
  provider: ProviderConfigSchema,
  glossary: z.array(GlossaryTermSchema).default([]),
  cache: CacheConfigSchema.default({ kind: 'file', path: '.verbi-cache' }),
  validate: ValidationConfigSchema.default({}),
  namespaceStrategy: z.enum(['file', 'directory', 'flat']).default('directory'),
});

export type VerbiConfig = z.infer<typeof VerbiConfigSchema>;
export type Locale = z.infer<typeof LocaleSchema>;
export type GlossaryTerm = z.infer<typeof GlossaryTermSchema>;