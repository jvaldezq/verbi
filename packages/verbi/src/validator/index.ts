export { validateICU, validateICUParity } from './icu.js';
export type { ICUValidationResult } from './icu.js';

import { validateICUParity } from './icu.js';
import type { VerbiConfig } from '../config/schema.js';

export interface ValidationReport {
  locale: string;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: {
    total: number;
    valid: number;
    invalid: number;
    missing: number;
  };
}

export interface ValidationError {
  key: string;
  type: 'icu' | 'placeholder' | 'glossary' | 'missing';
  message: string;
  sourceText?: string;
  translatedText?: string;
}

export interface ValidationWarning {
  key: string;
  type: 'quality' | 'length' | 'formatting';
  message: string;
}

export async function validateTranslations(
  sourceMessages: Record<string, string>,
  targetMessages: Record<string, string>,
  locale: string,
  config: VerbiConfig
): Promise<ValidationReport> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  let validCount = 0;
  let invalidCount = 0;
  let missingCount = 0;

  for (const [key, sourceText] of Object.entries(sourceMessages)) {
    const targetText = targetMessages[key];

    if (!targetText) {
      missingCount++;
      if (config.validate?.failOnMissing) {
        errors.push({
          key,
          type: 'missing',
          message: `Missing translation for key: ${key}`,
          sourceText,
        });
      }
      continue;
    }

    // Validate ICU format
    if (config.validate?.icu !== false) {
      const icuResult = validateICUParity(sourceText, targetText);
      if (!icuResult.valid) {
        invalidCount++;
        errors.push({
          key,
          type: 'icu',
          message: icuResult.errors.join('; '),
          sourceText,
          translatedText: targetText,
        });
        continue;
      }
    }

    // Validate placeholders
    if (config.validate?.placeholders !== false) {
      const sourcePlaceholders = extractSimplePlaceholders(sourceText);
      const targetPlaceholders = extractSimplePlaceholders(targetText);

      const missing = sourcePlaceholders.filter(p => !targetPlaceholders.includes(p));
      const extra = targetPlaceholders.filter(p => !sourcePlaceholders.includes(p));

      if (missing.length > 0 || extra.length > 0) {
        invalidCount++;
        const messages = [];
        if (missing.length > 0) messages.push(`Missing: ${missing.join(', ')}`);
        if (extra.length > 0) messages.push(`Extra: ${extra.join(', ')}`);

        errors.push({
          key,
          type: 'placeholder',
          message: messages.join('; '),
          sourceText,
          translatedText: targetText,
        });
        continue;
      }
    }

    // Check glossary terms
    if (config.glossary.length > 0) {
      for (const term of config.glossary) {
        if (term.keep && sourceText.includes(term.term) && !targetText.includes(term.term)) {
          errors.push({
            key,
            type: 'glossary',
            message: `Glossary term "${term.term}" not preserved in translation`,
            sourceText,
            translatedText: targetText,
          });
        }
      }
    }

    // Check text length variance
    const lengthRatio = targetText.length / sourceText.length;
    if (lengthRatio > 3 || lengthRatio < 0.33) {
      warnings.push({
        key,
        type: 'length',
        message: `Translation length significantly different (${Math.round(lengthRatio * 100)}% of original)`,
      });
    }

    validCount++;
  }

  const total = Object.keys(sourceMessages).length;

  return {
    locale,
    errors,
    warnings,
    stats: {
      total,
      valid: validCount,
      invalid: invalidCount,
      missing: missingCount,
    },
  };
}

function extractSimplePlaceholders(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return matches.map(m => m.slice(1, -1));
}