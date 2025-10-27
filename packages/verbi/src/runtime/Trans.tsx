'use client';

import { type ReactNode } from 'react';
import { useT } from './use-t.js';

export interface TransProps {
  children: ReactNode;
  values?: Record<string, unknown>;
}

export function Trans({ children, values }: TransProps) {
  const t = useT();

  // Extract source text from children
  const sourceText = extractTextFromChildren(children);

  if (!sourceText) {
    return <>{children}</>;
  }

  // Look up translation using source text as key
  const translation = t(sourceText, values);

  return <>{translation}</>;
}

/**
 * Extract plain text from React children, converting JSX expressions to ICU placeholders
 */
function extractTextFromChildren(children: ReactNode): string | null {
  if (typeof children === 'string') {
    return children;
  }

  // For now, we only support simple string children
  // Complex JSX structures should use the t() function instead
  return null;
}