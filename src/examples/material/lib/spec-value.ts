/**
 * Đọc / ghi / validate / hiển thị SpecValue theo dataType.
 * Tập trung mọi type-guard ở đây — component KHÔNG đụng shape union trực tiếp.
 */
import {
  type NumberSpecValue,
  type ListSelectionMode,
  type SpecDataType,
  type SpecDefinition,
  type SpecOption,
  type SpecValue,
} from '../model/spec-definition';

export function isNumberSpecValue(
  value: SpecValue | undefined,
): value is NumberSpecValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as NumberSpecValue).amount === 'number'
  );
}

export function isMultiSelectValue(
  value: SpecValue | undefined,
): value is string[] {
  return Array.isArray(value);
}

/** Có coi như "đã điền"? (rỗng/undefined -> false). */
export function isEmptySpecValue(value: SpecValue | undefined): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (isNumberSpecValue(value)) return Number.isNaN(value.amount);
  return false;
}

/** Giá trị rỗng mặc định cho 1 kiểu dữ liệu (cho form khởi tạo). */
export function emptySpecValue(
  dataType: SpecDataType,
  allowMultiple = false,
): SpecValue {
  switch (dataType) {
    case 'list':
      return allowMultiple ? [] : '';
    case 'boolean':
      return false;
    case 'number':
      return { amount: Number.NaN };
    default:
      return '';
  }
}

/** Value có hợp lệ theo định nghĩa không? (dùng cho validate form). */
export function isValidSpecValue(
  def: SpecDefinition,
  value: SpecValue | undefined,
  selectionMode: ListSelectionMode | undefined = def.defaultSelectionMode,
): boolean {
  if (value === undefined) return false;
  switch (def.dataType) {
    case 'text':
    case 'date':
      return typeof value === 'string';
    case 'boolean':
      return typeof value === 'boolean';
    case 'list':
      return selectionMode === 'multi'
        ? Array.isArray(value)
        : typeof value === 'string';
    case 'number':
      return isNumberSpecValue(value) && !Number.isNaN(value.amount);
    default:
      return false;
  }
}

function findOptionLabel(
  optionId: string,
  options: SpecOption[] | undefined,
): string {
  return options?.find((o) => o.id === optionId)?.label ?? optionId;
}

/** Chuỗi hiển thị tiếng Việt cho 1 value. */
export function formatSpecValue(
  def: SpecDefinition,
  value: SpecValue | undefined,
  options?: SpecOption[],
  selectionMode: ListSelectionMode | undefined = def.defaultSelectionMode,
): string {
  if (isEmptySpecValue(value)) return '—';
  switch (def.dataType) {
    case 'boolean':
      return value ? 'Có' : 'Không';
    case 'number': {
      if (!isNumberSpecValue(value)) return '—';
      const unit = value.unit ?? def.unit;
      return unit ? `${value.amount} ${unit}` : String(value.amount);
    }
    case 'list':
      if (selectionMode !== 'multi') {
        return findOptionLabel(value as string, options);
      }
      return (value as string[])
        .map((id) => findOptionLabel(id, options))
        .join(', ');
    default:
      // text | date
      return String(value);
  }
}

/**
 * Lọc value `list` về tập option cho phép của mẫu.
 * - chọn 1: trả về optionId nếu nằm trong allowed, ngược lại undefined.
 * - chọn nhiều: giữ lại các id nằm trong allowed.
 */
export function constrainSelectValue(
  def: SpecDefinition,
  value: SpecValue | undefined,
  allowedOptionIds: string[] | undefined,
  selectionMode: ListSelectionMode | undefined = def.defaultSelectionMode,
): SpecValue | undefined {
  if (def.dataType !== 'list' || !allowedOptionIds) return value;
  const allowed = new Set(allowedOptionIds);
  if (selectionMode !== 'multi') {
    return typeof value === 'string' && allowed.has(value) ? value : undefined;
  }
  if (Array.isArray(value)) {
    return value.filter((id) => allowed.has(id));
  }
  return undefined;
}
