import { createHash } from 'crypto';
import type { Cache } from './index.js';
import type { GlossaryTerm } from '../config/schema.js';

interface CacheEntry {
  translation: string;
  timestamp: number;
}

export class MemoryCache implements Cache {
  private cache = new Map<string, CacheEntry>();

  private getCacheKey(
    key: string,
    sourceLocale: string,
    targetLocale: string,
    sourceText: string,
    glossary: GlossaryTerm[]
  ): string {
    const hash = createHash('sha256');
    hash.update(key);
    hash.update(sourceText);
    hash.update(sourceLocale);
    hash.update(targetLocale);
    hash.update(JSON.stringify(glossary));
    return hash.digest('hex');
  }

  async get(
    key: string,
    sourceLocale: string,
    targetLocale: string,
    sourceText: string,
    glossary: GlossaryTerm[]
  ): Promise<string | null> {
    const cacheKey = this.getCacheKey(key, sourceLocale, targetLocale, sourceText, glossary);
    const entry = this.cache.get(cacheKey);

    return entry?.translation || null;
  }

  async set(
    key: string,
    sourceLocale: string,
    targetLocale: string,
    sourceText: string,
    glossary: GlossaryTerm[],
    translation: string
  ): Promise<void> {
    const cacheKey = this.getCacheKey(key, sourceLocale, targetLocale, sourceText, glossary);

    this.cache.set(cacheKey, {
      translation,
      timestamp: Date.now(),
    });
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}