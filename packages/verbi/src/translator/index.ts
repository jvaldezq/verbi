import { readFile } from 'fs/promises';
import { join } from 'path';
import type { VerbiConfig } from '../config/schema.js';
import type { Provider } from '../providers/base.js';
import { diffCatalogs, filterItemsForTranslation } from './differ.js';
import { BatchProcessor } from './batcher.js';
import { withRetry } from './retry.js';
import { getCache } from '../cache/index.js';
import { logger } from '../utils/logger.js';
import { readJSON, writeJSON, fileExists } from '../utils/fs.js';

export interface TranslationStats {
  locale: string;
  total: number;
  translated: number;
  cached: number;
  alreadyTranslated: number;
}

export async function translateLocale(
  locale: string,
  config: VerbiConfig,
  provider: Provider
): Promise<TranslationStats> {
  logger.info(`Translating to ${locale}...`);

  // Load source catalog
  const sourceCatalog = await loadCatalog(config.sourceLocale, config);
  const totalMessages = Object.keys(sourceCatalog).length;

  // Load target catalog (may not exist)
  let targetCatalog: Record<string, string> = {};
  try {
    targetCatalog = await loadCatalog(locale, config);
  } catch (error) {
    logger.debug(`Target catalog for ${locale} doesn't exist yet, creating new`);
  }

  const alreadyTranslated = Object.keys(targetCatalog).length;

  // Find missing/changed translations
  const diffItems = diffCatalogs(sourceCatalog, targetCatalog);
  const toTranslate = filterItemsForTranslation(diffItems);

  if (toTranslate.length === 0) {
    logger.success(`${locale}: ✓ All ${totalMessages} messages up to date`);
    return {
      locale,
      total: totalMessages,
      translated: 0,
      cached: 0,
      alreadyTranslated: totalMessages
    };
  }

  logger.info(`${locale}: Found ${toTranslate.length} texts to translate`);

  // Check cache
  const cache = await getCache(config.cache);
  const uncached: typeof toTranslate = [];
  let cachedCount = 0;

  for (const item of toTranslate) {
    const cached = await cache.get(
      item.key,
      config.sourceLocale,
      locale,
      item.text,
      config.glossary
    );

    if (cached) {
      targetCatalog[item.key] = cached;
      cachedCount++;
      logger.debug(`Cache hit for ${item.key}`);
    } else {
      uncached.push(item);
    }
  }

  let newlyTranslated = 0;

  if (uncached.length > 0) {
    logger.info(`${locale}: Translating ${uncached.length} new texts via ${provider.name}`);

    // Create batch processor
    const processor = new BatchProcessor(
      async (batch) => {
        const requests = batch.map(item => ({
          key: item.key,
          sourceText: item.text,
          sourceLocale: config.sourceLocale,
          targetLocale: locale,
          glossary: config.glossary,
        }));

        return await withRetry(
          () => provider.translate(requests),
          {
            maxAttempts: 3,
            delay: 1000,
            backoff: 'exponential',
            onRetry: (attempt, error) => {
              logger.warn(`Translation retry ${attempt}: ${error.message}`);
            },
          }
        );
      },
      {
        batchSize: 50, // Translate 50 items at a time
        concurrency: 2, // Run 2 batches in parallel
        onProgress: (progress) => {
          logger.progress(
            `${locale}: ${progress.completed}/${progress.total} (${Math.round(
              progress.percentage
            )}%)`
          );
        },
      }
    );

    const responses = await processor.process(uncached);
    newlyTranslated = responses.length;

    // Update catalog and cache
    for (const response of responses) {
      targetCatalog[response.key] = response.text;

      const sourceText = uncached.find(item => item.key === response.key)?.text;
      if (sourceText) {
        await cache.set(
          response.key,
          config.sourceLocale,
          locale,
          sourceText,
          config.glossary,
          response.text
        );
      }
    }
  }

  // Write updated catalog
  await saveCatalog(locale, targetCatalog, config);

  const stats: TranslationStats = {
    locale,
    total: totalMessages,
    translated: newlyTranslated,
    cached: cachedCount,
    alreadyTranslated
  };

  logger.success(`${locale}: ✓ Translated ${newlyTranslated} new, ${cachedCount} from cache, ${alreadyTranslated} existing`);

  return stats;
}

async function loadCatalog(
  locale: string,
  config: VerbiConfig
): Promise<Record<string, string>> {
  // Try different namespace strategies
  const possiblePaths = [
    join(config.messagesDir, locale, 'messages.json'),
    join(config.messagesDir, locale, 'root.json'),
    join(config.messagesDir, locale, 'index.json'),
  ];

  let catalog: Record<string, string> = {};

  for (const path of possiblePaths) {
    if (await fileExists(path)) {
      const content = await readJSON<any>(path);

      // Flatten the catalog structure
      for (const [key, value] of Object.entries(content)) {
        if (typeof value === 'object' && value !== null && 'message' in value) {
          catalog[key] = (value as any).message;
        } else {
          catalog[key] = String(value);
        }
      }
    }
  }

  // If still empty, try loading all JSON files in the locale directory
  if (Object.keys(catalog).length === 0) {
    const fg = await import('fast-glob');
    const pattern = join(config.messagesDir, locale, '**/*.json');
    const files = await fg.default(pattern);

    for (const file of files) {
      const content = await readJSON<any>(file);

      for (const [key, value] of Object.entries(content)) {
        if (typeof value === 'object' && value !== null && 'message' in value) {
          catalog[key] = (value as any).message;
        } else {
          catalog[key] = String(value);
        }
      }
    }
  }

  return catalog;
}

async function saveCatalog(
  locale: string,
  catalog: Record<string, string>,
  config: VerbiConfig
): Promise<void> {
  // For now, save as a single file
  // In production, we'd respect the namespace strategy
  const catalogPath = join(config.messagesDir, locale, 'messages.json');

  // Transform to match the source format
  const formatted: Record<string, any> = {};
  for (const [key, text] of Object.entries(catalog)) {
    formatted[key] = {
      message: text,
    };
  }

  await writeJSON(catalogPath, formatted);
}

export async function translateAll(
  config: VerbiConfig,
  provider: Provider
): Promise<void> {
  logger.info(`Translating to all configured locales: ${config.locales.join(', ')}`);

  for (const locale of config.locales) {
    if (locale === config.sourceLocale) {
      logger.debug(`Skipping source locale ${locale}`);
      continue;
    }

    await translateLocale(locale, config, provider);
  }

  logger.success('All translations complete!');
}