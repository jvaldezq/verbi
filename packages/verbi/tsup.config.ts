import { defineConfig } from 'tsup';

export default defineConfig([
  // Browser-compatible builds for runtime
  {
    entry: {
      index: 'src/index.ts',
      runtime: 'src/runtime/index.ts',
      next: 'src/next/index.ts',
      'next.server': 'src/next/server.ts',
      config: 'src/config/index.ts',
      providers: 'src/providers/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: false, // Disable source maps for production
    clean: true,
    minify: true, // Enable minification
    external: [
      'react',
      'next',
      // AI provider SDKs - users install these separately
      'openai',
      '@anthropic-ai/sdk',
      'deepl-node',
    ],
    noExternal: [
      '@babel/parser',
      '@babel/traverse',
      '@babel/types',
      '@formatjs/icu-messageformat-parser',
      'picocolors',
      'fast-glob',
      'fast-diff',
    ],
  },
  // Node.js-specific build for CLI
  {
    entry: {
      cli: 'src/cli/index.ts',
    },
    format: ['cjs'],
    platform: 'node',
    dts: false,
    splitting: false,
    sourcemap: false, // Disable source maps for production
    minify: true, // Enable minification
    clean: false,
    external: [
      'react',
      'next',
      // AI provider SDKs - users install these separately
      'openai',
      '@anthropic-ai/sdk',
      'deepl-node',
    ],
    noExternal: [
      '@babel/parser',
      '@babel/traverse',
      '@babel/types',
      'commander',
      'picocolors',
      'fast-glob',
      'fast-diff',
      'prompts',
      'dotenv',
      '@formatjs/icu-messageformat-parser',
    ],
  }
]);