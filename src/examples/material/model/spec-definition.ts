/**
 * Định nghĩa thông số kỹ thuật (danh mục tái dùng) — KHÔNG phải giá trị.
 * Mock-first, example-only.
 */
export type SpecDataType =
  | 'text'
  | 'number'
  | 'single_select'
  | 'multi_select'
  | 'boolean'
  | 'date';

export const SPEC_DATA_TYPE_LABELS: Record<SpecDataType, string> = {
  text: 'Văn bản',
  number: 'Số + đơn vị',
  single_select: 'Chọn 1',
  multi_select: 'Chọn nhiều',
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

export interface SpecDefinition {
  id: string;
  code: string;
  name: string;
  dataType: SpecDataType;
  /** Chỉ `number`: 'kg' | 'g' | 'inch' | 'mm'... */
  unit?: string;
  /** Chỉ `single_select` | `multi_select`: master list. */
  options?: SpecOption[];
  description?: string;
  isActive: boolean;
}

/**
 * Giá trị thông số — union, hình dạng phụ thuộc `SpecDefinition.dataType`:
 *  - text          -> string
 *  - number        -> NumberSpecValue
 *  - single_select -> string (optionId)
 *  - multi_select  -> string[] (optionId[])
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
export type SelectSpecDataType = 'single_select' | 'multi_select';

export function isSelectDataType(
  dataType: SpecDataType,
): dataType is SelectSpecDataType {
  return dataType === 'single_select' || dataType === 'multi_select';
}
