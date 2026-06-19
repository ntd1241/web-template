/**
 * Material (vật tư / thiết bị) domain model for the table-builder pilot.
 * Mock-first, example-only.
 */
export type MaterialGroup = 'kiem-ke' | 'van-phong' | 'an-toan' | 'cong-cu';

export interface Material {
  id: string;
  name: string;
  code: string;
  imageUrl: string;
  group: MaterialGroup;
  tags: string[];
}

export const MATERIAL_GROUP_LABELS: Record<MaterialGroup, string> = {
  'kiem-ke': 'Thiết bị kiểm kê',
  'van-phong': 'Văn phòng',
  'an-toan': 'An toàn lao động',
  'cong-cu': 'Công cụ - dụng cụ',
};
