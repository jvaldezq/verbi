export interface DiffItem {
  key: string;
  text: string;
  status: 'new' | 'changed' | 'deleted';
  previousText?: string;
}

export function diffCatalogs(
  source: Record<string, string>,
  target: Record<string, string>
): DiffItem[] {
  const items: DiffItem[] = [];

  // Find new and changed items
  for (const [key, sourceText] of Object.entries(source)) {
    const targetText = target[key];

    if (!targetText) {
      items.push({ key, text: sourceText, status: 'new' });
    } else if (sourceText !== targetText) {
      // Check if source text has changed (would need re-translation)
      items.push({
        key,
        text: sourceText,
        status: 'changed',
        previousText: targetText,
      });
    }
  }

  // Find deleted items (in target but not in source)
  for (const key of Object.keys(target)) {
    if (!(key in source)) {
      items.push({
        key,
        text: target[key],
        status: 'deleted',
      });
    }
  }

  return items;
}

export function filterItemsForTranslation(items: DiffItem[]): DiffItem[] {
  // Only translate new and changed items, not deleted ones
  return items.filter(item => item.status === 'new' || item.status === 'changed');
}