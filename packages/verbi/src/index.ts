// Main library exports

// Config
export { defineConfig } from './config/index.js';
export type { VerbiConfig, Locale, GlossaryTerm } from './config/index.js';

// Providers - these should be imported from 'verbi/providers'
// Re-exporting here for convenience
export type { Provider, TranslationRequest, TranslationResponse } from './providers/index.js';

// Runtime - these should be imported from 'verbi/runtime'
// Re-exporting key items for convenience
export { v } from './runtime/index.js';

// Validator
export type { ValidationReport, ValidationError, ValidationWarning } from './validator/index.js';

// Version
export const VERSION = '0.1.0';