/**
 * Mẫu vật tư ("iPhone 17 Pro") — template gom nhiều thiết bị thật cùng loại.
 * Mock-first, example-only.
 */
import type { SpecOption, SpecValue } from './spec-definition';

/** Chế độ ứng xử của thông số ở thiết bị thật. */
export type SpecDeviceMode = 'fixed' | 'input' | 'select';

export const SPEC_DEVICE_MODE_LABELS: Record<SpecDeviceMode, string> = {
  fixed: 'Cứng (kế thừa)',
  input: 'Tự nhập',
  select: 'Chọn từ danh sách',
};

export interface MaterialModelSpec {
  specDefinitionId: string;
  deviceMode: SpecDeviceMode;
  /** `fixed`: giá trị kế thừa | `input`: giá trị mặc định (optional). */
  modelValue?: SpecValue;
  /** `select`: tập con optionId của `SpecDefinition.options`. */
  allowedOptionIds?: string[];
  /** `list` + allowDynamicValues: danh sách lựa chọn riêng của mẫu. */
  dynamicOptions?: SpecOption[];
  isRequired: boolean;
  sortOrder: number;
}

export interface MaterialModel {
  id: string;
  code: string;
  name: string;
  description?: string;
  /** Xuất xứ. */
  origin?: string;
  groupId: string;
  imageUrls: string[];
  specs: MaterialModelSpec[];
}
