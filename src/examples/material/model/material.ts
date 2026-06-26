/**
 * Material (vật tư / thiết bị thật) domain model for the table-builder pilot.
 * Mock-first, example-only.
 */
import type { SpecValue } from './spec-definition';

/**
 * Khóa nhóm legacy (enum cứng) — còn dùng cho bảng quản lý hiện tại + badge cột.
 * Sẽ được thay bằng `Material.modelId -> MaterialModel.groupId -> MaterialGroup`
 * ở bước refactor thiết bị thật.
 */
export type MaterialGroupKey = 'kiem-ke' | 'van-phong' | 'an-toan' | 'cong-cu';

/** Override giá trị thông số ở vật tư thật khi MaterialModelSpec cho nhập riêng. */
export interface MaterialSpecValue {
  materialModelSpecId: string;
  value: SpecValue;
}

export interface Material {
  id: string;
  name: string;
  code: string;
  imageUrl: string;
  group: MaterialGroupKey;
  /** FK -> MaterialModel. */
  modelId: string;
  /** Chỉ chứa override cho thông số có materialValueMode = 'editable'. */
  specValues: MaterialSpecValue[];
  tags: string[];
}

export const MATERIAL_GROUP_LABELS: Record<MaterialGroupKey, string> = {
  'kiem-ke': 'Thiết bị kiểm kê',
  'van-phong': 'Văn phòng',
  'an-toan': 'An toàn lao động',
  'cong-cu': 'Công cụ - dụng cụ',
};
