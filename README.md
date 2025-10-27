# Verbi 🌍

AI-powered internationalization for Next.js with readable source text as keys. Write natural text, run a command, and let AI translate it.

## Features

- 🎯 **Next.js Native**: Works with App Router & React Server Components
- 🤖 **AI Translation**: OpenAI, Anthropic, DeepL support
- ⚡ **Build-time**: Zero runtime AI calls
- 🔒 **Type Safe**: Full TypeScript support
- 📖 **Readable DX**: Use actual text as keys, not cryptic identifiers
- 🎨 **ICU MessageFormat**: Plurals, variables, formatting
- 💾 **Smart Caching**: Avoid redundant API calls
- ✅ **Validation**: Automatic quality checks

## Quick Start

```bash
# Install
npm install verbi

# Initialize (interactive setup)
npx verbi init

# Write translatable content in your components
// Server Components
const t = await getT(locale);
<h1>{t('Welcome to my app')}</h1>

// Client Components
<Trans>Welcome to my app</Trans>
{t`Welcome to my app`}

# Extract and translate
npx verbi scan
npx verbi translate --all
```

## Installation

```bash
npm install verbi
# or
pnpm add verbi
# or
yarn add verbi
```

Also install your chosen AI provider:

```bash
# For OpenAI
npm install openai

# For Anthropic
npm install @anthropic-ai/sdk

# For DeepL
npm install deepl-node
```

## Configuration

Run the interactive init command to create `verbi.config.ts`:

```bash
npx verbi init
```

This will guide you through:
- Choosing your source and target locales
- Selecting an AI provider (OpenAI, Anthropic, or DeepL)
- Setting up your messages directory
- Adding scripts to package.json

Example generated config:

```typescript
import { defineConfig } from 'verbi/config';

export default defineConfig({
  sourceLocale: 'en',
  locales: ['es', 'fr', 'de'],
  messagesDir: './messages',
  include: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
  exclude: ['**/*.test.*', '**/*.spec.*', 'node_modules'],
  provider: {
    name: 'openai',
    config: {
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-4o-mini',
      temperature: 0.3,
    }
  },
  cache: {
    enabled: true,
    ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  glossary: [
    { term: 'Verbi', keep: true },
  ],
});
```

## Usage

### Mark Content for Translation

Verbi uses **readable source text as keys** - no more cryptic message IDs!

**Server Components**

```tsx
import { getT } from 'verbi/next/server';

export default async function Page({ params }: { params: { locale: string } }) {
  const t = await getT(params.locale);

  return (
    <div>
      {/* Simple text */}
      <h1>{t('Welcome to Verbi')}</h1>

      {/* With variables */}
      <p>{t('Hello, {name}!', { name: 'Jordan' })}</p>

      {/* With formatting */}
      <p>{t('Today is {date}', { date: new Date().toLocaleDateString() })}</p>
    </div>
  );
}
```

**Client Components**

```tsx
'use client';

import { useT, Trans } from 'verbi/runtime';

export function MyComponent() {
  const t = useT();

  return (
    <div>
      {/* Static text with <Trans> component */}
      <h1><Trans>Welcome to Verbi</Trans></h1>

      {/* Simple text with template literal */}
      <button>{t`Click me`}</button>

      {/* Dynamic text with variables */}
      <p>{t('Hello, {name}!', { name: 'Jordan' })}</p>
    </div>
  );
}
```

### Extract Messages

```bash
npx verbi scan
```

This scans your codebase for translatable content and creates message files:

```
✓ Loading configuration...
✓ Scanning files for translatable content...
✓ Found 24 files to scan
✓ Extracted 42 unique messages
✓ Messages written to: messages/en/

📊 Translation Status:
  es: 5 missing, 37 translated
  fr: 42 missing (no translations yet)
  de: 42 missing (no translations yet)
```

### Translate

```bash
# Translate specific locales
npx verbi translate --locales es,fr

# Translate all configured locales
npx verbi translate --all
```

Output with translation statistics:

