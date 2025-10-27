# Verbi - Complete Implementation Guide for Claude Code

## Project Context

**Project Name:** Verbi  
**Purpose:** AI-powered internationalization (i18n) library for Next.js  
**Type:** Open-source npm library (MIT License)  
**Target Framework:** Next.js 14+ (App Router + React Server Components)  
**Programming Language:** TypeScript (strict mode)  
**Package Manager:** pnpm (monorepo with workspaces)

## High-Level Architecture

Verbi is a CLI-first i18n library that uses AI to translate content at build time. It consists of:

1. **Code Extractor**: Parses TypeScript/JSX to find marked translatable content
2. **AI Translation Engine**: Batches content to AI providers (OpenAI, Anthropic, DeepL)
3. **Validation System**: Ensures ICU MessageFormat integrity and glossary compliance
4. **Runtime Library**: Minimal React hooks/components for Next.js
5. **CLI Tools**: Commands for scanning, translating, validating, and diffing

**Core Principle**: Translations happen at build/dev time → stored in JSON → runtime only reads files (zero AI calls in production).

## Repository Structure

```
verbi/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Run tests, lint, build
│       └── publish.yml               # Publish to npm on tag
├── packages/
│   ├── verbi/                        # Main library package
│   │   ├── src/
│   │   │   ├── config/              # Configuration system
│   │   │   │   ├── index.ts         # Export defineConfig
│   │   │   │   ├── schema.ts        # Zod schemas for config
│   │   │   │   ├── loader.ts        # Load verbi.config.ts
│   │   │   │   └── types.ts         # TypeScript types
│   │   │   ├── extractor/           # Code parsing & extraction
│   │   │   │   ├── index.ts         # Main extractor entry
│   │   │   │   ├── parser.ts        # Babel/TS AST walker
│   │   │   │   ├── jsx-visitor.ts   # Find `verbi` props
│   │   │   │   ├── template-visitor.ts # Find v`` tags
│   │   │   │   ├── catalog.ts       # Build message catalogs
│   │   │   │   └── key-generator.ts # Auto-generate stable keys
│   │   │   ├── providers/           # AI provider adapters
│   │   │   │   ├── index.ts         # Export all providers
│   │   │   │   ├── base.ts          # Provider interface
│   │   │   │   ├── openai.ts        # OpenAI implementation
│   │   │   │   ├── anthropic.ts     # Anthropic implementation
│   │   │   │   ├── deepl.ts         # DeepL implementation
│   │   │   │   ├── router.ts        # Provider routing/fallback
│   │   │   │   └── prompt.ts        # Prompt templates
│   │   │   ├── translator/          # Translation orchestration
│   │   │   │   ├── index.ts         # Main translation entry
│   │   │   │   ├── batcher.ts       # Batch requests efficiently
│   │   │   │   ├── differ.ts        # Detect changed messages
│   │   │   │   └── retry.ts         # Retry logic with backoff
│   │   │   ├── validator/           # Validation system
│   │   │   │   ├── index.ts         # Main validator
│   │   │   │   ├── icu.ts           # ICU MessageFormat checks
│   │   │   │   ├── placeholders.ts  # Placeholder validation
│   │   │   │   ├── glossary.ts      # Glossary enforcement
│   │   │   │   └── quality.ts       # Quality metrics
│   │   │   ├── cache/               # Translation caching
│   │   │   │   ├── index.ts         # Cache interface
│   │   │   │   ├── file-store.ts    # File-based cache
│   │   │   │   └── hash.ts          # Content hashing
│   │   │   ├── runtime/             # React runtime
│   │   │   │   ├── index.ts         # Export hooks/components
│   │   │   │   ├── use-t.ts         # useT() hook
│   │   │   │   ├── Trans.tsx        # <Trans> component
│   │   │   │   ├── context.tsx      # React context
│   │   │   │   ├── icu-runtime.ts   # ICU message formatting
│   │   │   │   └── types.ts         # Runtime types
│   │   │   ├── next/                # Next.js integration
│   │   │   │   ├── index.ts         # Export Next.js APIs
│   │   │   │   ├── server.ts        # getMessages(), getT()
│   │   │   │   ├── provider.tsx     # VerbiProvider component
│   │   │   │   ├── middleware.ts    # Locale detection
│   │   │   │   └── routing.ts       # Locale routing helpers
│   │   │   ├── cli/                 # CLI commands
│   │   │   │   ├── index.ts         # CLI entry & command router
│   │   │   │   ├── scan.ts          # scan command
│   │   │   │   ├── translate.ts     # translate command
│   │   │   │   ├── validate.ts      # validate command
│   │   │   │   ├── diff.ts          # diff command
│   │   │   │   └── init.ts          # init command (setup)
│   │   │   ├── utils/               # Shared utilities
│   │   │   │   ├── logger.ts        # Colored console logging
│   │   │   │   ├── fs.ts            # File system helpers
│   │   │   │   ├── locale.ts        # Locale normalization
│   │   │   │   └── errors.ts        # Custom error classes
│   │   │   └── index.ts             # Main library exports
│   │   ├── bin/
│   │   │   └── verbi.js             # CLI executable
│   │   ├── tests/
│   │   │   ├── unit/                # Unit tests
│   │   │   ├── integration/         # Integration tests
│   │   │   └── fixtures/            # Test fixtures
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts           # Build config
│   ├── eslint-plugin-verbi/         # ESLint plugin (future)
│   │   └── package.json
│   └── examples/
│       └── with-next-app/           # Example Next.js app
│           ├── app/
│           ├── messages/
│           ├── verbi.config.ts
│           └── package.json
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── package.json                      # Root workspace config
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── turbo.json                        # Turborepo config (optional)
└── README.md
```

## Technology Stack

### Core Dependencies

```json
{
  "dependencies": {
    "@babel/parser": "^7.23.0",
    "@babel/traverse": "^7.23.0",
    "@babel/types": "^7.23.0",
    "@formatjs/icu-messageformat-parser": "^2.7.0",
    "commander": "^11.1.0",
    "zod": "^3.22.4",
    "picocolors": "^1.0.0",
    "fast-glob": "^3.3.2",
    "fast-diff": "^1.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/babel__traverse": "^7.20.4",
    "typescript": "^5.3.0",
    "tsup": "^8.0.0",
    "vitest": "^1.0.0",
    "prettier": "^3.1.0",
    "eslint": "^8.55.0"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "next": "^14.0.0"
  },
  "optionalDependencies": {
    "openai": "^4.20.0",
    "@anthropic-ai/sdk": "^0.9.0",
    "deepl-node": "^1.11.0"
  }
}
```

### Build Configuration

**File: `tsup.config.ts`**
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    runtime: 'src/runtime/index.ts',
    next: 'src/next/index.ts',
    config: 'src/config/index.ts',
    providers: 'src/providers/index.ts',
    cli: 'src/cli/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'next'],
});
```

## Implementation Details by Module

### 1. Configuration System

**File: `src/config/schema.ts`**

Define Zod schemas for type-safe configuration:

```typescript
import { z } from 'zod';

