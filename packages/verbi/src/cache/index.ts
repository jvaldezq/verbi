import type { GlossaryTerm } from '../config/schema.js';

export interface Cache {
  get(
    key: string,
    sourceLocale: string,
    targetLocale: string,
    sourceText: string,
    glossary: GlossaryTerm[]
  ): Promise<string | null>;

  set(
    key: string,
    sourceLocale: string,
    targetLocale: string,
    sourceText: string,
    glossary: GlossaryTerm[],
    translation: string
  ): Promise<void>;

  clear(): Promise<void>;
}

export async function getCache(config: { kind: string; path?: string }): Promise<Cache> {
  if (config.kind === 'file') {
    const { FileCache } = await import('./file-store.js');
    return new FileCache(config.path || '.verbi-cache');
  }

  if (config.kind === 'memory') {
    const { MemoryCache } = await import('./memory-store.js');
    return new MemoryCache();
  }

  throw new Error(`Unknown cache kind: ${config.kind}`);
}