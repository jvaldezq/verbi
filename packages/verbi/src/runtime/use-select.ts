'use client';

import { useContext } from 'react';
import { VerbiContext } from './context.js';

export interface SelectOptions {
  [key: string]: string;
  other: string;
}

export function useSelect() {
  const context = useContext(VerbiContext);

  if (!context) {
    throw new Error('useSelect must be used within VerbiProvider');
  }

  return function select(value: string, options: SelectOptions): string {
    return options[value] || options.other || value;
  };
}

// Convenience function for gender selection
export function useGender() {
  const selectFn = useSelect();

  return function gender(
    value: 'male' | 'female' | 'neutral' | 'other',
    options: {
      male?: string;
      female?: string;
      neutral?: string;
      other: string;
    }
  ): string {
    return selectFn(value, options as SelectOptions);
  };
}