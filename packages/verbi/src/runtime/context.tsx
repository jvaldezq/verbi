'use client';

import { createContext, type ReactNode } from 'react';

export interface VerbiContextValue {
  locale: string;
  messages: Record<string, string>;
}

export const VerbiContext = createContext<VerbiContextValue | null>(null);

export interface VerbiProviderProps {
  locale: string;
  messages: Record<string, string>;
  children: ReactNode;
}

export function VerbiProvider({ locale, messages, children }: VerbiProviderProps) {
  return (
    <VerbiContext.Provider value={{ locale, messages }}>
      {children}
    </VerbiContext.Provider>
  );
}