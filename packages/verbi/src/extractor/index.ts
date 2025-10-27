export { parseFile, generateKey } from './parser.js';
export type { ExtractedMessage } from './parser.js';

export { buildCatalogs } from './catalog.js';
export type { MessageCatalog } from './catalog.js';

export {
  generateStableKey,
  generateReadableKey,
  isValidKey,
  sanitizeKey,
} from './key-generator.js';