export const LocaleSchema = z.enum([
  'en', 'en-US', 'en-GB',
  'es', 'es-ES', 'es-CR', 'es-MX',
  'fr', 'fr-FR', 'fr-CA',
  'de', 'de-DE', 'de-AT',
  'it', 'it-IT',
  'pt', 'pt-BR', 'pt-PT',
  'nl', 'nl-NL', 'nl-BE',
  'ja', 'ja-JP',
  'ko', 'ko-KR',
  'zh', 'zh-CN', 'zh-TW',
  'ar', 'ar-SA',
  'ru', 'ru-RU',
  'pl', 'pl-PL',
  'tr', 'tr-TR',
  'sv', 'sv-SE',
  'da', 'da-DK',
  'fi', 'fi-FI',
  'no', 'no-NO',
  'cs', 'cs-CZ',
  'el', 'el-GR',
  'he', 'he-IL',
  'th', 'th-TH',
  'vi', 'vi-VN',
  'id', 'id-ID',
  'hi', 'hi-IN',
]).or(z.string()); // Allow custom locales

export const GlossaryTermSchema = z.object({
  term: z.string(),
  keep: z.boolean().default(true),
  translation: z.record(LocaleSchema, z.string()).optional(),
});

export const ProviderConfigSchema = z.object({
  name: z.string(),
  config: z.record(z.unknown()),
});

export const CacheConfigSchema = z.object({
  kind: z.enum(['file', 'memory']),
  path: z.string().optional(),
});

export const ValidationConfigSchema = z.object({
  icu: z.boolean().default(true),
  placeholders: z.boolean().default(true),
  maxParaphraseDelta: z.number().min(0).max(1).default(0.15),
  failOnMissing: z.boolean().default(false),
});

export const VerbiConfigSchema = z.object({
  sourceLocale: LocaleSchema.default('en-US'),
  locales: z.array(LocaleSchema),
  messagesDir: z.string().default('./messages'),
  include: z.array(z.string()).default(['src/**/*.{ts,tsx,js,jsx}']),
  exclude: z.array(z.string()).default(['**/*.test.*', '**/*.spec.*', '**/node_modules/**']),
  provider: ProviderConfigSchema,
  glossary: z.array(GlossaryTermSchema).default([]),
  cache: CacheConfigSchema.default({ kind: 'file', path: '.verbi-cache' }),
  validate: ValidationConfigSchema.default({}),
  namespaceStrategy: z.enum(['file', 'directory', 'flat']).default('directory'),
});

export type VerbiConfig = z.infer<typeof VerbiConfigSchema>;
export type Locale = z.infer<typeof LocaleSchema>;
export type GlossaryTerm = z.infer<typeof GlossaryTermSchema>;
```

**File: `src/config/loader.ts`**

Load and validate configuration file:

```typescript
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
```

### 2. Code Extractor

**File: `src/extractor/parser.ts`**

Parse files and extract translatable content:

```typescript
import { parse } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { readFile } from 'fs/promises';
import { relative } from 'path';

export interface ExtractedMessage {
  key: string;
  text: string;
  location: {
    file: string;
    line: number;
    column: number;
  };
  context?: string;
  explicitKey?: boolean;
}

