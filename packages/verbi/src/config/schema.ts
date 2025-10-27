// Type definitions for Verbi configuration
export type Locale = string;

export interface GlossaryTerm {
  term: string;
  keep?: boolean;
  translation?: Record<string, string>;
}

export interface ProviderConfig {
  name: 'openai' | 'anthropic';
  config: Record<string, any>;
}

export interface CacheConfig {
  enabled?: boolean;
  ttl?: number;
  kind?: 'file' | 'memory';
  path?: string;
}

export interface ValidationConfig {
  icu?: boolean;
  placeholders?: boolean;
  maxParaphraseDelta?: number;
  failOnMissing?: boolean;
}

export interface VerbiConfig {
  sourceLocale: string;
  locales: string[];
  messagesDir?: string;
  include?: string[];
  exclude?: string[];
  provider: ProviderConfig;
  glossary?: GlossaryTerm[];
  cache?: CacheConfig;
  validate?: ValidationConfig;
  namespaceStrategy?: 'file' | 'directory' | 'flat';
}

// Lightweight validation helper
export function validateConfig(config: any): VerbiConfig {
  if (!config || typeof config !== 'object') {
    throw new Error('Config must be an object');
  }

  if (!config.sourceLocale || typeof config.sourceLocale !== 'string') {
    throw new Error('sourceLocale is required and must be a string');
  }

  if (!Array.isArray(config.locales) || config.locales.length === 0) {
    throw new Error('locales must be a non-empty array');
  }

  if (!config.provider || typeof config.provider !== 'object') {
    throw new Error('provider is required');
  }

  if (!config.provider.name || !['openai', 'anthropic'].includes(config.provider.name)) {
    throw new Error('provider.name must be "openai" or "anthropic"');
  }

  // Return config with defaults
  return {
    sourceLocale: config.sourceLocale,
    locales: config.locales,
    messagesDir: config.messagesDir || './messages',
    include: config.include || ['src/**/*.{ts,tsx,js,jsx}', 'app/**/*.{ts,tsx,js,jsx}', 'components/**/*.{ts,tsx,js,jsx}'],
    exclude: config.exclude || ['**/*.test.*', '**/*.spec.*', '**/node_modules/**'],
    provider: config.provider,
    glossary: config.glossary || [],
    cache: {
      enabled: config.cache?.enabled !== false,
      ttl: config.cache?.ttl || 30 * 24 * 60 * 60 * 1000, // 30 days
      kind: config.cache?.kind || 'file',
      path: config.cache?.path || '.verbi-cache',
    },
    validate: {
      icu: config.validate?.icu !== false,
      placeholders: config.validate?.placeholders !== false,
      maxParaphraseDelta: config.validate?.maxParaphraseDelta || 0.15,
      failOnMissing: config.validate?.failOnMissing || false,
    },
    namespaceStrategy: config.namespaceStrategy || 'directory',
  };
}