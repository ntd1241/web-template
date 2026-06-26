/**
 * Định nghĩa thông số kỹ thuật (danh mục tái dùng) — KHÔNG phải giá trị.
 * Mock-first, example-only.
 */
export type SpecDataType = 'text' | 'number' | 'list' | 'boolean' | 'date';

export const SPEC_DATA_TYPE_LABELS: Record<SpecDataType, string> = {
  text: 'Văn bản',
  number: 'Số + đơn vị',
  list: 'Danh sách',
  boolean: 'Có / Không',
  date: 'Ngày tháng',
};

export interface SpecOption {
  id: string;
  label: string;
  value: string;
  /** Optional — cho thông số màu hiển thị swatch. */
  colorHex?: string;
}

export type ListSelectionMode = 'single' | 'multi';

export const LIST_SELECTION_MODE_LABELS: Record<ListSelectionMode, string> = {
  single: 'Chọn 1',
  multi: 'Chọn nhiều',
};

export interface SpecDefinition {
  id: string;
  code: string;
  name: string;
  dataType: SpecDataType;
  /** Chỉ `number`: 'kg' | 'g' | 'inch' | 'mm'... */
  unit?: string;
  /** Chỉ `list`: nguồn giá trị mặc định. */
  defaultValueSetId?: string;
  /** Chỉ `list`: chế độ chọn mặc định. */
  defaultSelectionMode?: ListSelectionMode;
  /** Gate: mẫu vật tư được đổi single/multi không. Resolver phải enforce. */
  allowModelSelectionOverride: boolean;
  /** Gate: mẫu vật tư được đổi value set / chọn subset không. Resolver phải enforce. */
  allowModelValueSetOverride: boolean;
  /** Giá trị mặc định dùng khi mẫu vật tư chưa override. */
  defaultValue?: SpecValue;
  description?: string;
}

/**
 * Giá trị thông số — union, hình dạng phụ thuộc `SpecDefinition.dataType`:
 *  - text          -> string
 *  - number        -> NumberSpecValue
 *  - list          -> string (optionId) | string[] (optionId[]) theo selectionMode
 *  - boolean       -> boolean
 *  - date          -> string (ISO date)
 *
 * CHỐT: đọc/ghi/validate qua helper ở `lib/spec-value.ts` — KHÔNG truy cập
 * trực tiếp shape ở component để tránh sai kiểu.
 */
export interface NumberSpecValue {
  amount: number;
  unit?: string;
}

export type SpecValue = string | boolean | string[] | NumberSpecValue;

/** Các kiểu dùng option list. */
export type ListSpecDataType = 'list';

export function isListDataType(
  dataType: SpecDataType,
): dataType is ListSpecDataType {
  return dataType === 'list';
}
