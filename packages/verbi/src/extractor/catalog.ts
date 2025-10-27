import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import type { ExtractedMessage } from './parser.js';
import type { VerbiConfig } from '../config/schema.js';
import { writeJSON } from '../utils/fs.js';

export interface MessageCatalog {
  [key: string]: {
    message: string;
    location: {
      file: string;
      line: number;
      column: number;
    };
  };
}

export async function buildCatalogs(
  messages: ExtractedMessage[],
  config: VerbiConfig
): Promise<void> {
  // Group messages by namespace
  const namespaces = groupByNamespace(messages, config.namespaceStrategy);

  // Write source locale catalogs
  const sourceDir = join(config.messagesDir, config.sourceLocale);
  await mkdir(sourceDir, { recursive: true });

  for (const [namespace, msgs] of Object.entries(namespaces)) {
    const catalog: MessageCatalog = {};

    for (const msg of msgs) {
      catalog[msg.key] = {
        message: msg.text,
        location: msg.location,
      };
    }

    const filePath = join(sourceDir, `${namespace}.json`);
    await mkdir(dirname(filePath), { recursive: true });
    await writeJSON(filePath, catalog);
  }

  // Write key map for reference
  const keyMapPath = join(config.messagesDir, '.verbi', 'keys.map.json');
  await mkdir(dirname(keyMapPath), { recursive: true });
  await writeJSON(
    keyMapPath,
    messages.map(m => ({
      key: m.key,
      text: m.text,
      location: m.location,
      explicitKey: m.explicitKey,
    }))
  );
}

function groupByNamespace(
  messages: ExtractedMessage[],
  strategy: 'file' | 'directory' | 'flat'
): Record<string, ExtractedMessage[]> {
  const groups: Record<string, ExtractedMessage[]> = {};

  for (const msg of messages) {
    let namespace: string;

    switch (strategy) {
      case 'file':
        // One file per source file
        namespace = msg.location.file.replace(/\.(tsx?|jsx?)$/, '').replace(/\//g, '.');
        break;
      case 'directory':
        // One file per directory
        namespace = dirname(msg.location.file).replace(/\//g, '.') || 'root';
        break;
      case 'flat':
        // All in one file
        namespace = 'messages';
        break;
    }

    if (!groups[namespace]) {
      groups[namespace] = [];
    }
    groups[namespace].push(msg);
  }

  return groups;
}