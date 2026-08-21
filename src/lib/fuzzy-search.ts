function normalizeSearchText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('vi-VN')
    .trim();
}

function isSubsequence(needle: string, haystack: string): boolean {
  let needleIndex = 0;

  for (const character of haystack) {
    if (character === needle[needleIndex]) {
      needleIndex += 1;
      if (needleIndex === needle.length) return true;
    }
  }

  return needle.length === 0;
}

/**
 * Matches every query token either as a contiguous term or as a subsequence.
 * Diacritics are ignored so Vietnamese labels remain searchable without accents.
 */
export function fuzzyMatch(query: string, value: unknown): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const normalizedValue = normalizeSearchText(value);
  if (!normalizedValue) return false;

  return normalizedQuery
    .split(/\s+/)
    .every(
      (token) =>
        normalizedValue.includes(token) ||
        normalizedValue
          .split(/\s+/)
          .some((word) => isSubsequence(token, word)) ||
        isSubsequence(token, normalizedValue.replace(/\s+/g, '')),
    );
}

export function filterFuzzy<T>(
  items: readonly T[],
  query: string,
  getText: (item: T) => unknown,
): T[] {
  if (!query.trim()) return [...items];
  return items.filter((item) => fuzzyMatch(query, getText(item)));
}
