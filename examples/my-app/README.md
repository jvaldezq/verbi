# Verbi Next.js Example

This example demonstrates how to use Verbi for AI-powered internationalization in a Next.js application with App Router.

## Features Demonstrated

- 🌍 **Language Switching**: Switch between English and Spanish
- 🤖 **AI Translation**: Automatic translation using OpenAI/Anthropic
- 📝 **Multiple Marking Methods**: Using `verbi` prop and `useT` hook
- 🔢 **Pluralization**: ICU MessageFormat for plural forms
- 🎨 **Client & Server Components**: Works with both RSC and client components
- 🔄 **Automatic Locale Detection**: Based on browser preferences
- 💾 **Translation Caching**: Avoid redundant API calls

## Getting Started

### 1. Install Dependencies

From the root of the monorepo:

```bash
pnpm install
```

### 2. Build Verbi Package

```bash
cd packages/verbi
pnpm build
cd ../../examples/my-app
```

### 3. Set Up Your API Key

Add your OpenAI API key to `.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
```

### 4. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## How It Works

### Marking Content for Translation

There are three ways to mark content:

1. **Using the `verbi` prop** (recommended for static content):
```tsx
<h1 verbi>Welcome to Verbi</h1>
```

2. **Using the `useT` hook** (for client components):
```tsx
const t = useT();
<p>{t('message.key')}</p>
```

3. **Using server-side `getT`** (for server components):
```tsx
const t = await getT(locale);
<p>{t('message.key')}</p>
```

### Extracting and Translating

1. **Scan for translatable content**:
```bash
pnpm verbi:scan
```

2. **Translate to all configured locales**:
```bash
pnpm verbi:translate
```

The translations are stored in `messages/[locale]/messages.json`.

## Project Structure

```
my-app/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx      # Locale-specific layout with VerbiProvider
│   │   └── page.tsx        # Main page with examples
│   ├── layout.tsx          # Root layout
│   └── page.tsx           # Redirects to default locale
├── components/
│   ├── Counter.tsx         # Pluralization example
│   ├── ExampleClientComponent.tsx  # Client component example
│   └── LanguageSwitcher.tsx       # Language switching UI
├── messages/
│   ├── en/
│   │   └── messages.json   # English translations
│   └── es/
│       └── messages.json   # Spanish translations
├── middleware.ts           # Locale detection and routing
├── verbi.config.ts        # Verbi configuration
└── .env.local            # API keys (not committed)
```

## Key Files

### `verbi.config.ts`
Configures Verbi with:
- Source and target locales
- AI provider settings
- Glossary terms to preserve
- File patterns to scan

### `app/[locale]/layout.tsx`
- Loads messages for the current locale
- Wraps the app with `VerbiProvider`
- Includes the language switcher

### `middleware.ts`
- Detects user's preferred language
- Redirects to appropriate locale
- Handles locale routing

## Testing Translation

1. **Add new content** with the `verbi` prop
2. **Run scan** to extract: `pnpm verbi:scan`
3. **Run translate**: `pnpm verbi:translate`
4. **Switch languages** using the dropdown
5. **See translations** applied instantly

## Advanced Features

### Pluralization
```tsx
<p verbi>
  You have {count, plural,
    =0 {no items}
    one {# item}
    other {# items}
  } in your cart
</p>
```

### Variables
```tsx
<p verbi>Welcome {name}!</p>
```

### Glossary Terms
Terms like "Verbi" and "Next.js" are preserved during translation as configured in `verbi.config.ts`.

## Troubleshooting

### Missing Translations
- Run `pnpm verbi:scan` to extract new content
- Run `pnpm verbi:translate` to generate translations
- Check `messages/` folder for generated files

### API Key Issues
- Ensure `OPENAI_API_KEY` is set in `.env.local`
- Check API key has sufficient credits
- Try using a different provider (Anthropic, DeepL)

### Build Errors
- Ensure Verbi package is built: `cd ../../packages/verbi && pnpm build`
- Run `pnpm install` from monorepo root
- Clear Next.js cache: `rm -rf .next`

## Learn More

- [Verbi Documentation](https://github.com/yourusername/verbi)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [ICU MessageFormat](https://formatjs.io/docs/core-concepts/icu-syntax)