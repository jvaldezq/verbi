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
    sourcemap: true,
    clean: true,
    external: ['react', 'next'],
    noExternal: [
      '@babel/parser',
      '@babel/traverse',
      '@babel/types',
      '@formatjs/icu-messageformat-parser',
      'zod',
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
    sourcemap: true,
    clean: false,
    external: ['react', 'next'],
    noExternal: [
      '@babel/parser',
      '@babel/traverse',
      '@babel/types',
      'commander',
      'zod',
      'picocolors',
      'fast-glob',
      'fast-diff',
    ],
  }
]);