import { existsSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import { VerbiConfigSchema, type VerbiConfig } from './schema.js';
import { VerbiError } from '../utils/errors.js';

const CONFIG_FILES = [
  'verbi.config.ts',
  'verbi.config.js',
  'verbi.config.mjs',
];

export async function loadConfig(cwd: string = process.cwd()): Promise<VerbiConfig> {
  const configPath = CONFIG_FILES.map(f => resolve(cwd, f)).find(p => existsSync(p));

  if (!configPath) {
    throw new VerbiError(
      'Config file not found. Run `verbi init` to create one.',
      'CONFIG_NOT_FOUND'
    );
  }

  try {
    // Dynamic import to support both ESM and CJS
    const configModule = await import(pathToFileURL(configPath).href);
    const rawConfig = configModule.default || configModule;

    // Validate with Zod
    const config = VerbiConfigSchema.parse(rawConfig);

    return config;
  } catch (error) {
    if (error instanceof Error) {
      throw new VerbiError(
        `Failed to load config: ${error.message}`,
        'CONFIG_INVALID',
        { cause: error }
      );
    }
    throw error;
  }
}

export function defineConfig(config: VerbiConfig): VerbiConfig {
  return config;
}