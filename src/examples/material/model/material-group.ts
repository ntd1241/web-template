/**
 * Nhóm vật tư — danh mục phân cấp (cây cha–con).
 * Thay cho enum `MaterialGroupKey` cứng trong `material.ts` ở các trang mới.
 * Mock-first, example-only.
 */
export interface MaterialGroup {
  id: string;
  code: string;
  name: string;
  /** null = nhóm gốc. */
  parentId: string | null;
  description?: string;
  sortOrder: number;
}
