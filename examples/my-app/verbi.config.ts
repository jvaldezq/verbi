import { defineConfig } from 'verbi/config';

export default defineConfig({
  sourceLocale: 'en',
  locales: ['es'], // Spanish as target locale
  messagesDir: './messages',
  include: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
  exclude: ['**/*.test.*', '**/*.spec.*', '**/node_modules/**'],
  provider: {
    name: 'openai',
    config: {
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-4o-mini',
      temperature: 0.3,
    }
  },
  glossary: [
    { term: 'Verbi', keep: true },
    { term: 'Next.js', keep: true },
    { term: 'AI', keep: true },
    { term: 'React', keep: true },
  ],
  cache: {
    kind: 'file',
    path: '.verbi-cache',
  },
  validate: {
    icu: true,
    placeholders: true,
    maxParaphraseDelta: 0.15,
    failOnMissing: false,
  },
  namespaceStrategy: 'flat',
});