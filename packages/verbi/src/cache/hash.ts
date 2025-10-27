import { createHash } from 'crypto';

export function hashContent(content: string | object): string {
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  return createHash('sha256').update(text).digest('hex');
}

export function shortHash(content: string | object): string {
  return hashContent(content).substring(0, 8);
}

export function compareHashes(hash1: string, hash2: string): boolean {
  return hash1 === hash2;
}