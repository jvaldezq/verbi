import type { Provider, TranslationRequest, TranslationResponse } from './base.js';
import { logger } from '../utils/logger.js';

export interface DeepLConfig {
  apiKey: string;
  formality?: 'default' | 'more' | 'less' | 'prefer_more' | 'prefer_less';
  preserveFormatting?: boolean;
}

export function deepl(config: DeepLConfig): Provider {
  let deeplModule: typeof import('deepl-node') | null = null;

  async function getDeepL() {
    if (!deeplModule) {
      try {
        deeplModule = await import('deepl-node');
      } catch (error) {
        throw new Error(
          'DeepL package not installed. Please run: npm install deepl-node'
        );
      }
    }
    return new deeplModule.Translator(config.apiKey);
  }

  // Map our locale codes to DeepL's format
  function mapToDeepLLocale(locale: string): string {
    const mapping: Record<string, string> = {
      'en': 'en-US',
      'en-US': 'en-US',
      'en-GB': 'en-GB',
      'es': 'es',
      'es-ES': 'es',
      'es-MX': 'es',
      'fr': 'fr',
      'fr-FR': 'fr',
      'de': 'de',
      'de-DE': 'de',
      'it': 'it',
      'it-IT': 'it',
      'pt': 'pt-PT',
      'pt-PT': 'pt-PT',
      'pt-BR': 'pt-BR',
      'nl': 'nl',
      'nl-NL': 'nl',
      'ja': 'ja',
      'ja-JP': 'ja',
      'ko': 'ko',
      'ko-KR': 'ko',
      'zh': 'zh',
      'zh-CN': 'zh',
      'zh-TW': 'zh',
      'ru': 'ru',
      'ru-RU': 'ru',
      'pl': 'pl',
      'pl-PL': 'pl',
    };

    return mapping[locale] || locale;
  }

  return {
    name: 'deepl',

    async translate(requests: TranslationRequest[]): Promise<TranslationResponse[]> {
      if (requests.length === 0) {
        return [];
      }

      const translator = await getDeepL();
      const firstRequest = requests[0];
      if (!firstRequest) {
        throw new Error('No requests provided');
      }
      const { sourceLocale, targetLocale } = firstRequest;

      const sourceLang = mapToDeepLLocale(sourceLocale);
      const targetLang = mapToDeepLLocale(targetLocale);

      logger.debug(`Translating ${requests.length} texts with DeepL`);

      try {
        // DeepL doesn't support batch translations with different keys,
        // so we need to translate each one individually
        const responses: TranslationResponse[] = [];

        for (const request of requests) {
          const options: any = {
            preserveFormatting: config.preserveFormatting ?? true,
            tagHandling: 'xml', // Preserve ICU placeholders
          };

          if (config.formality) {
            options.formality = config.formality;
          }

          const result = await translator.translateText(
            request.sourceText,
            sourceLang as any,
            targetLang as any,
            options
          );

          responses.push({
            key: request.key,
            text: result.text,
            confidence: 0.98, // DeepL has very high quality
            metadata: {
              provider: 'deepl',
              detectedSourceLang: result.detectedSourceLang,
            },
          });
        }

        return responses;
      } catch (error) {
        logger.error('DeepL translation failed:', error);
        throw error;
      }
    },

    async validateConfig(): Promise<boolean> {
      try {
        const translator = await getDeepL();
        await translator.getUsage();
        logger.success('DeepL configuration validated successfully');
        return true;
      } catch (error) {
        logger.error('DeepL configuration validation failed:', error);
        return false;
      }
    },
  };
}