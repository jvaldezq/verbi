import { loadConfig } from '../config/loader.js';
import { translateLocale, translateAll } from '../translator/index.js';
import { logger } from '../utils/logger.js';

export async function translateCommand(options: {
  locales?: string;
  all?: boolean;
  config?: string;
}) {
  try {
    logger.info('Loading configuration...');
    const config = await loadConfig(options.config || process.cwd());

    // Determine which locales to translate
    let locales: string[];
    if (options.all) {
      locales = config.locales.filter(l => l !== config.sourceLocale);
    } else if (options.locales) {
      locales = options.locales.split(',').map(l => l.trim());
    } else {
      logger.error('Please specify --locales or --all');
      process.exit(1);
    }

    // Load provider dynamically
    const provider = await loadProvider(config.provider);

    // Validate provider
    logger.info('Validating provider configuration...');
    const valid = await provider.validateConfig();
    if (!valid) {
      logger.error('Provider configuration is invalid. Please check your API keys.');
      process.exit(1);
    }

    // Translate each locale
    const allStats = [];
    for (const locale of locales) {
      const stats = await translateLocale(locale, config, provider);
      allStats.push(stats);
    }

    // Show summary
    logger.success('\n✨ Translation complete!\n');
    logger.info('📊 Summary:');
    let totalNew = 0;
    let totalCached = 0;
    for (const stats of allStats) {
      totalNew += stats.translated;
      totalCached += stats.cached;
      logger.info(`  ${stats.locale}: ${stats.total} total messages`);
    }
    logger.info(`\n  Total translated: ${totalNew} new, ${totalCached} from cache`);
  } catch (error) {
    logger.error('Translation failed:', error);
    process.exit(1);
  }
}

async function loadProvider(providerConfig: any) {
  const providers = await import('../providers/index.js');

  // Handle different provider configurations
  if (typeof providerConfig === 'function') {
    return providerConfig;
  }

  if (providerConfig.name === 'openai') {
    return providers.openai(providerConfig.config);
  } else if (providerConfig.name === 'anthropic') {
    return providers.anthropic(providerConfig.config);
  } else if (providerConfig.name === 'router') {
    return providers.router(providerConfig.config);
  }

  throw new Error(`Unknown provider: ${providerConfig.name}. Supported providers: openai, anthropic, router`);
}