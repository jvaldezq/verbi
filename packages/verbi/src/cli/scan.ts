import fg from 'fast-glob';
import { join } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { loadConfig } from '../config/loader.js';
import { parseFile } from '../extractor/parser.js';
import { buildCatalogs } from '../extractor/catalog.js';
import { logger } from '../utils/logger.js';

export async function scanCommand(options: { config?: string }) {
  try {
    logger.info('Loading configuration...');
    const config = await loadConfig(options.config || process.cwd());

    logger.info('Scanning files for translatable content...');
    const files = await fg(config.include, {
      cwd: process.cwd(),
      ignore: config.exclude,
      absolute: true,
    });

    logger.info(`Found ${files.length} files to scan`);

    const allMessages = [];
    for (const file of files) {
      const messages = await parseFile(file, process.cwd());
      allMessages.push(...messages);
    }

    const uniqueMessages = Array.from(
      new Map(allMessages.map(m => [m.key, m])).values()
    );

    logger.info(`Extracted ${uniqueMessages.length} unique messages`);

    await buildCatalogs(uniqueMessages, config);

    logger.success('Scan complete!');
    logger.info(`Messages written to: ${config.messagesDir}/${config.sourceLocale}/`);

    // Check translation status for each locale
    await checkTranslationStatus(uniqueMessages, config);
  } catch (error) {
    logger.error('Scan failed:', error);
    process.exit(1);
  }
}

async function checkTranslationStatus(
  sourceMessages: any[],
  config: any
): Promise<void> {
  const targetLocales = config.locales.filter((l: string) => l !== config.sourceLocale);

  if (targetLocales.length === 0) {
    return;
  }

  logger.info('\n📊 Translation Status:');

  for (const locale of targetLocales) {
    const catalogPath = join(
      process.cwd(),
      config.messagesDir,
      locale,
      'messages.json'
    );

    if (!existsSync(catalogPath)) {
      logger.warn(`  ${locale}: ${sourceMessages.length} missing (no translations yet)`);
      continue;
    }

    try {
      const content = JSON.parse(await readFile(catalogPath, 'utf-8'));
      const existingKeys = new Set(Object.keys(content));
      const sourceKeys = new Set(sourceMessages.map(m => m.key));

      const missingCount = Array.from(sourceKeys).filter(
        key => !existingKeys.has(key)
      ).length;

      if (missingCount === 0) {
        logger.success(`  ${locale}: ✓ All ${sourceMessages.length} messages translated`);
      } else {
        logger.warn(`  ${locale}: ${missingCount} missing, ${sourceMessages.length - missingCount} translated`);
      }
    } catch (error) {
      logger.warn(`  ${locale}: Error reading translations`);
    }
  }
}