```
✓ Loading configuration...
✓ Validating provider configuration...
✓ Translating to es...
  es: Found 5 texts to translate
  es: Translating 5 new texts via OpenAI
  es: 5/5 (100%)
  es: ✓ Translated 5 new, 0 from cache, 37 existing

✨ Translation complete!

📊 Summary:
  es: 42 total messages

  Total translated: 5 new, 0 from cache
```

## Next.js Integration

### Setup Layout

```tsx
// app/[locale]/layout.tsx
import { getMessages, VerbiProvider } from 'verbi/next';

export default async function RootLayout({
  params,
  children,
}: {
  params: { locale: string };
  children: ReactNode;
}) {
  const messages = await getMessages(params.locale);

  return (
    <html lang={params.locale}>
      <body>
        <VerbiProvider locale={params.locale} messages={messages}>
          {children}
        </VerbiProvider>
      </body>
    </html>
  );
}
```

### Server Components

```tsx
import { getT } from 'verbi/next/server';

export default async function Page({ params }: { params: { locale: string } }) {
  const t = await getT(params.locale);

  return (
    <div>
      {/* Use actual text as keys - readable and maintainable */}
      <h1>{t('Welcome to Verbi')}</h1>
      <p>{t('Hello, {name}! Welcome to our app.', { name: 'Jordan' })}</p>
      <p>{t('You have {count} new messages', { count: 5 })}</p>
    </div>
  );
}
```

### Client Components

```tsx
'use client';

import { useT, Trans } from 'verbi/runtime';

export function Welcome({ name }: { name: string }) {
  const t = useT();

  return (
    <div>
      {/* Static text with <Trans> */}
      <h1><Trans>Welcome</Trans></h1>

      {/* Dynamic text with t() */}
      <p>{t('Hello, {name}!', { name })}</p>

      {/* Simple text with template literal */}
      <button>{t`Click here`}</button>
    </div>
  );
}
```

## Providers

### OpenAI

```typescript
import { openai } from 'verbi/providers';

export default defineConfig({
  provider: openai({
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4o-mini', // or 'gpt-4o'
    temperature: 0.3,
  }),
});
```

### Anthropic

```typescript
import { anthropic } from 'verbi/providers';

export default defineConfig({
  provider: anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: 'claude-3-haiku-20240307',
  }),
});
```

### DeepL

```typescript
import { deepl } from 'verbi/providers';

export default defineConfig({
  provider: deepl({
    apiKey: process.env.DEEPL_API_KEY!,
  }),
});
```

### Provider Router (Advanced)

Use different providers for different language pairs:

```typescript
import { router, openai, anthropic } from 'verbi/providers';

export default defineConfig({
  provider: router({
    rules: [
      {
        match: ['en>ja', 'en>zh'],
        use: anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }),
      },
      {
        match: ['en>*'],
        use: openai({ apiKey: process.env.OPENAI_API_KEY! }),
      },
    ],
  }),
});
```

## ICU MessageFormat

Verbi supports ICU MessageFormat for complex translations with dedicated hooks for a better DX.

### Variables

```tsx
// Server components
const t = await getT(locale);
<p>{t('Hello, {name}!', { name: 'Jordan' })}</p>

// Client components
const t = useT();
<p>{t('Hello, {name}!', { name: 'Jordan' })}</p>
```

### Pluralization

**Using the `usePlural()` hook (recommended):**

```tsx
'use client';

import { usePlural } from 'verbi/runtime';

export function CartSummary({ count }: { count: number }) {
  const plural = usePlural();

  return (
    <p>
      {plural(count, {
        zero: 'Your cart is empty',
        one: 'You have # item in your cart',
        other: 'You have # items in your cart'
      })}
    </p>
  );
}
```

**Using ICU MessageFormat syntax:**

```tsx
// Client components
const t = useT();
<p>{t('{count, plural, =0 {No items} one {# item} other {# items}}', { count })}</p>

// Server components
const t = await getT(locale);
<p>{t('{count, plural, =0 {No items} one {# item} other {# items}}', { count })}</p>
```

### Select (Gender/Case)

**Using the `useGender()` hook:**