export async function parseFile(
  filePath: string,
  projectRoot: string
): Promise<ExtractedMessage[]> {
  const content = await readFile(filePath, 'utf-8');
  const relativePath = relative(projectRoot, filePath);
  
  const ast = parse(content, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  const messages: ExtractedMessage[] = [];

  traverse(ast, {
    // Find JSX elements with `verbi` prop
    JSXElement(path: NodePath<t.JSXElement>) {
      const openingElement = path.node.openingElement;
      const verbiAttr = openingElement.attributes.find(
        attr =>
          t.isJSXAttribute(attr) &&
          t.isJSXIdentifier(attr.name) &&
          attr.name.name === 'verbi'
      );

      if (!verbiAttr) return;

      // Extract text content
      const textContent = extractJSXText(path.node);
      if (!textContent) return;

      // Check for explicit key
      const keyAttr = openingElement.attributes.find(
        attr =>
          t.isJSXAttribute(attr) &&
          t.isJSXIdentifier(attr.name) &&
          attr.name.name === 'verbiKey'
      );

      const explicitKey = keyAttr && t.isJSXAttribute(keyAttr) && t.isStringLiteral(keyAttr.value)
        ? keyAttr.value.value
        : null;

      messages.push({
        key: explicitKey || generateKey(relativePath, textContent),
        text: textContent,
        location: {
          file: relativePath,
          line: path.node.loc?.start.line || 0,
          column: path.node.loc?.start.column || 0,
        },
        explicitKey: !!explicitKey,
      });
    },

    // Find template tags `v``
    TaggedTemplateExpression(path: NodePath<t.TaggedTemplateExpression>) {
      if (
        !t.isIdentifier(path.node.tag) ||
        path.node.tag.name !== 'v'
      ) {
        return;
      }

      const quasi = path.node.quasi;
      if (quasi.quasis.length !== 1) {
        // Has expressions - extract with placeholders
        const text = extractTemplateWithPlaceholders(quasi);
        messages.push({
          key: generateKey(relativePath, text),
          text,
          location: {
            file: relativePath,
            line: path.node.loc?.start.line || 0,
            column: path.node.loc?.start.column || 0,
          },
        });
      } else {
        // Simple string
        const text = quasi.quasis[0].value.cooked || quasi.quasis[0].value.raw;
        messages.push({
          key: generateKey(relativePath, text),
          text,
          location: {
            file: relativePath,
            line: path.node.loc?.start.line || 0,
            column: path.node.loc?.start.column || 0,
          },
        });
      }
    },
  });

  return messages;
}

function extractJSXText(node: t.JSXElement): string | null {
  const textParts: string[] = [];

  for (const child of node.children) {
    if (t.isJSXText(child)) {
      const text = child.value.trim();
      if (text) textParts.push(text);
    } else if (t.isJSXExpressionContainer(child)) {
      const expr = child.expression;
      if (t.isIdentifier(expr)) {
        // ICU placeholder
        textParts.push(`{${expr.name}}`);
      } else if (t.isJSXEmptyExpression(expr)) {
        // Skip empty expressions
        continue;
      } else {
        // Complex expression - not supported in MVP
        return null;
      }
    } else {
      // Nested JSX element - not supported in MVP
      return null;
    }
  }

  return textParts.length > 0 ? textParts.join(' ') : null;
}

function extractTemplateWithPlaceholders(quasi: t.TemplateLiteral): string {
  const parts: string[] = [];
  
  for (let i = 0; i < quasi.quasis.length; i++) {
    parts.push(quasi.quasis[i].value.cooked || quasi.quasis[i].value.raw);
    
    if (i < quasi.expressions.length) {
      const expr = quasi.expressions[i];
      if (t.isIdentifier(expr)) {
        parts.push(`{${expr.name}}`);
      } else {
        parts.push(`{${i}}`); // Fallback placeholder
      }
    }
  }
  
  return parts.join('');
}

function generateKey(filePath: string, text: string): string {
  // Generate namespace from file path
  const namespace = filePath
    .replace(/\.(tsx?|jsx?)$/, '')
    .replace(/\//g, '.')
    .replace(/^src\./, '');

  // Generate short hash from text
  const hash = simpleHash(text).toString(36).substring(0, 6);

  return `${namespace}.${hash}`;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
```

**File: `src/extractor/catalog.ts`**

Build message catalogs from extracted messages:

```typescript
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import type { ExtractedMessage } from './parser.js';
import type { VerbiConfig } from '../config/schema.js';

export interface MessageCatalog {
  [key: string]: {
    message: string;
    location: {
      file: string;
      line: number;
      column: number;
    };
  };
}

export async function buildCatalogs(
  messages: ExtractedMessage[],
  config: VerbiConfig
): Promise<void> {
  // Group messages by namespace
  const namespaces = groupByNamespace(messages, config.namespaceStrategy);

  // Write source locale catalogs
  const sourceDir = join(config.messagesDir, config.sourceLocale);
  await mkdir(sourceDir, { recursive: true });

  for (const [namespace, msgs] of Object.entries(namespaces)) {
    const catalog: MessageCatalog = {};
    
    for (const msg of msgs) {
      catalog[msg.key] = {
        message: msg.text,
        location: msg.location,
      };
    }

    const filePath = join(sourceDir, `${namespace}.json`);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(catalog, null, 2) + '\n');
  }

  // Write key map for reference
  const keyMapPath = join(config.messagesDir, '.verbi', 'keys.map.json');
  await mkdir(dirname(keyMapPath), { recursive: true });
  await writeFile(
    keyMapPath,
    JSON.stringify(
      messages.map(m => ({
        key: m.key,
        text: m.text,
        location: m.location,
        explicitKey: m.explicitKey,
      })),
      null,
      2
    ) + '\n'
  );
}

function groupByNamespace(
  messages: ExtractedMessage[],
  strategy: 'file' | 'directory' | 'flat'
): Record<string, ExtractedMessage[]> {
  const groups: Record<string, ExtractedMessage[]> = {};

  for (const msg of messages) {
    let namespace: string;

    switch (strategy) {
      case 'file':
        // One file per source file
        namespace = msg.location.file.replace(/\.(tsx?|jsx?)$/, '').replace(/\//g, '.');
        break;
      case 'directory':
        // One file per directory
        namespace = dirname(msg.location.file).replace(/\//g, '.') || 'root';
        break;
      case 'flat':
        // All in one file
        namespace = 'messages';
        break;
    }

    if (!groups[namespace]) {
      groups[namespace] = [];
    }
    groups[namespace].push(msg);
  }

  return groups;
}
```

### 3. AI Provider System

**File: `src/providers/base.ts`**

Define provider interface:

```typescript
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
```

**File: `src/providers/openai.ts`**

OpenAI provider implementation:

```typescript
import type { Provider, TranslationRequest, TranslationResponse } from './base.js';
import { buildSystemPrompt, buildUserPrompt } from './prompt.js';

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxRetries?: number;
}

export function openai(config: OpenAIConfig): Provider {
  let openaiModule: typeof import('openai') | null = null;

  async function getOpenAI() {
    if (!openaiModule) {
      openaiModule = await import('openai');
    }
    return new openaiModule.default({
      apiKey: config.apiKey,
      maxRetries: config.maxRetries || 3,
    });
  }

  return {
    name: 'openai',

    async translate(requests: TranslationRequest[]): Promise<TranslationResponse[]> {
      const client = await getOpenAI();
      const model = config.model || 'gpt-4o-mini';

      // Use first request as reference (batch should have same locale pair)
      const { sourceLocale, targetLocale, glossary } = requests[0];

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

      const parsed = JSON.parse(content);
      return parsed.translations as TranslationResponse[];
    },

    async validateConfig(): Promise<boolean> {
      try {
        const client = await getOpenAI();
        await client.models.list();
        return true;
      } catch {
        return false;
      }
    },
  };
}
```

**File: `src/providers/anthropic.ts`**

Anthropic provider implementation:

```typescript
import type { Provider, TranslationRequest, TranslationResponse } from './base.js';
import { buildSystemPrompt, buildUserPrompt } from './prompt.js';

export interface AnthropicConfig {
  apiKey: string;
  model?: string;
  maxRetries?: number;
}

export function anthropic(config: AnthropicConfig): Provider {
  let anthropicModule: typeof import('@anthropic-ai/sdk') | null = null;

  async function getAnthropic() {
    if (!anthropicModule) {
      anthropicModule = await import('@anthropic-ai/sdk');
    }
    return new anthropicModule.default({
      apiKey: config.apiKey,
      maxRetries: config.maxRetries || 3,
    });
  }

  return {
    name: 'anthropic',

    async translate(requests: TranslationRequest[]): Promise<TranslationResponse[]> {
      const client = await getAnthropic();
      const model = config.model || 'claude-sonnet-4-5-20250929';

      const { sourceLocale, targetLocale, glossary } = requests[0];

      const response = await client.messages.create({
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

      const parsed = JSON.parse(content.text);
      return parsed.translations as TranslationResponse[];
    },

    async validateConfig(): Promise<boolean> {
      try {
        const client = await getAnthropic();
        await client.messages.create({
          model: config.model || 'claude-sonnet-4-5-20250929',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }],
        });
        return true;
      } catch {
        return false;
      }
    },
  };
}
```

**File: `src/providers/prompt.ts`**

Prompt templates for AI providers:

```typescript
import type { TranslationRequest } from './base.js';

export function buildSystemPrompt(
  sourceLocale: string,
  targetLocale: string,
  glossary?: Array<{ term: string; keep: boolean }>
): string {
  const glossaryText = glossary && glossary.length > 0
    ? `\n\nGlossary terms (preserve exactly):\n${glossary.map(g => `- ${g.term}`).join('\n')}`
    : '';

  return `You are a professional translator specializing in software localization.

Your task: Translate texts from ${sourceLocale} to ${targetLocale}.

CRITICAL RULES:
1. Preserve ALL ICU MessageFormat syntax exactly: {variable}, {count, plural, one {#} other {#}}, {gender, select, male {...} female {...}}
2. Keep placeholders identical - do not translate variable names
3. Maintain the same tone, formality, and style as the source
4. Preserve whitespace and line breaks
5. Return ONLY valid JSON in this exact format:
{
  "translations": [
    {"key": "original.key", "text": "translated text"},
    ...
  ]
}${glossaryText}

Do NOT include any explanations, markdown, or additional text outside the JSON structure.`;
}

export function buildUserPrompt(requests: TranslationRequest[]): string {
  const items = requests.map(req => ({
    key: req.key,
    text: req.sourceText,
    context: req.context,
  }));

  return JSON.stringify(items, null, 2);
}
```

**File: `src/providers/router.ts`**

Provider router with fallback:

```typescript
import type { Provider, TranslationRequest, TranslationResponse } from './base.js';

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
      // Group requests by locale pair
      const groups = new Map<Provider, TranslationRequest[]>();

      for (const req of requests) {
        const provider = findProvider(req.sourceLocale, req.targetLocale, config);
        const existing = groups.get(provider) || [];
        existing.push(req);
        groups.set(provider, existing);
      }

      // Translate each group
      const results = await Promise.all(
        Array.from(groups.entries()).map(([provider, reqs]) =>
          provider.translate(reqs)
        )
      );

      return results.flat();
    },

    async validateConfig(): Promise<boolean> {
      // Validate all providers
      const providers = [...new Set(config.rules.map(r => r.use))];
      if (config.fallback) providers.push(config.fallback);

      const results = await Promise.all(
        providers.map(p => p.validateConfig())
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
        return rule.use;
      }
    }
  }

  if (config.fallback) {
    return config.fallback;
  }

  throw new Error(`No provider found for ${pair}`);
}

function matchPattern(pair: string, pattern: string): boolean {
  const regex = new RegExp(
    '^' + pattern.replace(/\*/g, '.*').replace(/>/g, '>') + '$'
  );
  return regex.test(pair);
}
```

### 4. Translation System

**File: `src/translator/index.ts`**

Main translation orchestration:

```typescript
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import type { VerbiConfig } from '../config/schema.js';
import type { Provider } from '../providers/base.js';
import { diffCatalogs } from './differ.js';
import { batchRequests } from './batcher.js';
import { getCache } from '../cache/index.js';
import { logger } from '../utils/logger.js';

