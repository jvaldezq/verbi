#!/usr/bin/env node

// Load environment variables from .env files
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Load .env.local first (higher priority)
if (existsSync(resolve(process.cwd(), '.env.local'))) {
  dotenv.config({ path: '.env.local' });
}
// Then load .env (lower priority)
if (existsSync(resolve(process.cwd(), '.env'))) {
  dotenv.config({ path: '.env' });
}

import { Command } from 'commander';
import { scanCommand } from './scan.js';
import { translateCommand } from './translate.js';
import { initCommand } from './init.js';
// Use a hardcoded version to avoid import.meta issues
const packageVersion = '0.1.0';

const program = new Command();

program
  .name('verbi')
  .description('AI-powered i18n for Next.js')
  .version(packageVersion);

program
  .command('init')
  .description('Initialize Verbi in your project')
  .action(initCommand);

program
  .command('scan')
  .description('Extract translatable content from code')
  .option('-c, --config <path>', 'Config file path')
  .action(scanCommand);

program
  .command('translate')
  .description('Translate messages using AI')
  .option('-l, --locales <locales>', 'Comma-separated locales')
  .option('-a, --all', 'Translate all configured locales')
  .option('-c, --config <path>', 'Config file path')
  .action(translateCommand);

program.parse();