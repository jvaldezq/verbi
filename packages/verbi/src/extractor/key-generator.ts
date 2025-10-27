import { createHash } from 'crypto';

/**
 * Generates a stable key for a message based on its content and context
 */
export function generateStableKey(
  text: string,
  context?: { file?: string; namespace?: string }
): string {
  const namespace = context?.namespace || context?.file?.replace(/\.(tsx?|jsx?)$/, '').replace(/\//g, '.') || 'global';
  const hash = createHash('sha256').update(text).digest('hex').substring(0, 8);

  return `${namespace}.${hash}`;
}

/**
 * Generates a human-readable key from text
 */
export function generateReadableKey(text: string, maxLength = 30): string {
  // Remove non-alphanumeric characters and convert to camelCase
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0)
    .slice(0, 4); // Limit to first 4 words

  if (words.length === 0) {
    return generateStableKey(text);
  }

  // Convert to camelCase
  const key = words
    .map((word, index) => {
      if (index === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join('');

  // Truncate if too long
  return key.length > maxLength ? key.substring(0, maxLength) : key;
}

/**
 * Validates if a key is valid
 */
export function isValidKey(key: string): boolean {
  // Key must be non-empty and contain only valid characters
  const keyRegex = /^[a-zA-Z][a-zA-Z0-9._-]*$/;
  return keyRegex.test(key);
}

/**
 * Sanitizes a key to ensure it's valid
 */
export function sanitizeKey(key: string): string {
  // Replace invalid characters with underscores
  let sanitized = key.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Ensure it starts with a letter
  if (!/^[a-zA-Z]/.test(sanitized)) {
    sanitized = 'key_' + sanitized;
  }

  return sanitized;
}