import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { logger } from '../utils/logger.js';
import prompts from 'prompts';

export async function initCommand() {
  try {
    logger.info('🚀 Welcome to Verbi! Let\'s set up your project.\n');

    // Check if config already exists
    const configFiles = ['verbi.config.ts', 'verbi.config.js', 'verbi.config.mjs'];
    const existingConfig = configFiles.find(f => existsSync(join(process.cwd(), f)));

    if (existingConfig) {
      logger.warn(`Configuration file already exists: ${existingConfig}`);
      const { overwrite } = await prompts({
        type: 'confirm',
        name: 'overwrite',
        message: 'Do you want to overwrite it?',
        initial: false
      });

      if (!overwrite) {
        logger.info('Initialization cancelled.');
        return;
      }
    }

    // Interactive prompts
    const answers = await prompts([
      {
        type: 'text',
        name: 'sourceLocale',
        message: 'What is your source locale?',
        initial: 'en'
      },
      {
        type: 'list',
        name: 'locales',
        message: 'Which locales do you want to translate to? (comma-separated)',
        initial: 'es,fr,de',
        separator: ','
      },
      {
        type: 'select',
        name: 'provider',
        message: 'Which AI provider do you want to use?',
        choices: [
          { title: 'OpenAI (GPT-4o-mini)', value: 'openai' },
          { title: 'Anthropic (Claude)', value: 'anthropic' },
          { title: 'DeepL', value: 'deepl' }
        ],
        initial: 0
      },
      {
        type: 'text',
        name: 'messagesDir',
        message: 'Where should messages be stored?',
        initial: './messages'
      },
      {
        type: 'confirm',
        name: 'addScripts',
        message: 'Add Verbi scripts to package.json?',
        initial: true
      }
    ]);

    if (!answers.provider) {
      logger.error('Setup cancelled.');
      return;
    }

    // Generate config template
    const configTemplate = generateConfigTemplate(answers);

    // Create config file
    const configPath = join(process.cwd(), 'verbi.config.ts');
    await writeFile(configPath, configTemplate);
    logger.success(`✓ Created ${configPath}`);

    // Create messages directory
    const messagesDir = join(process.cwd(), answers.messagesDir || 'messages');
    if (!existsSync(messagesDir)) {
      await mkdir(messagesDir, { recursive: true });
      logger.success(`✓ Created ${messagesDir}/`);
    }

    // Create .env.local template if it doesn't exist
    const envPath = join(process.cwd(), '.env.local');
    if (!existsSync(envPath)) {
      const envTemplate = generateEnvTemplate(answers.provider);
      await writeFile(envPath, envTemplate);
      logger.success(`✓ Created ${envPath}`);
    }

    // Add to .gitignore
    await updateGitignore();

    // Add scripts to package.json if requested
    if (answers.addScripts) {
      await addPackageJsonScripts();
    }

    // Success message
    logger.success('\n✨ Verbi initialized successfully!\n');
    logger.info('Next steps:');
    logger.info(`1. Add your ${answers.provider.toUpperCase()} API key to .env.local`);
    logger.info('2. Start using Verbi in your code:');
    logger.info('   • Client components: <Trans>Hello World</Trans>');
    logger.info('   • Client components: {t`Hello World`}');
    logger.info('   • Server components: {t(\'Hello World\')}');
    logger.info('3. Run `pnpm verbi:scan` to extract messages');
    logger.info('4. Run `pnpm verbi:translate` to translate');
    logger.info('\n📚 Documentation: https://github.com/yourusername/verbi');
  } catch (error) {
    if (error instanceof Error && error.message === 'canceled') {
      logger.info('\nSetup cancelled.');
      return;
    }
    logger.error('Initialization failed:', error);
    process.exit(1);
  }
}

function generateConfigTemplate(answers: any): string {
  const providerConfig = {
    openai: {
      import: 'openai',
      config: `{
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4o-mini',
    temperature: 0.3,
  }`
    },
    anthropic: {
      import: 'anthropic',
      config: `{
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: 'claude-3-5-sonnet-20241022',
  }`
    },
    deepl: {
      import: 'deepl',
      config: `{
    apiKey: process.env.DEEPL_API_KEY!,
  }`
    }
  };

  const provider = providerConfig[answers.provider as keyof typeof providerConfig];

  return `import { defineConfig } from 'verbi/config';

export default defineConfig({
  sourceLocale: '${answers.sourceLocale}',
  locales: [${answers.locales.map((l: string) => `'${l}'`).join(', ')}],
  messagesDir: '${answers.messagesDir}',
  include: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
  exclude: ['**/*.test.*', '**/*.spec.*', 'node_modules'],
  namespaceStrategy: 'flat',
  provider: {
    name: '${answers.provider}',
    config: ${provider.config}
  },
  cache: {
    enabled: true,
    ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  glossary: [
    // Add brand terms and technical terms to preserve
    // { term: 'YourBrand', keep: true },
  ],
});
`;
}

function generateEnvTemplate(provider: string): string {
  const templates = {
    openai: `# Verbi - OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Alternative providers (uncomment if needed):
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# DEEPL_API_KEY=your_deepl_api_key_here
`,
    anthropic: `# Verbi - Anthropic Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Alternative providers (uncomment if needed):
# OPENAI_API_KEY=your_openai_api_key_here
# DEEPL_API_KEY=your_deepl_api_key_here
`,
    deepl: `# Verbi - DeepL Configuration
DEEPL_API_KEY=your_deepl_api_key_here

# Alternative providers (uncomment if needed):
# OPENAI_API_KEY=your_openai_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
`
  };

  return templates[provider as keyof typeof templates] || templates.openai;
}

async function updateGitignore(): Promise<void> {
  const gitignorePath = join(process.cwd(), '.gitignore');
  if (existsSync(gitignorePath)) {
    const gitignoreContent = await readFile(gitignorePath, 'utf-8');
    const linesToAdd = ['.verbi-cache', 'messages/.verbi', '.env.local'];
    const newLines = linesToAdd.filter(line => !gitignoreContent.includes(line));

    if (newLines.length > 0) {
      await writeFile(
        gitignorePath,
        gitignoreContent + '\n# Verbi\n' + newLines.join('\n') + '\n'
      );
      logger.success('✓ Updated .gitignore');
    }
  }
}

async function addPackageJsonScripts(): Promise<void> {
  const packageJsonPath = join(process.cwd(), 'package.json');

  if (!existsSync(packageJsonPath)) {
    logger.warn('No package.json found, skipping scripts addition');
    return;
  }

  try {
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    const scriptsToAdd = {
      'verbi:scan': 'verbi scan',
      'verbi:translate': 'verbi translate --all'
    };

    let added = false;
    for (const [key, value] of Object.entries(scriptsToAdd)) {
      if (!packageJson.scripts[key]) {
        packageJson.scripts[key] = value;
        added = true;
      }
    }

    if (added) {
      await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      logger.success('✓ Added scripts to package.json');
    } else {
      logger.info('Scripts already exist in package.json');
    }
  } catch (error) {
    logger.warn('Could not update package.json:', error);
  }
}