export async function translateLocale(
  locale: string,
  config: VerbiConfig,
  provider: Provider
): Promise<void> {
  logger.info(`Translating to ${locale}...`);

  // Load source catalog
  const sourceCatalog = await loadCatalog(config.sourceLocale, config);
  
  // Load target catalog (may not exist)
  let targetCatalog;
  try {
    targetCatalog = await loadCatalog(locale, config);
  } catch {
    targetCatalog = {};
  }

  // Find missing/changed translations
  const toTranslate = diffCatalogs(sourceCatalog, targetCatalog);

  if (toTranslate.length === 0) {
    logger.success(`${locale}: Already up to date`);
    return;
  }

  logger.info(`${locale}: Found ${toTranslate.length} texts to translate`);

  // Check cache
  const cache = await getCache(config.cache);
  const uncached: typeof toTranslate = [];

  for (const item of toTranslate) {
    const cached = await cache.get(
      item.key,
      config.sourceLocale,
      locale,
      item.text,
      config.glossary
    );

    if (cached) {
      targetCatalog[item.key] = cached;
    } else {
      uncached.push(item);
    }
  }

  if (uncached.length > 0) {
    logger.info(`${locale}: Translating ${uncached.length} new texts via ${provider.name}`);

    // Batch and translate
    const batches = batchRequests(uncached, 50); // 50 items per batch

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      logger.info(`${locale}: Batch ${i + 1}/${batches.length}`);

      const requests = batch.map(item => ({
        key: item.key,
        sourceText: item.text,
        sourceLocale: config.sourceLocale,
        targetLocale: locale,
        glossary: config.glossary,
      }));

      const responses = await provider.translate(requests);

      // Update catalog and cache
      for (const response of responses) {
        targetCatalog[response.key] = response.text;
        await cache.set(
          response.key,
          config.sourceLocale,
          locale,
          requests.find(r => r.key === response.key)!.sourceText,
          config.glossary,
          response.text
        );
      }
    }
  }

  // Write updated catalog
  await saveCatalog(locale, targetCatalog, config);
  logger.success(`${locale}: Translation complete`);
}

async function loadCatalog(
  locale: string,
  config: VerbiConfig
): Promise<Record<string, string>> {
  const catalogPath = join(config.messagesDir, locale, 'messages.json');
  const content = await readFile(catalogPath, 'utf-8');
  const parsed = JSON.parse(content);
  
  const catalog: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === 'object' && value !== null && 'message' in value) {
      catalog[key] = (value as any).message;
    } else {
      catalog[key] = String(value);
    }
  }
  
  return catalog;
}

async function saveCatalog(
  locale: string,
  catalog: Record<string, string>,
  config: VerbiConfig
): Promise<void> {
  const catalogPath = join(config.messagesDir, locale, 'messages.json');
  await mkdir(dirname(catalogPath), { recursive: true });
  await writeFile(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
}
```

**File: `src/translator/batcher.ts`**

Batch translation requests efficiently:

```typescript
export function batchRequests<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  return batches;
}
```

**File: `src/translator/differ.ts`**

Detect changed messages:

```typescript
export interface DiffItem {
  key: string;
  text: string;
  status: 'new' | 'changed';
}

export function diffCatalogs(
  source: Record<string, string>,
  target: Record<string, string>
): DiffItem[] {
  const items: DiffItem[] = [];

  for (const [key, sourceText] of Object.entries(source)) {
    const targetText = target[key];

    if (!targetText) {
      items.push({ key, text: sourceText, status: 'new' });
    } else if (sourceText !== targetText) {
      // Text changed in source
      items.push({ key, text: sourceText, status: 'changed' });
    }
  }

  return items;
}
```

### 5. Validation System

**File: `src/validator/icu.ts`**

Validate ICU MessageFormat:

```typescript
import { parse, type MessageFormatElement } from '@formatjs/icu-messageformat-parser';

export interface ICUValidationResult {
  valid: boolean;
  errors: string[];
  placeholders: string[];
}

