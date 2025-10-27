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