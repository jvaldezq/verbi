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

export function parseAIResponse(content: string): Array<{ key: string; text: string }> {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Handle different response formats
    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (parsed.translations && Array.isArray(parsed.translations)) {
      return parsed.translations;
    }

    if (parsed.results && Array.isArray(parsed.results)) {
      return parsed.results;
    }

    // If it's a single object with translations as properties
    if (typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.entries(parsed).map(([key, text]) => ({
        key,
        text: String(text),
      }));
    }

    throw new Error('Invalid response format');
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : String(error)}`);
  }
}