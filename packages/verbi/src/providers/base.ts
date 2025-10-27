export interface TranslationRequest {
  key: string;
  sourceText: string;
  sourceLocale: string;
  targetLocale: string;
  context?: string;
  glossary?: Array<{ term: string; keep: boolean }>;
}

export interface TranslationResponse {
  key: string;
  text: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export interface Provider {
  name: string;
  translate(requests: TranslationRequest[]): Promise<TranslationResponse[]>;
  validateConfig(): Promise<boolean>;
}

export interface ProviderFactory {
  (config: Record<string, unknown>): Provider;
}

export abstract class BaseProvider implements Provider {
  abstract name: string;

  abstract translate(requests: TranslationRequest[]): Promise<TranslationResponse[]>;

  async validateConfig(): Promise<boolean> {
    try {
      // Try a simple translation to validate the config
      await this.translate([
        {
          key: 'test',
          sourceText: 'Hello',
          sourceLocale: 'en',
          targetLocale: 'es',
        },
      ]);
      return true;
    } catch {
      return false;
    }
  }
}