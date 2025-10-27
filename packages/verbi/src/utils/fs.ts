import { readFile, writeFile, mkdir, stat, access } from 'fs/promises';
import { dirname, join, resolve, relative } from 'path';
import { constants } from 'fs';

export async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

export async function ensureFile(filePath: string, defaultContent = ''): Promise<void> {
  await ensureDir(dirname(filePath));

  try {
    await access(filePath, constants.F_OK);
  } catch {
    await writeFile(filePath, defaultContent, 'utf-8');
  }
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function readJSON<T = unknown>(path: string): Promise<T> {
  const content = await readFile(path, 'utf-8');
  return JSON.parse(content) as T;
}

export async function writeJSON(path: string, data: unknown): Promise<void> {
  await ensureDir(dirname(path));
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

export function normalizePathSeparators(path: string): string {
  return path.replace(/\\/g, '/');
}

export function getRelativePath(from: string, to: string): string {
  return normalizePathSeparators(relative(from, to));
}

export function resolvePath(...paths: string[]): string {
  return resolve(...paths);
}