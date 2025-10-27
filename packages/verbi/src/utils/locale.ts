/**
 * Normalizes a locale string to a standard format
 * @param locale - The locale string to normalize
 * @returns Normalized locale string
 */
export function normalizeLocale(locale: string): string {
  // Handle common variations
  const normalized = locale.replace(/_/g, '-');

  // Split into parts
  const parts = normalized.split('-');

  if (parts.length === 1) {
    // Just language code (e.g., 'en')
    return parts[0].toLowerCase();
  } else if (parts.length === 2) {
    // Language and region (e.g., 'en-US')
    return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
  } else {
    // More complex locale (e.g., 'zh-Hans-CN')
    return normalized;
  }
}

/**
 * Extracts the language code from a locale
 * @param locale - The locale string
 * @returns Language code (e.g., 'en' from 'en-US')
 */
export function getLanguageCode(locale: string): string {
  return locale.split('-')[0].toLowerCase();
}

/**
 * Checks if two locales are for the same language
 * @param locale1 - First locale
 * @param locale2 - Second locale
 * @returns True if same language
 */
export function isSameLanguage(locale1: string, locale2: string): boolean {
  return getLanguageCode(locale1) === getLanguageCode(locale2);
}

/**
 * Gets a display name for a locale
 * @param locale - The locale string
 * @returns Human-readable locale name
 */
export function getLocaleDisplayName(locale: string): string {
  const displayNames: Record<string, string> = {
    'en': 'English',
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
    'es': 'Spanish',
    'es-ES': 'Spanish (Spain)',
    'es-MX': 'Spanish (Mexico)',
    'fr': 'French',
    'fr-FR': 'French (France)',
    'fr-CA': 'French (Canada)',
    'de': 'German',
    'de-DE': 'German (Germany)',
    'it': 'Italian',
    'pt': 'Portuguese',
    'pt-BR': 'Portuguese (Brazil)',
    'pt-PT': 'Portuguese (Portugal)',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'ar': 'Arabic',
    'ru': 'Russian',
    'pl': 'Polish',
    'tr': 'Turkish',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'da': 'Danish',
    'fi': 'Finnish',
    'no': 'Norwegian',
    'cs': 'Czech',
    'el': 'Greek',
    'he': 'Hebrew',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'id': 'Indonesian',
    'hi': 'Hindi',
  };

  const normalized = normalizeLocale(locale);
  return displayNames[normalized] || normalized;
}

/**
 * Validates if a locale string is valid
 * @param locale - The locale string to validate
 * @returns True if valid locale format
 */
export function isValidLocale(locale: string): boolean {
  // Basic regex for locale format
  const localeRegex = /^[a-z]{2,3}(-[A-Z]{2})?$/;
  const normalized = normalizeLocale(locale);
  return localeRegex.test(normalized);
}