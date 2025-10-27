export { VerbiProvider, VerbiContext } from './context.js';
export type { VerbiProviderProps, VerbiContextValue } from './context.js';

export { useT } from './use-t.js';
export { usePlural } from './use-plural.js';
export type { PluralOptions } from './use-plural.js';
export { useSelect, useGender } from './use-select.js';
export type { SelectOptions } from './use-select.js';

export { Trans } from './Trans.js';
export type { TransProps } from './Trans.js';

export { formatMessage } from './icu-runtime.js';

// Export a template tag for marking strings
export function v(strings: TemplateStringsArray, ...values: unknown[]): string {
  let result = '';

  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += `{${i}}`;
    }
  }

  return result;
}