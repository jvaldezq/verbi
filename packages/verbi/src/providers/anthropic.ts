import type { Provider, TranslationRequest, TranslationResponse } from './base.js';
import { buildSystemPrompt, buildUserPrompt, parseAIResponse } from './prompt.js';
import { logger } from '../utils/logger.js';

export interface AnthropicConfig {
  apiKey: string;
  model?: string;
  maxRetries?: number;
  baseURL?: string;
}

export function anthropic(config: AnthropicConfig): Provider {
  let anthropicModule: typeof import('@anthropic-ai/sdk') | null = null;

  async function getAnthropic() {
    if (!anthropicModule) {
      try {
        anthropicModule = await import('@anthropic-ai/sdk');
      } catch (error) {
        throw new Error(
          'Anthropic package not installed. Please run: npm install @anthropic-ai/sdk'
        );
      }
    }
    const clientConfig: any = {
      apiKey: config.apiKey,
      maxRetries: config.maxRetries || 3,
    };

    if (config.baseURL) {
      clientConfig.baseURL = config.baseURL;
    }

    return new anthropicModule.default(clientConfig);
  }

  return {
    name: 'anthropic',

    async translate(requests: TranslationRequest[]): Promise<TranslationResponse[]> {
      if (requests.length === 0) {
        return [];
      }

      const client = await getAnthropic();
      const model = config.model || 'claude-3-haiku-20240307';

      const firstRequest = requests[0];
      if (!firstRequest) {
        throw new Error('No requests provided');
      }
      const { sourceLocale, targetLocale, glossary } = firstRequest;

      logger.debug(`Translating ${requests.length} texts with Anthropic (${model})`);

      try {
        const response = await (client as any).messages.create({
          model,
          max_tokens: 4096,
          system: buildSystemPrompt(sourceLocale, targetLocale, glossary),
          messages: [
            {
              role: 'user',
              content: buildUserPrompt(requests),
            },
          ],
        });

        const content = response.content[0];
        if (content.type !== 'text') {
          throw new Error('Unexpected response type from Anthropic');
        }

        const translations = parseAIResponse(content.text);

        return translations.map(t => ({
          key: t.key,
          text: t.text,
          confidence: 0.95,
          metadata: {
            provider: 'anthropic',
            model,
          },
        }));
      } catch (error) {
        logger.error('Anthropic translation failed:', error);
        throw error;
      }
    },

    async validateConfig(): Promise<boolean> {
      try {
        const client = await getAnthropic();
        // Try a minimal request to validate the API key
        await (client as any).messages.create({
          model: config.model || 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }],
        });
        logger.success('Anthropic configuration validated successfully');
        return true;
      } catch (error) {
        logger.error('Anthropic configuration validation failed:', error);
        return false;
      }
    },
  };
}