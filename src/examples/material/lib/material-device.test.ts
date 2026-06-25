import { describe, expect, it } from 'vitest';
import { MATERIAL_MODELS_MOCK } from '../data/material-models.mock';
import { SPEC_DEFINITIONS_MOCK } from '../data/spec-definitions.mock';
import { SPEC_VALUE_SETS_MOCK } from '../data/spec-value-sets.mock';
import {
  buildMaterialSpecValues,
  legacyGroupFromModelGroupId,
  validateMaterialSpecValues,
} from './material-device';

describe('material-device helpers', () => {
  it('chỉ lưu override cho thông số editable và loại locked', () => {
    const model = MATERIAL_MODELS_MOCK.find(
      (item) => item.id === 'model-iphone17pro',
    );

    expect(model).toBeDefined();
    const specValues = buildMaterialSpecValues(
      model!,
      [
        { materialModelSpecId: 'iphone-color', value: 'color-blue' },
        { materialModelSpecId: 'iphone-storage', value: 'dl-512' },
        {
          materialModelSpecId: 'iphone-weight',
          value: { amount: 200, unit: 'g' },
        },
        { materialModelSpecId: 'iphone-mfg-date', value: '2026-06-23' },
      ],
      SPEC_DEFINITIONS_MOCK,
      SPEC_VALUE_SETS_MOCK,
    );

    expect(specValues).toEqual([
      { materialModelSpecId: 'iphone-color', value: 'color-blue' },
      { materialModelSpecId: 'iphone-storage', value: 'dl-512' },
      { materialModelSpecId: 'iphone-mfg-date', value: '2026-06-23' },
    ]);
  });

  it('lọc lựa chọn ngoài subset của mẫu', () => {
    const model = MATERIAL_MODELS_MOCK.find(
      (item) => item.id === 'model-iphone17pro',
    );

    expect(model).toBeDefined();
    const specValues = buildMaterialSpecValues(
      model!,
      [
        { materialModelSpecId: 'iphone-color', value: 'color-red' },
        { materialModelSpecId: 'iphone-storage', value: 'dl-1tb' },
      ],
      SPEC_DEFINITIONS_MOCK,
      SPEC_VALUE_SETS_MOCK,
    );

    expect(specValues).toEqual([]);
  });

  it('lọc danh sách multi theo optionSource subset', () => {
    const model = MATERIAL_MODELS_MOCK.find(
      (item) => item.id === 'model-magnet-pair',
    );

    expect(model).toBeDefined();
    expect(
      buildMaterialSpecValues(
        model!,
        [
          {
            materialModelSpecId: 'magnet-colors',
            value: ['color-blue', 'color-black', 'color-red'],
          },
        ],
        SPEC_DEFINITIONS_MOCK,
        SPEC_VALUE_SETS_MOCK,
      ),
    ).toEqual([
      { materialModelSpecId: 'magnet-colors', value: ['color-blue', 'color-red'] },
    ]);
  });

  it('không báo thiếu thông số bắt buộc nếu định nghĩa có giá trị mặc định', () => {
    const model = MATERIAL_MODELS_MOCK.find(
      (item) => item.id === 'model-iphone17pro',
    );

    expect(model).toBeDefined();
    const missing = validateMaterialSpecValues(
      model!,
      [{ materialModelSpecId: 'iphone-color', value: 'color-black' }],
      SPEC_DEFINITIONS_MOCK,
      SPEC_VALUE_SETS_MOCK,
    );

    expect(missing).toEqual([]);
  });

  it('map group model về group legacy để tương thích Material', () => {
    expect(legacyGroupFromModelGroupId('grp-kiem-ke')).toBe('kiem-ke');
    expect(legacyGroupFromModelGroupId('grp-pccc')).toBe('an-toan');
    expect(legacyGroupFromModelGroupId('grp-phone')).toBe('van-phong');
  });
});
