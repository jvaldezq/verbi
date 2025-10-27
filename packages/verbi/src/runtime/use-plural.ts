'use client';

import { useContext } from 'react';
import { VerbiContext } from './context.js';

export interface PluralOptions {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

export function usePlural() {
  const context = useContext(VerbiContext);

  if (!context) {
    throw new Error('usePlural must be used within VerbiProvider');
  }

  return function plural(count: number, options: PluralOptions): string {
    const pluralRules = new Intl.PluralRules(context.locale);
    const rule = pluralRules.select(count);

    // Check for exact matches first
    if (count === 0 && options.zero) {
      return options.zero.replace(/#/g, String(count));
    }
    if (count === 1 && options.one) {
      return options.one.replace(/#/g, String(count));
    }
    if (count === 2 && options.two) {
      return options.two.replace(/#/g, String(count));
    }

    // Use Intl.PluralRules for other cases
    const template = options[rule as keyof PluralOptions] || options.other;
    return template.replace(/#/g, String(count));
  };
}