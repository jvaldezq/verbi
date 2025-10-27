'use client';

import { useContext } from 'react';
import { VerbiContext } from './context.js';
import { formatMessage } from './icu-runtime.js';

export type TFunction = {
  // Regular function call: t('Hello')
  (key: string, values?: Record<string, unknown>): string;
  // Tagged template: t`Hello ${name}`
  (strings: TemplateStringsArray, ...values: unknown[]): string;
};

export function useT(): TFunction {
  const context = useContext(VerbiContext);

  if (!context) {
    throw new Error('useT must be used within VerbiProvider');
  }

  // Capture context in closure to avoid TypeScript null issues
  const { messages, locale } = context;

  function t(
    keyOrStrings: string | TemplateStringsArray,
    ...values: unknown[]
  ): string {
    // Tagged template literal usage: t`Hello ${name}`
    if (Array.isArray(keyOrStrings) && 'raw' in keyOrStrings) {
      const strings = keyOrStrings as TemplateStringsArray;

      // Build the template string with placeholders
      let sourceText = '';
      for (let i = 0; i < strings.length; i++) {
        sourceText += strings[i];
        if (i < values.length) {
          sourceText += `{${i}}`;
        }
      }

      // Look up translation using source text
      const translatedTemplate = messages[sourceText];

      if (!translatedTemplate) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Missing translation: ${sourceText}`);
        }
        // Fall back to source text with interpolation
        let result = '';
        for (let i = 0; i < strings.length; i++) {
          result += strings[i];
          if (i < values.length) {
            result += String(values[i]);
          }
        }
        return result;
      }

      // Interpolate values into translated template
      const valuesObj: Record<string, unknown> = {};
      values.forEach((value, i) => {
        valuesObj[i.toString()] = value;
      });

      return formatMessage(translatedTemplate, valuesObj, locale);
    }

    // Regular function call: t('Hello') or t('Hello', { name: 'World' })
    const key = keyOrStrings as string;
    const valuesObj = values[0] as Record<string, unknown> | undefined;

    const message = messages[key];

    if (!message) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation: ${key}`);
      }
      return key;
    }

    if (!valuesObj) {
      return message;
    }

    return formatMessage(message, valuesObj, locale);
  }

  return t as TFunction;
}