export function validateICU(text: string): ICUValidationResult {
  const errors: string[] = [];
  let placeholders: string[] = [];

  try {
    const ast = parse(text);
    placeholders = extractPlaceholders(ast);
  } catch (error) {
    errors.push(`Invalid ICU syntax: ${error instanceof Error ? error.message : String(error)}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    placeholders,
  };
}

export function validateICUParity(source: string, translation: string): ICUValidationResult {
  const sourceResult = validateICU(source);
  const translationResult = validateICU(translation);

  const errors: string[] = [];

  if (!sourceResult.valid) {
    errors.push('Source has invalid ICU syntax');
  }

  if (!translationResult.valid) {
    errors.push('Translation has invalid ICU syntax');
  }

  // Check placeholder parity
  const missingPlaceholders = sourceResult.placeholders.filter(
    p => !translationResult.placeholders.includes(p)
  );

  const extraPlaceholders = translationResult.placeholders.filter(
    p => !sourceResult.placeholders.includes(p)
  );

  if (missingPlaceholders.length > 0) {
    errors.push(`Missing placeholders: ${missingPlaceholders.join(', ')}`);
  }

  if (extraPlaceholders.length > 0) {
    errors.push(`Extra placeholders: ${extraPlaceholders.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    placeholders: translationResult.placeholders,
  };
}

function extractPlaceholders(ast: MessageFormatElement[]): string[] {
  const placeholders: string[] = [];

  function visit(elements: MessageFormatElement[]) {
    for (const element of elements) {
      if (element.type === 0) {
        // Literal, skip
        continue;
      } else if (element.type === 1) {
        // Argument
        placeholders.push(element.value);
      } else if (element.type === 5) {
        // Select
        placeholders.push(element.value);
        for (const option of Object.values(element.options)) {
          visit(option.value);
        }
      } else if (element.type === 6) {
        // Plural
        placeholders.push(element.value);
        for (const option of Object.values(element.options)) {
          visit(option.value);
        }
      }
    }
  }

  visit(ast);
  return [...new Set(placeholders)];
}
```

### 6. Cache System

**File: `src/cache/index.ts`**

Cache interface and factory:

```typescript
import type { GlossaryTerm } from '../config/schema.js';

export interface Cache {
  get(
    key: string,
    sourceLocale: string,
    targetLocale: string,
    sourceText: string,
    glossary: GlossaryTerm[]
  ): Promise<string | null>;

  set(
    key: string,
    sourceLocale: string,
    targetLocale: string,
    sourceText: string,
    glossary: GlossaryTerm[],
    translation: string
  ): Promise<void>;

  clear(): Promise<void>;
}

export async function getCache(config: { kind: string; path?: string }): Promise<Cache> {
  if (config.kind === 'file') {
    const { FileCache } = await import('./file-store.js');
    return new FileCache(config.path || '.verbi-cache');
  }

  throw new Error(`Unknown cache kind: ${config.kind}`);
}
```

**File: `src/cache/file-store.ts`**

File-based cache implementation:

```typescript
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { createHash } from 'crypto';
import type { Cache } from './index.js';
import type { GlossaryTerm } from '../config/schema.js';

interface CacheEntry {
  translation: string;
  timestamp: number;
}

export class FileCache implements Cache {
  private cache: Map<string, CacheEntry> = new Map();
  private loaded = false;

  constructor(private cachePath: string) {}

  private async load(): Promise<void> {
    if (this.loaded) return;

    const filePath = join(this.cachePath, 'translations.json');
    
    if (existsSync(filePath)) {
      try {
        const content = await readFile(filePath, 'utf-8');
        const data = JSON.parse(content);
        this.cache = new Map(Object.entries(data));
      } catch {
        // Ignore invalid cache
      }
    }

    this.loaded = true;
  }

  private async save(): Promise<void> {
    await mkdir(this.cachePath, { recursive: true });
    const filePath = join(this.cachePath, 'translations.json');
    const data = Object.fromEntries(this.cache.entries());
    await writeFile(filePath, JSON.stringify(data, null, 2));
  }

  private getCacheKey(
    key: string,
    sourceLocale: string,
    targetLocale: string,
    sourceText: string,
    glossary: GlossaryTerm[]
  ): string {
    const hash = createHash('sha256');
    hash.update(sourceText);
    hash.update(sourceLocale);
    hash.update(targetLocale);
    hash.update(JSON.stringify(glossary));
    return `${key}:${hash.digest('hex').slice(0, 16)}`;
  }

  async get(
    key: string,
    sourceLocale: string,
    targetLocale: string,
    sourceText: string,
    glossary: GlossaryTerm[]
  ): Promise<string | null> {
    await this.load();
    const cacheKey = this.getCacheKey(key, sourceLocale, targetLocale, sourceText, glossary);
    const entry = this.cache.get(cacheKey);
    return entry?.translation || null;
  }

  async set(
    key: string,
    sourceLocale: string,
    targetLocale: string,
    sourceText: string,
    glossary: GlossaryTerm[],
    translation: string
  ): Promise<void> {
    await this.load();
    const cacheKey = this.getCacheKey(key, sourceLocale, targetLocale, sourceText, glossary);
    this.cache.set(cacheKey, {
      translation,
      timestamp: Date.now(),
    });
    await this.save();
  }

  async clear(): Promise<void> {
    this.cache.clear();
    await this.save();
  }
}
```

### 7. Runtime System

**File: `src/runtime/use-t.ts`**

React hook for translations:

```typescript
'use client';

import { useContext } from 'react';
import { VerbiContext } from './context.js';
import { formatMessage } from './icu-runtime.js';

export function useT() {
  const context = useContext(VerbiContext);

  if (!context) {
    throw new Error('useT must be used within VerbiProvider');
  }

  return function t(key: string, values?: Record<string, unknown>): string {
    const message = context.messages[key];

    if (!message) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation: ${key}`);
      }
      return key;
    }

    if (!values) {
      return message;
    }

    return formatMessage(message, values, context.locale);
  };
}
```

**File: `src/runtime/context.tsx`**

React context for Verbi:

```typescript
'use client';

import { createContext, type ReactNode } from 'react';

export interface VerbiContextValue {
  locale: string;
  messages: Record<string, string>;
}

export const VerbiContext = createContext<VerbiContextValue | null>(null);

export interface VerbiProviderProps {
  locale: string;
  messages: Record<string, string>;
  children: ReactNode;
}

export function VerbiProvider({ locale, messages, children }: VerbiProviderProps) {
  return (
    <VerbiContext.Provider value={{ locale, messages }}>
      {children}
    </VerbiContext.Provider>
  );
}
```

**File: `src/runtime/icu-runtime.ts`**

Runtime ICU formatting (using Intl APIs):

```typescript
export function formatMessage(
  message: string,
  values: Record<string, unknown>,
  locale: string
): string {
  // Simple variable replacement
  let result = message;

  for (const [key, value] of Object.entries(values)) {
    // Handle simple placeholders {variable}
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));

    // Handle plural {count, plural, one {...} other {...}}
    const pluralRegex = new RegExp(
      `\\{${key},\\s*plural,\\s*one\\s*\\{([^}]+)\\}\\s*other\\s*\\{([^}]+)\\}\\}`,
      'g'
    );
    result = result.replace(pluralRegex, (_, one, other) => {
      const count = Number(value);
      const form = new Intl.PluralRules(locale).select(count);
      const template = form === 'one' ? one : other;
      return template.replace(/#/g, String(count));
    });
  }

  return result;
}
```

### 8. Next.js Integration

**File: `src/next/server.ts`**

Server-side helpers:

```typescript
import { readFile } from 'fs/promises';
import { join } from 'path';
import { cache } from 'react';

export const getMessages = cache(async (locale: string): Promise<Record<string, string>> => {
  const messagesPath = join(process.cwd(), 'messages', locale, 'messages.json');
  
  try {
    const content = await readFile(messagesPath, 'utf-8');
    const parsed = JSON.parse(content);
    
    const messages: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'object' && value !== null && 'message' in value) {
        messages[key] = (value as any).message;
      } else {
        messages[key] = String(value);
      }
    }
    
    return messages;
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    return {};
  }
});

export async function getT(locale: string) {
  const messages = await getMessages(locale);

  return function t(key: string, values?: Record<string, unknown>): string {
    const message = messages[key];

    if (!message) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation: ${key}`);
      }
      return key;
    }

    if (!values) {
      return message;
    }

    // Simple variable replacement for server
    let result = message;
    for (const [k, v] of Object.entries(values)) {
      result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }

    return result;
  };
}
```

**File: `src/next/provider.tsx`**

Client Provider component:

```typescript
'use client';

import { VerbiProvider as BaseProvider } from '../runtime/context.js';
import type { ReactNode } from 'react';

export interface VerbiProviderProps {
  locale: string;
  messages: Record<string, string>;
  children: ReactNode;
}

export function VerbiProvider({ locale, messages, children }: VerbiProviderProps) {
  return (
    <BaseProvider locale={locale} messages={messages}>
      {children}
    </BaseProvider>
  );
}
```

### 9. CLI Commands

**File: `src/cli/index.ts`**

CLI entry point:

```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { scanCommand } from './scan.js';
import { translateCommand } from './translate.js';
import { validateCommand } from './validate.js';
import { diffCommand } from './diff.js';
import { initCommand } from './init.js';

const program = new Command();

program
  .name('verbi')
  .description('AI-powered i18n for Next.js')
  .version('0.1.0');

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

program
  .command('validate')
  .description('Validate translations')
  .option('-c, --config <path>', 'Config file path')
  .action(validateCommand);

program
  .command('diff')
  .description('Show translation differences')
  .option('-l, --locale <locale>', 'Target locale')
  .option('-c, --config <path>', 'Config file path')
  .action(diffCommand);

program.parse();
```

**File: `src/cli/scan.ts`**

Scan command implementation:

```typescript
import fg from 'fast-glob';
import { loadConfig } from '../config/loader.js';
import { parseFile } from '../extractor/parser.js';
import { buildCatalogs } from '../extractor/catalog.js';
import { logger } from '../utils/logger.js';

export async function scanCommand(options: { config?: string }) {
  try {
    logger.info('Loading configuration...');
    const config = await loadConfig(options.config || process.cwd());

    logger.info('Scanning files for translatable content...');
    const files = await fg(config.include, {
      cwd: process.cwd(),
      ignore: config.exclude,
      absolute: true,
    });

    logger.info(`Found ${files.length} files to scan`);

    const allMessages = [];
    for (const file of files) {
      const messages = await parseFile(file, process.cwd());
      allMessages.push(...messages);
    }

    logger.info(`Extracted ${allMessages.length} messages`);

    await buildCatalogs(allMessages, config);

    logger.success('Scan complete!');
    logger.info(`Messages written to: ${config.messagesDir}/${config.sourceLocale}/`);
  } catch (error) {
    logger.error('Scan failed:', error);
    process.exit(1);
  }
}
```

**File: `src/cli/translate.ts`**

Translate command implementation:

```typescript
import { loadConfig } from '../config/loader.js';
import { translateLocale } from '../translator/index.js';
import { logger } from '../utils/logger.js';

