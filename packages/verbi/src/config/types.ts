export type {
  VerbiConfig,
  Locale,
  GlossaryTerm,
} from './schema.js';

export type { Provider } from '../providers/base.js';

export interface ConfigContext {
  config: VerbiConfig;
  cwd: string;
}