```tsx
'use client';

import { useGender } from 'verbi/runtime';

export function Profile({ gender }: { gender: 'male' | 'female' | 'neutral' }) {
  const genderFn = useGender();

  return (
    <p>
      {genderFn(gender, {
        male: 'He is a software engineer',
        female: 'She is a software engineer',
        neutral: 'They are a software engineer',
        other: 'They are a software engineer'
      })}
    </p>
  );
}
```

**Using the `useSelect()` hook for custom cases:**

```tsx
'use client';

import { useSelect } from 'verbi/runtime';

export function UserAccess({ role }: { role: string }) {
  const select = useSelect();

  return (
    <p>
      {select(role, {
        admin: 'You have full access to all features',
        user: 'You have access to standard features',
        guest: 'You have limited access',
        other: 'Unknown access level'
      })}
    </p>
  );
}
```

## Glossary

Preserve brand names and technical terms:

```typescript
export default defineConfig({
  glossary: [
    { term: 'Verbi', keep: true },
    { term: 'Next.js', keep: true },
    { term: 'API', keep: true },
  ],
});
```

## Caching

Verbi caches translations to avoid redundant API calls:

- **Cache Key**: Based on source text + locale + glossary
- **Storage**: `.verbi-cache/translations.json`
- **Behavior**: Automatic cache hit/miss detection
- **Invalidation**: Automatic on source text change

## CLI Commands

```bash
# Initialize project (interactive)
verbi init

# Extract messages from codebase
verbi scan [--config <path>]

# Translate specific locales
verbi translate --locales es,fr,de [--config <path>]

# Translate all configured locales
verbi translate --all [--config <path>]
```

The `init` command is fully interactive and will:
- Prompt for source and target locales
- Let you choose your AI provider
- Set up your messages directory
- Optionally add scripts to package.json
- Create a `.env.local` file with your API key template

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Update Translations

on:
  push:
    branches: [main]

jobs:
  translate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Scan for new content
        run: npx verbi scan

      - name: Translate
        run: npx verbi translate --all
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

      - name: Commit translations
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: update translations"
          file_pattern: "messages/**/*.json"
```

## API Reference

### Configuration

```typescript
interface VerbiConfig {
  sourceLocale: string;
  locales: string[];
  messagesDir?: string; // default: './messages'
  include?: string[]; // default: ['src/**/*.{ts,tsx,js,jsx}']
  exclude?: string[]; // default: ['**/*.test.*', '**/*.spec.*']
  provider: Provider;
  glossary?: GlossaryTerm[];
  cache?: CacheConfig;
  validate?: ValidationConfig;
  namespaceStrategy?: 'file' | 'directory' | 'flat';
}
```

### Runtime API

**Server Components:**

```typescript
import { getMessages, getT } from 'verbi/next/server';

// Get all messages for a locale
const messages = await getMessages(locale);

// Get translation function
const t = await getT(locale);
const text = t('Your source text here', { variable: 'value' });
```

**Client Components:**

```typescript
import { useT, Trans, usePlural, useGender, useSelect } from 'verbi/runtime';

// Translation function
const t = useT();
t('Your source text')          // Simple text
t`Your source text`            // Template literal
t('Hello {name}', { name })    // With variables

// Pluralization
const plural = usePlural();
plural(count, { zero: '...', one: '...', other: '...' })

// Gender-aware translations
const gender = useGender();
gender(value, { male: '...', female: '...', neutral: '...', other: '...' })

// Select (custom cases)
const select = useSelect();
select(value, { case1: '...', case2: '...', other: '...' })

// JSX component for static text
<Trans>Your source text</Trans>
```

## Troubleshooting

### "Missing translation" warnings

1. Run `verbi scan` to extract new content
2. Run `verbi translate --all` to generate translations
3. Rebuild your Next.js app

### Provider API errors

1. Check your API key is set correctly
2. Verify the API key has sufficient credits
3. Check network connectivity

### Cache not working

1. Delete `.verbi-cache/` and re-translate
2. Check file permissions
3. Verify cache path in config

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
git clone https://github.com/yourusername/verbi.git
cd verbi
pnpm install
pnpm build
pnpm test
```

## License

MIT © [Your Name]

## Links

- [Documentation](https://verbi.dev)
- [GitHub](https://github.com/yourusername/verbi)
- [npm](https://www.npmjs.com/package/verbi)