export async function translateCommand(options: {
  locales?: string;
  all?: boolean;
  config?: string;
}) {
  try {
    logger.info('Loading configuration...');
    const config = await loadConfig(options.config || process.cwd());

    // Determine which locales to translate
    let locales: string[];
    if (options.all) {
      locales = config.locales;
    } else if (options.locales) {
      locales = options.locales.split(',').map(l => l.trim());
    } else {
      logger.error('Please specify --locales or --all');
      process.exit(1);
    }

    // Load provider (simplified - assumes router provider)
    const provider = await loadProvider(config.provider);

    // Validate provider
    logger.info('Validating provider configuration...');
    const valid = await provider.validateConfig();
    if (!valid) {
      logger.error('Provider configuration is invalid');
      process.exit(1);
    }

    // Translate each locale
    for (const locale of locales) {
      await translateLocale(locale, config, provider);
    }

    logger.success('Translation complete!');
  } catch (error) {
    logger.error('Translation failed:', error);
    process.exit(1);
  }
}

async function loadProvider(providerConfig: any) {
  // Import provider based on config
  const { router, openai, anthropic, deepl } = await import('../providers/index.js');
  
  // This is simplified - in reality, you'd parse providerConfig properly
  return router(providerConfig);
}
```

### 10. Utilities

**File: `src/utils/logger.ts`**

Colored console logging:

```typescript
import pc from 'picocolors';

export const logger = {
  info(message: string, ...args: unknown[]) {
    console.log(pc.blue('ℹ'), message, ...args);
  },

  success(message: string, ...args: unknown[]) {
    console.log(pc.green('✓'), message, ...args);
  },

  warn(message: string, ...args: unknown[]) {
    console.warn(pc.yellow('⚠'), message, ...args);
  },

  error(message: string, ...args: unknown[]) {
    console.error(pc.red('✗'), message, ...args);
  },
};
```

**File: `src/utils/errors.ts`**

Custom error classes:

```typescript
export class VerbiError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'VerbiError';
  }
}
```

## Testing Strategy

### Unit Tests Structure

```
tests/
├── unit/
│   ├── extractor/
│   │   ├── parser.test.ts
│   │   └── catalog.test.ts
│   ├── validator/
│   │   ├── icu.test.ts
│   │   └── placeholders.test.ts
│   ├── providers/
│   │   ├── openai.test.ts
│   │   └── router.test.ts
│   └── cache/
│       └── file-store.test.ts
├── integration/
│   ├── cli-workflow.test.ts
│   └── translation-e2e.test.ts
└── fixtures/
    ├── sample-files/
    └── mock-translations/
```

### Example Test

**File: `tests/unit/extractor/parser.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { parseFile } from '../../../src/extractor/parser.js';

describe('parseFile', () => {
  it('should extract JSX text with verbi prop', async () => {
    // Test implementation
  });

  it('should extract template tags', async () => {
    // Test implementation
  });

  it('should handle ICU placeholders', async () => {
    // Test implementation
  });
});
```

## Example App Structure

**File: `examples/with-next-app/app/[locale]/layout.tsx`**

```tsx
import { getMessages, VerbiProvider } from 'verbi/next';
import type { ReactNode } from 'react';

export async function generateStaticParams() {
  return [
    { locale: 'en-US' },
    { locale: 'es' },
    { locale: 'fr' },
  ];
}

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

**File: `examples/with-next-app/app/[locale]/page.tsx`**

```tsx
import { getT } from 'verbi/next/server';

export default async function HomePage({ params }: { params: { locale: string } }) {
  const t = await getT(params.locale);

  return (
    <div>
      <h1 verbi>Welcome to Verbi</h1>
      <p verbi>AI-powered internationalization for Next.js</p>
      <p>{t('home.description')}</p>
    </div>
  );
}
```

**File: `examples/with-next-app/verbi.config.ts`**

```typescript
import { defineConfig } from 'verbi/config';
import { openai } from 'verbi/providers';

export default defineConfig({
  sourceLocale: 'en-US',
  locales: ['es', 'fr', 'de', 'ja'],
  messagesDir: './messages',
  provider: openai({
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4o-mini',
  }),
  glossary: [
    { term: 'Verbi', keep: true },
    { term: 'Next.js', keep: true },
  ],
});
```

## Development Workflow

### Initial Setup

```bash
# Clone repo
git clone https://github.com/yourusername/verbi.git
cd verbi

# Install dependencies
pnpm install

# Build library
pnpm build

# Run tests
pnpm test
```

### Development Process

1. **Make changes** in `packages/verbi/src/`
2. **Run tests**: `pnpm test`
3. **Test in example app**:
   ```bash
   cd examples/with-next-app
   pnpm dev
   ```
4. **Run CLI commands**:
   ```bash
   cd examples/with-next-app
   pnpm verbi scan
   pnpm verbi translate --all
   pnpm verbi validate
   ```

## Publishing to npm

**File: `packages/verbi/package.json`**

```json
{
  "name": "verbi",
  "version": "0.1.0",
  "description": "AI-powered i18n for Next.js",
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/verbi"
  },
  "keywords": [
    "i18n",
    "internationalization",
    "nextjs",
    "ai",
    "translation",
    "localization"
  ],
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./runtime": {
      "types": "./dist/runtime.d.ts",
      "import": "./dist/runtime.js",
      "require": "./dist/runtime.cjs"
    },
    "./next": {
      "types": "./dist/next.d.ts",
      "import": "./dist/next.js",
      "require": "./dist/next.cjs"
    },
    "./config": {
      "types": "./dist/config.d.ts",
      "import": "./dist/config.js",
      "require": "./dist/config.cjs"
    },
    "./providers": {
      "types": "./dist/providers.d.ts",
      "import": "./dist/providers.js",
      "require": "./dist/providers.cjs"
    }
  },
  "bin": {
    "verbi": "./bin/verbi.js"
  },
  "files": [
    "dist",
    "bin",
    "README.md"
  ],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "next": "^14.0.0"
  },
  "dependencies": {
    "@babel/parser": "^7.23.0",
    "@babel/traverse": "^7.23.0",
    "@babel/types": "^7.23.0",
    "@formatjs/icu-messageformat-parser": "^2.7.0",
    "commander": "^11.1.0",
    "zod": "^3.22.4",
    "picocolors": "^1.0.0",
    "fast-glob": "^3.3.2",
    "fast-diff": "^1.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/babel__traverse": "^7.20.4",
    "typescript": "^5.3.0",
    "tsup": "^8.0.0",
    "vitest": "^1.0.0"
  },
  "optionalDependencies": {
    "openai": "^4.20.0",
    "@anthropic-ai/sdk": "^0.9.0",
    "deepl-node": "^1.11.0"
  }
}
```

## GitHub Actions CI/CD

**File: `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Lint
        run: pnpm lint
      
      - name: Type check
        run: pnpm typecheck
      
      - name: Build
        run: pnpm build
      
      - name: Test
        run: pnpm test
      
      - name: Test example app
        run: |
          cd examples/with-next-app
          pnpm install
          pnpm build

  integration-test:
    runs-on: ubuntu-latest
    needs: lint-and-test
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build
        run: pnpm build
      
      - name: Run integration tests
        run: pnpm test:integration
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

**File: `.github/workflows/publish.yml`**

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
      id-token: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build
        run: pnpm build
      
      - name: Test
        run: pnpm test
      
      - name: Publish to npm
        run: pnpm publish --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Documentation Structure

### README.md Sections

1. **Quick Start**: Get started in 3 steps
2. **Installation**: npm/pnpm/yarn commands
3. **Configuration**: Config file examples
4. **Marking Content**: How to use `verbi` prop and `v`` tag
5. **CLI Commands**: scan, translate, validate, diff
6. **Next.js Integration**: Setup with App Router
7. **Providers**: OpenAI, Anthropic, DeepL setup
8. **ICU MessageFormat**: Examples and best practices
9. **Caching**: How translation cache works
10. **Validation**: Ensuring translation quality
11. **CI/CD Integration**: GitHub Actions examples
12. **API Reference**: Full API documentation
13. **Troubleshooting**: Common issues and solutions
14. **Contributing**: How to contribute
15. **License**: MIT

