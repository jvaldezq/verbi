import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { createHash } from 'crypto';
import type { Cache } from './index.js';
import type { GlossaryTerm } from '../config/schema.js';

interface CacheEntry {
  translation: string;
  timestamp: number;
  sourceText: string;
  targetLocale: string;
}

interface CacheData {
  version: string;
  entries: Record<string, CacheEntry>;
}

export class FileCache implements Cache {
  private cache: Map<string, CacheEntry> = new Map();
  private loaded = false;
  private readonly cacheFile: string;

  constructor(private cachePath: string) {
    this.cacheFile = join(cachePath, 'translations.json');
  }

  private async load(): Promise<void> {
    if (this.loaded) return;

    if (existsSync(this.cacheFile)) {
      try {
        const content = await readFile(this.cacheFile, 'utf-8');
        const data: CacheData = JSON.parse(content);

        // Check version compatibility
        if (data.version === '1.0') {
          this.cache = new Map(Object.entries(data.entries));
        }
      } catch (error) {
        // Ignore invalid cache, will be overwritten
        console.warn('Failed to load cache, starting fresh:', error);
      }
    }

    this.loaded = true;
  }

  private async save(): Promise<void> {
    await mkdir(this.cachePath, { recursive: true });

    const data: CacheData = {
      version: '1.0',
      entries: Object.fromEntries(this.cache.entries()),
    };

    await writeFile(this.cacheFile, JSON.stringify(data, null, 2));
  }

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
    await this.load();

    const cacheKey = this.getCacheKey(key, sourceLocale, targetLocale, sourceText, glossary);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    // Verify the source text hasn't changed
    if (entry.sourceText !== sourceText || entry.targetLocale !== targetLocale) {
      // Invalidate this cache entry
      this.cache.delete(cacheKey);
      await this.save();
      return null;
    }

    return entry.translation;
  }

  async set(
    key: string,
    sourceLocale: string,
    targetLocale: string,
    sourceText: string,
    glossary: GlossaryTerm[],
    translation: string
  ): Promise<void> {
    await this.load();

    const cacheKey = this.getCacheKey(key, sourceLocale, targetLocale, sourceText, glossary);

    this.cache.set(cacheKey, {
      translation,
      timestamp: Date.now(),
      sourceText,
      targetLocale,
    });

    await this.save();
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.loaded = true;
    await this.save();
  }

  async getStats(): Promise<{
    totalEntries: number;
    sizeInBytes: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  }> {
    await this.load();

    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(e => e.timestamp);

    return {
      totalEntries: entries.length,
      sizeInBytes: JSON.stringify(Object.fromEntries(this.cache.entries())).length,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null,
    };
  }
}