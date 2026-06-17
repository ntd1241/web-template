export function normalizeVi(input: string | null | undefined): string {
  return (input ?? '')
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function searchMatch(
  text: string | null | undefined,
  query: string | null | undefined,
): boolean {
  const normalizedQuery = normalizeVi(query);

  if (!normalizedQuery) {
    return true;
  }

  return normalizeVi(text).includes(normalizedQuery);
}