**File: `README.md`** (excerpt)

```markdown
# Verbi 🌍

AI-powered internationalization for Next.js. Mark your content, run a command, and let AI translate it.

## Quick Start

```bash
# Install
npm install verbi

# Initialize
npx verbi init

# Mark your content
<h1 verbi>Welcome to my app</h1>

# Extract and translate
npx verbi scan
npx verbi translate --all

# Use in your app
const t = await getT(locale);
t('home.title')
```

## Features

- 🎯 **Next.js Native**: Works with App Router & RSC
- 🤖 **AI Translation**: OpenAI, Anthropic, DeepL support
- ⚡ **Build-time**: Zero runtime AI calls
- 🔒 **Type Safe**: Full TypeScript support
- 📦 **Zero Config**: Sensible defaults, customizable
- 🎨 **ICU MessageFormat**: Plurals, variables, formatting
- 💾 **Caching**: Smart translation cache
- ✅ **Validation**: Automatic quality checks

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

Create `verbi.config.ts`:

```typescript
import { defineConfig } from 'verbi/config';
import { openai } from 'verbi/providers';

export default defineConfig({
  sourceLocale: 'en-US',
  locales: ['es', 'fr', 'de', 'ja'],
  provider: openai({
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4o-mini',
  }),
  glossary: [
    { term: 'Verbi', keep: true },
  ],
});
```

## Usage

### Mark Content for Translation

**JSX (Primary Method)**

```tsx
// Simple text
<h1 verbi>Welcome</h1>

// With variables
<p verbi>Hello {name}</p>

// With explicit key
<button verbi verbiKey="cta.submit">Submit</button>
```

**Template Tags (for JS/TS)**

```typescript
import { v } from 'verbi/runtime';

