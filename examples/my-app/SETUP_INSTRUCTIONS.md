# 🚀 Quick Setup Instructions for Verbi Example

## Automatic Setup (Recommended)

Run the setup script from this directory:

```bash
./setup.sh
```

This will:
- Install all dependencies
- Build the Verbi package
- Create your .env.local file

## Manual Setup

If you prefer to set up manually or the script doesn't work:

### 1. Build Verbi Package First

```bash
# From the root of the monorepo
cd ../..
pnpm install

# Build the verbi package
cd packages/verbi
pnpm build

# Return to example
cd ../../examples/my-app
```

### 2. Set Up Environment Variables

```bash
# Copy the template
cp .env.local.example .env.local

# Edit .env.local and add your OpenAI API key
# OPENAI_API_KEY=sk-...your-key-here
```

### 3. Install Example Dependencies

```bash
pnpm install
```

### 4. Run the Development Server

```bash
pnpm dev
```

## Troubleshooting

### "Cannot find module 'verbi/runtime'" Error

This means the Verbi package hasn't been built yet. Run:

```bash
cd ../../packages/verbi && pnpm build && cd -
```

### TypeScript Errors about 'verbi' prop

The TypeScript declarations are already set up in `types/verbi.d.ts`. If you still see errors:

1. Restart your TypeScript server in VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
2. Clear Next.js cache: `rm -rf .next`
3. Restart the dev server

### "Module not found" Errors

Make sure you've run `pnpm install` from the monorepo root:

```bash
cd ../.. && pnpm install && cd examples/my-app
```

### API Key Issues

Make sure your `.env.local` file contains a valid OpenAI API key:

```
OPENAI_API_KEY=sk-...your-actual-key-here
```

## Testing the App

1. Open [http://localhost:3000](http://localhost:3000)
2. You should be redirected to `/en` (English)
3. Use the language switcher in the header to switch to Spanish
4. Try the interactive examples:
   - Type your name in the input field
   - Use the counter to see pluralization
   - All text marked with `verbi` will be translated

## Adding New Translations

1. Add new content with the `verbi` prop:
   ```tsx
   <p verbi>This text will be translated</p>
   ```

2. Extract the content:
   ```bash
   pnpm verbi:scan
   ```

3. Translate to Spanish:
   ```bash
   pnpm verbi:translate
   ```

4. The translations will appear in `messages/es/messages.json`