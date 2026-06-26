/**
 * Mẫu vật tư ("iPhone 17 Pro") — template gom nhiều thiết bị thật cùng loại.
 * Mock-first, example-only.
 */
import type {
  ListSelectionMode,
  SpecDataType,
  SpecOption,
  SpecValue,
} from './spec-definition';

export type MaterialModelSpecSource = 'catalog' | 'custom';

/** Cách giá trị thông số ứng xử khi tạo/sửa vật tư thật từ mẫu. */
export type MaterialValueMode = 'locked' | 'editable';

export const MATERIAL_VALUE_MODE_LABELS: Record<MaterialValueMode, string> = {
  locked: 'Khóa theo mẫu',
  editable: 'Vật tư nhập riêng',
};

export interface CustomSpecDefinition {
  code: string;
  name: string;
  dataType: SpecDataType;
  unit?: string;
  options?: SpecOption[];
  defaultSelectionMode?: ListSelectionMode;
  defaultValue?: SpecValue;
  description?: string;
}

export const MATERIAL_MODEL_SPEC_SOURCE_LABELS: Record<
  MaterialModelSpecSource,
  string
> = {
  catalog: 'Từ danh mục',
  custom: 'Riêng của mẫu',
};

export interface MaterialModelSpec {
  /** ID thông số trong phạm vi mẫu; catalog specs thường dùng chính specDefinitionId. */
  id: string;
  source: MaterialModelSpecSource;
  specDefinitionId?: string;
  customDefinition?: CustomSpecDefinition;
  labelOverride?: string;
  partKey?: string;
  selectionModeOverride?: ListSelectionMode;
  valueSetIdOverride?: string;
  optionSource?: MaterialModelSpecOptionSource;
  materialValueMode: MaterialValueMode;
  /** Giá trị khóa theo mẫu hoặc giá trị mặc định khi vật tư được nhập riêng. */
  defaultValue?: SpecValue;
  isRequired: boolean;
  sortOrder: number;
}

export type MaterialModelSpecOptionSource =
  | { mode: 'inherit' }
  | { mode: 'subset'; optionIds: string[] };

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