const messages = [
  v`Welcome`,
  v`Hello {name}`,
  v`You have {count, plural, one {# item} other {# items}}`
];
```

### Extract Messages

```bash
npx verbi scan
```

This creates `messages/en-US/*.json` files.

### Translate

```bash
# Translate specific locales
npx verbi translate --locales es,fr

# Translate all configured locales
npx verbi translate --all
```

### Validate Translations

```bash
npx verbi validate
```

### View Differences

```bash
npx verbi diff --locale es
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
      <h1>{t('home.title')}</h1>
      <p>{t('home.welcome', { name: 'Jordan' })}</p>
    </div>
  );
}
```

### Client Components

```tsx
'use client';

import { useT } from 'verbi/runtime';

export function Welcome({ name }: { name: string }) {
  const t = useT();

  return <h1>{t('common.greeting', { name })}</h1>;
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
    model: 'claude-sonnet-4-5-20250929',
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

Verbi supports ICU MessageFormat for complex translations.

### Variables

```tsx
<p verbi>Hello {name}</p>
```

### Pluralization

```tsx
<p verbi>
  You have {count, plural, one {# item} other {# items}}
</p>
```

### Select (Gender/Case)

```tsx
<p verbi>
  {gender, select, male {He is} female {She is} other {They are}} a developer
</p>
```

### Number/Date Formatting

```tsx
<p verbi>Price: {price, number, currency}</p>
<p verbi>Date: {date, date, long}</p>
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

- **Cache Key**: Based on source text + locale + glossary + provider
- **Storage**: `.verbi-cache/translations.json`
- **Behavior**: Automatic cache hit/miss detection
- **Invalidation**: Automatic on source text or config change

## Validation

Automatic validation checks:

- ✅ ICU syntax validity
- ✅ Placeholder parity (source vs translation)
- ✅ Glossary term preservation
- ✅ Translation quality (paraphrase delta)

Configure validation:

```typescript
export default defineConfig({
  validate: {
    icu: true,
    placeholders: true,
    maxParaphraseDelta: 0.15, // 15% max drift
    failOnMissing: false,
  },
});
```

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
      
      - name: Validate
        run: npx verbi validate
      
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
  namespaceStrategy?: 'file' | 'directory' | 'flat'; // default: 'directory'
}
```

### Runtime API

```typescript
// Server
import { getMessages, getT } from 'verbi/next/server';

const messages = await getMessages(locale);
const t = await getT(locale);
const text = t('key', { variable: 'value' });

// Client
import { useT } from 'verbi/runtime';

const t = useT();
const text = t('key', { variable: 'value' });
```

### CLI Commands

```bash
# Initialize project
verbi init

# Extract messages
verbi scan [--config <path>]

# Translate
verbi translate --locales <locales> [--config <path>]
verbi translate --all [--config <path>]

# Validate
verbi validate [--config <path>]

# Show differences
verbi diff --locale <locale> [--config <path>]
```

## Troubleshooting

### "Missing translation" warnings

1. Run `verbi scan` to extract new content
2. Run `verbi translate --all` to generate translations
3. Rebuild your Next.js app

### Provider API errors

1. Check your API key is set correctly
2. Verify the API key has sufficient credits/quota
3. Check network connectivity
4. Review provider logs for specific error messages

### ICU validation errors

1. Ensure placeholders match in source and translation
2. Check ICU syntax is valid (use the online ICU parser)
3. Verify plural/select forms are complete

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

### Running Example App

```bash
cd examples/with-next-app
pnpm install
pnpm dev
```

## License

MIT © [Your Name]

## Links

- [Documentation](https://verbi.dev)
- [GitHub](https://github.com/yourusername/verbi)
- [npm](https://www.npmjs.com/package/verbi)
- [Discord](https://discord.gg/verbi)
```

## Advanced Features Roadmap

### Phase 1: Core (MVP) ✅
- Basic extraction (JSX `verbi` prop, `v`` tag)
- OpenAI, Anthropic, DeepL providers
- File-based caching
- ICU validation
- CLI commands (scan, translate, validate)
- Next.js integration (getMessages, useT)
- Glossary support

### Phase 2: DX Improvements
- **ESLint Plugin**: Warn on dynamic children in `verbi` elements
- **TypeScript Codegen**: Generate types for all message keys
- **Better Diff UI**: Rich terminal output with colors
- **Source Maps**: Track key → file:line mapping
- **Watch Mode**: Auto-scan on file changes
- **Middleware**: Automatic locale detection/redirect

### Phase 3: Quality & Scale
- **Context-aware Translation**: Use surrounding text for better accuracy
- **Translation Memory**: Reuse similar translations
- **Batch Optimization**: Smart batching to reduce API costs
- **Cost Tracking**: Monitor translation costs per provider
- **Quality Metrics**: Confidence scores, BLEU scores
- **A/B Testing**: Compare translations from different providers

### Phase 4: Team Features
- **Web Review UI**: Local web interface for reviewing translations
- **Collaboration**: Comments, approvals, review workflows
- **Version Control**: Track translation changes over time
- **Analytics**: Usage stats, popular keys, missing translations
- **SaaS Integration**: Optional cloud sync for teams

### Phase 5: Ecosystem
- **Webpack/Turbopack Plugin**: Auto-run scan on builds
- **VS Code Extension**: Inline translation preview
- **Playground**: Interactive web demo
- **Migration Tools**: Import from other i18n libraries
- **Adapters**: Support for other frameworks (Remix, SvelteKit)

## Implementation Priorities

### Week 1-2: Foundation
1. Setup monorepo structure
2. Implement config system with Zod
3. Build JSX extractor (static text only)
4. Implement OpenAI provider
5. Basic CLI (scan command)
6. File-based cache

### Week 3-4: Translation Pipeline
1. Template tag `v`` extractor
2. Catalog generation
3. Translation orchestration
4. Batching and retries
5. CLI (translate, validate commands)
6. ICU validation

### Week 5-6: Next.js Integration
1. Server-side getMessages/getT
2. Client-side useT hook
3. VerbiProvider component
4. ICU runtime formatting
5. Example app with full setup
6. Documentation

### Week 7-8: Polish & Release
1. Anthropic and DeepL providers
2. Provider router
3. Comprehensive tests
4. CLI diff command
5. Better error messages
6. Publish to npm

## Key Implementation Notes

### Design Decisions

1. **Build-time Only**: No runtime AI calls keeps production fast and predictable
2. **File-based Cache**: Simple, version-controllable, no external dependencies
3. **Strict Validation**: Catch translation errors before production
4. **Provider Agnostic**: Easy to add new AI providers
5. **Next.js First**: Optimized for App Router, but extensible
6. **Zero Config Defaults**: Works out of the box, customize as needed

### Performance Considerations

1. **Batch API Calls**: 50 messages per request to reduce latency
2. **Parallel Translation**: Translate multiple locales concurrently
3. **Cache Everything**: Avoid redundant API calls
4. **Incremental Extraction**: Only scan changed files (future)
5. **Streaming Responses**: Show progress for large translation jobs (future)

### Security Considerations

1. **API Keys**: Always use environment variables
2. **Sanitize Content**: Prevent prompt injection in source text
3. **Validate Responses**: Schema validation on AI responses
4. **Rate Limiting**: Respect provider rate limits
5. **Error Handling**: Don't leak sensitive info in error messages

### Testing Strategy

1. **Unit Tests**: Pure functions, no I/O
2. **Integration Tests**: CLI workflows with mocked providers
3. **E2E Tests**: Full Next.js app with real translations
4. **Snapshot Tests**: Validate catalog structure
5. **Performance Tests**: Measure extraction and translation speed

## Common Patterns & Best Practices

### Message Organization

```
messages/
├── en-US/
│   ├── common.json          # Shared across app
│   ├── home.json            # Homepage specific
│   ├── dashboard.json       # Dashboard specific
│   └── errors.json          # Error messages
```

### Key Naming Conventions

```typescript
// Auto-generated keys (recommended for most content)
<p verbi>Welcome home</p>
// → home.abc123

// Explicit keys (for important/stable strings)
<button verbi verbiKey="cta.getStarted">Get Started</button>
// → cta.getStarted

// Namespaced by feature
<h1 verbi verbiKey="dashboard.title">Dashboard</h1>
// → dashboard.title
```

### ICU Patterns

```tsx
// Simple variable
<p verbi>Welcome, {username}</p>

// Plural
<p verbi>
  You have {itemCount, plural, 
    =0 {no items}
    one {# item}
    other {# items}
  }
</p>

// Select (gender)
<p verbi>
  {gender, select,
    male {He}
    female {She}
    other {They}
  } submitted the form
</p>

// Number formatting
<p verbi>Total: {amount, number, ::currency/USD}</p>

// Date formatting
<p verbi>Published: {date, date, long}</p>
```

### Glossary Strategies

```typescript
// Brand terms
{ term: 'Verbi', keep: true }
{ term: 'Next.js', keep: true }

// Product names
{ term: 'Dashboard Pro', keep: true }

// Technical terms (context-dependent)
{ term: 'API', keep: true }
{ term: 'SDK', keep: true }

// Legal terms
{ term: 'Terms of Service', keep: true }
```

### Provider Selection

```typescript
// Cost-effective: OpenAI GPT-4o-mini
// Best quality: Anthropic Claude Sonnet
// Traditional MT: DeepL (fast, deterministic)

// Strategy: Use router to optimize cost vs quality
router({
  rules: [
    // High-quality for Asian languages
    { match: ['en>ja', 'en>zh', 'en>ko'], use: anthropic({...}) },
    
    // DeepL for European languages (fast, cheap)
    { match: ['en>de', 'en>fr', 'en>es'], use: deepl({...}) },
    
    // OpenAI for everything else
    { match: ['en>*'], use: openai({...}) },
  ],
})
```

## Debugging Tips

### Enable Verbose Logging

```typescript
// verbi.config.ts
export default defineConfig({
  // ... other config
  verbose: true, // Enable detailed logs
});
```

### Inspect Extraction Results

```bash
# View extracted keys
cat messages/.verbi/keys.map.json | jq .

# View source catalog
cat messages/en-US/common.json | jq .
```

### Test Provider Manually

```typescript
// test-provider.ts
import { openai } from 'verbi/providers';

const provider = openai({
  apiKey: process.env.OPENAI_API_KEY!,
});

const result = await provider.translate([
  {
    key: 'test',
    sourceText: 'Hello world',
    sourceLocale: 'en',
    targetLocale: 'es',
  },
]);

console.log(result);
```

### Debug ICU Validation

```typescript
// test-icu.ts
import { validateICU, validateICUParity } from 'verbi/validator/icu';

const result = validateICUParity(
  'You have {count, plural, one {# item} other {# items}}',
  'Tienes {count, plural, one {# artículo} other {# artículos}}'
);

console.log(result);
```

## Migration from Other Libraries

### From react-i18next

```tsx
// Before (react-i18next)
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('welcome')}</h1>;
}

// After (Verbi)
import { useT } from 'verbi/runtime';

function MyComponent() {
  const t = useT();
  return <h1>{t('welcome')}</h1>;
}

// Or use inline marking
function MyComponent() {
  return <h1 verbi>Welcome</h1>;
}
```

### From next-intl

```tsx
// Before (next-intl)
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('Index');
  return <h1>{t('title')}</h1>;
}

// After (Verbi)
import { useT } from 'verbi/runtime';

function MyComponent() {
  const t = useT();
  return <h1>{t('index.title')}</h1>;
}
```

### From formatjs/react-intl

```tsx
// Before (react-intl)
import { FormattedMessage } from 'react-intl';

<FormattedMessage
  id="welcome"
  defaultMessage="Welcome {name}"
  values={{ name: 'Jordan' }}
/>

// After (Verbi)
import { Trans } from 'verbi/runtime';

<Trans id="welcome" values={{ name: 'Jordan' }} />

// Or inline
<p verbi>Welcome {name}</p>
```

---

## Summary

This implementation guide provides a complete blueprint for building Verbi from scratch. Key highlights:

✅ **Clear Architecture**: Modular design with separation of concerns  
✅ **Type Safety**: Full TypeScript with Zod validation  
✅ **Provider Flexibility**: Easy to add new AI providers  
✅ **Next.js Native**: Optimized for App Router & RSC  
✅ **Developer Experience**: Simple marking syntax, powerful CLI  
✅ **Production Ready**: Caching, validation, error handling  
✅ **Extensible**: Clear patterns for adding features  

The implementation follows best practices for:
- Clean code architecture
- Comprehensive error handling
- Performance optimization
- Security considerations
- Testing strategies
- Documentation

You can now use this guide with Claude Code to build Verbi step by step! 🚀