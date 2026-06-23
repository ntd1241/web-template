import { describe, expect, it } from 'vitest';
import { MATERIAL_MODELS_MOCK } from '../data/material-models.mock';
import { SPEC_DEFINITIONS_MOCK } from '../data/spec-definitions.mock';
import {
  buildMaterialSpecValues,
  legacyGroupFromModelGroupId,
  validateMaterialSpecValues,
} from './material-device';

describe('material-device helpers', () => {
  it('chỉ lưu override cho input/select và loại fixed', () => {
    const model = MATERIAL_MODELS_MOCK.find(
      (item) => item.id === 'model-iphone17pro',
    );

    expect(model).toBeDefined();
    const specValues = buildMaterialSpecValues(
      model!,
      [
        { specDefinitionId: 'spec-color', value: 'mau-xanh' },
        { specDefinitionId: 'spec-storage', value: 'dl-512' },
        { specDefinitionId: 'spec-weight', value: { amount: 200, unit: 'g' } },
        { specDefinitionId: 'spec-mfg-date', value: '2026-06-23' },
      ],
      SPEC_DEFINITIONS_MOCK,
    );

    expect(specValues).toEqual([
      { specDefinitionId: 'spec-color', value: 'mau-xanh' },
      { specDefinitionId: 'spec-storage', value: 'dl-512' },
      { specDefinitionId: 'spec-mfg-date', value: '2026-06-23' },
    ]);
  });

  it('lọc lựa chọn ngoài allowedOptionIds của mẫu', () => {
    const model = MATERIAL_MODELS_MOCK.find(
      (item) => item.id === 'model-iphone17pro',
    );

    expect(model).toBeDefined();
    const specValues = buildMaterialSpecValues(
      model!,
      [
        { specDefinitionId: 'spec-color', value: 'mau-vang' },
        { specDefinitionId: 'spec-storage', value: 'dl-1tb' },
      ],
      SPEC_DEFINITIONS_MOCK,
    );

    expect(specValues).toEqual([]);
  });

  it('báo thiếu thông số bắt buộc của thiết bị', () => {
    const model = MATERIAL_MODELS_MOCK.find(
      (item) => item.id === 'model-iphone17pro',
    );

    expect(model).toBeDefined();
    const missing = validateMaterialSpecValues(
      model!,
      [{ specDefinitionId: 'spec-color', value: 'mau-den' }],
      SPEC_DEFINITIONS_MOCK,
    );

    expect(missing).toEqual(['Dung lượng']);
  });

  it('map group model về group legacy để tương thích Material', () => {
    expect(legacyGroupFromModelGroupId('grp-kiem-ke')).toBe('kiem-ke');
    expect(legacyGroupFromModelGroupId('grp-pccc')).toBe('an-toan');
    expect(legacyGroupFromModelGroupId('grp-phone')).toBe('van-phong');
  });
});
