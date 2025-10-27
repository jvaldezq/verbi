import { readFile } from 'fs/promises';
import { join } from 'path';
import { formatMessage } from '../runtime/icu-runtime.js';

// Create a simple in-memory cache for messages
const messagesCache = new Map<string, Record<string, string>>();

export async function getMessages(locale: string): Promise<Record<string, string>> {
  // Check cache first
  if (messagesCache.has(locale)) {
    return messagesCache.get(locale)!;
  }

  const messagesPath = join(process.cwd(), 'messages', locale, 'messages.json');

  try {
    const content = await readFile(messagesPath, 'utf-8');
    const parsed = JSON.parse(content);

    const messages: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'object' && value !== null && 'message' in value) {
        messages[key] = (value as any).message;
      } else {
        messages[key] = String(value);
      }
    }

    // Store in cache
    messagesCache.set(locale, messages);

    return messages;
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    return {};
  }
}

export async function getT(locale: string) {
  const messages = await getMessages(locale);

  return function t(key: string, values?: Record<string, unknown>): string {
    const message = messages[key];

    if (!message) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation: ${key}`);
      }
      return key;
    }

    if (!values) {
      return message;
    }

    return formatMessage(message, values, locale);
  };
}