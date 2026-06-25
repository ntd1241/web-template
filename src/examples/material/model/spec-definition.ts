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

export interface SpecDefinition {
  id: string;
  code: string;
  name: string;
  dataType: SpecDataType;
  /** Chỉ `number`: 'kg' | 'g' | 'inch' | 'mm'... */
  unit?: string;
  /** Chỉ `list`: danh sách mặc định/master list. Có thể để trống. */
  options?: SpecOption[];
  /** Chỉ `list`: true nếu thông số cho phép chọn nhiều giá trị. */
  allowMultiple: boolean;
  /** Chỉ `list`: true nếu từng mẫu được sửa danh sách giá trị riêng. */
  allowDynamicValues: boolean;
  /** True nếu mẫu vật tư được override giá trị/danh sách mặc định từ danh mục. */
  allowModelOverride: boolean;
  /** Giá trị mặc định dùng khi mẫu vật tư chưa override. */
  defaultValue?: SpecValue;
  description?: string;
}

/**
 * Giá trị thông số — union, hình dạng phụ thuộc `SpecDefinition.dataType`:
 *  - text          -> string
 *  - number        -> NumberSpecValue
 *  - list          -> string (optionId) | string[] (optionId[]) theo allowMultiple
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
