import type { Provider, TranslationRequest, TranslationResponse } from './base.js';
import { logger } from '../utils/logger.js';

export interface RouterRule {
  match: string[]; // e.g., ['en>fr', 'en>*']
  use: Provider;
}

export interface RouterConfig {
  rules: RouterRule[];
  fallback?: Provider;
}

export function router(config: RouterConfig): Provider {
  return {
    name: 'router',

    async translate(requests: TranslationRequest[]): Promise<TranslationResponse[]> {
      if (requests.length === 0) {
        return [];
      }

      // Group requests by locale pair
      const groups = new Map<Provider, TranslationRequest[]>();

      for (const req of requests) {
        const provider = findProvider(req.sourceLocale, req.targetLocale, config);
        const existing = groups.get(provider) || [];
        existing.push(req);
        groups.set(provider, existing);
      }

      logger.debug(`Routing translations to ${groups.size} provider(s)`);

      // Translate each group
      const results = await Promise.all(
        Array.from(groups.entries()).map(async ([provider, reqs]) => {
          logger.debug(`Sending ${reqs.length} texts to ${provider.name}`);
          return provider.translate(reqs);
        })
      );

      return results.flat();
    },

    async validateConfig(): Promise<boolean> {
      // Validate all providers
      const providers = [...new Set(config.rules.map(r => r.use))];
      if (config.fallback) providers.push(config.fallback);

      logger.info(`Validating ${providers.length} provider(s)...`);

      const results = await Promise.all(
        providers.map(async p => {
          const valid = await p.validateConfig();
          if (valid) {
            logger.success(`Provider ${p.name} validated`);
          } else {
            logger.error(`Provider ${p.name} validation failed`);
          }
          return valid;
        })
      );

      return results.every(r => r);
    },
  };
}

function findProvider(
  sourceLocale: string,
  targetLocale: string,
  config: RouterConfig
): Provider {
  const pair = `${sourceLocale}>${targetLocale}`;

  for (const rule of config.rules) {
    for (const pattern of rule.match) {
      if (matchPattern(pair, pattern)) {
        logger.debug(`Matched ${pair} to pattern ${pattern} -> ${rule.use.name}`);
        return rule.use;
      }
    }
  }

  if (config.fallback) {
    logger.debug(`Using fallback provider for ${pair} -> ${config.fallback.name}`);
    return config.fallback;
  }

  throw new Error(`No provider found for locale pair: ${pair}`);
}

function matchPattern(pair: string, pattern: string): boolean {
  // Convert pattern to regex
  // * matches any locale
  // > is literal
  const regexPattern = pattern
    .replace(/\*/g, '[^>]+')
    .replace(/>/g, '>');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(pair);
}