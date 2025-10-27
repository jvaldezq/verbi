import type { Provider, TranslationRequest, TranslationResponse } from './base.js';
import { buildSystemPrompt, buildUserPrompt, parseAIResponse } from './prompt.js';
import { logger } from '../utils/logger.js';

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxRetries?: number;
  baseURL?: string;
}

export function openai(config: OpenAIConfig): Provider {
  let openaiModule: typeof import('openai') | null = null;

  async function getOpenAI() {
    if (!openaiModule) {
      try {
        openaiModule = await import('openai');
      } catch (error) {
        throw new Error(
          'OpenAI package not installed. Please run: npm install openai'
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

    return new openaiModule.default(clientConfig);
  }

  return {
    name: 'openai',

    async translate(requests: TranslationRequest[]): Promise<TranslationResponse[]> {
      if (requests.length === 0) {
        return [];
      }

      const client = await getOpenAI();
      const model = config.model || 'gpt-4o-mini';

      // Use first request as reference (batch should have same locale pair)
      const firstRequest = requests[0];
      if (!firstRequest) {
        throw new Error('No requests provided');
      }
      const { sourceLocale, targetLocale, glossary } = firstRequest;

      logger.debug(`Translating ${requests.length} texts with OpenAI (${model})`);

      try {
        const response = await client.chat.completions.create({
          model,
          temperature: config.temperature || 0.3,
          messages: [
            {
              role: 'system',
              content: buildSystemPrompt(sourceLocale, targetLocale, glossary),
            },
            {
              role: 'user',
              content: buildUserPrompt(requests),
            },
          ],
          response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Empty response from OpenAI');
        }

        const translations = parseAIResponse(content);

        // Map responses back to our format
        return translations.map(t => ({
          key: t.key,
          text: t.text,
          confidence: 0.95, // OpenAI generally has high confidence
          metadata: {
            provider: 'openai',
            model,
          },
        }));
      } catch (error) {
        logger.error('OpenAI translation failed:', error);
        throw error;
      }
    },

    async validateConfig(): Promise<boolean> {
      try {
        const client = await getOpenAI();
        await client.models.list();
        logger.success('OpenAI configuration validated successfully');
        return true;
      } catch (error) {
        logger.error('OpenAI configuration validation failed:', error);
        return false;
      }
    },
  };
}