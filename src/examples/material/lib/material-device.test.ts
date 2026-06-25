import { describe, expect, it } from 'vitest';
import { MATERIAL_MODELS_MOCK } from '../data/material-models.mock';
import { SPEC_DEFINITIONS_MOCK } from '../data/spec-definitions.mock';
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
        { materialModelSpecId: 'spec-color', value: 'iphone-blue-titan' },
        { materialModelSpecId: 'spec-storage', value: 'dl-512' },
        {
          materialModelSpecId: 'spec-weight',
          value: { amount: 200, unit: 'g' },
        },
        { materialModelSpecId: 'spec-mfg-date', value: '2026-06-23' },
      ],
      SPEC_DEFINITIONS_MOCK,
    );

    expect(specValues).toEqual([
      { materialModelSpecId: 'spec-color', value: 'iphone-blue-titan' },
      { materialModelSpecId: 'spec-storage', value: 'dl-512' },
      { materialModelSpecId: 'spec-mfg-date', value: '2026-06-23' },
    ]);
  });

  it('lọc lựa chọn ngoài allowedOptions của mẫu', () => {
    const model = MATERIAL_MODELS_MOCK.find(
      (item) => item.id === 'model-iphone17pro',
    );

    expect(model).toBeDefined();
    const specValues = buildMaterialSpecValues(
      model!,
      [
        { materialModelSpecId: 'spec-color', value: 'helmet-yellow' },
        { materialModelSpecId: 'spec-storage', value: 'dl-1tb' },
      ],
      SPEC_DEFINITIONS_MOCK,
    );

    expect(specValues).toEqual([]);
  });

  it('lọc danh sách riêng của mẫu theo allowedOptions', () => {
    const model = {
      id: 'model-dynamic-color',
      code: 'MDL-DYNAMIC',
      name: 'Điện thoại nhiều màu',
      groupId: 'grp-phone',
      imageUrls: [],
      specs: [
        {
          id: 'spec-color',
          source: 'catalog',
          specDefinitionId: 'spec-color',
          materialValueMode: 'editable',
          allowedOptions: [
            {
              id: 'iphone-blue-titan',
              label: 'Xanh Titan',
              value: 'xanh-titan',
            },
          ],
          isRequired: true,
          sortOrder: 1,
        },
      ],
    } satisfies (typeof MATERIAL_MODELS_MOCK)[number];
    const definitions = [
      {
        id: 'spec-color',
        code: 'TS-MAU',
        name: 'Màu sắc',
        dataType: 'list',
        allowMultiple: false,
        allowDynamicValues: true,
        allowModelOverride: true,
      },
    ] satisfies typeof SPEC_DEFINITIONS_MOCK;

    expect(
      buildMaterialSpecValues(
        model,
        [{ materialModelSpecId: 'spec-color', value: 'iphone-blue-titan' }],
        definitions,
      ),
    ).toEqual([
      { materialModelSpecId: 'spec-color', value: 'iphone-blue-titan' },
    ]);

    expect(
      buildMaterialSpecValues(
        model,
        [{ materialModelSpecId: 'spec-color', value: 'samsung-violet' }],
        definitions,
      ),
    ).toEqual([]);
  });

  it('không báo thiếu thông số bắt buộc nếu định nghĩa có giá trị mặc định', () => {
    const model = MATERIAL_MODELS_MOCK.find(
      (item) => item.id === 'model-iphone17pro',
    );

    expect(model).toBeDefined();
    const missing = validateMaterialSpecValues(
      model!,
      [{ materialModelSpecId: 'spec-color', value: 'iphone-black-titan' }],
      SPEC_DEFINITIONS_MOCK,
    );

    expect(missing).toEqual([]);
  });

  it('map group model về group legacy để tương thích Material', () => {
    expect(legacyGroupFromModelGroupId('grp-kiem-ke')).toBe('kiem-ke');
    expect(legacyGroupFromModelGroupId('grp-pccc')).toBe('an-toan');
    expect(legacyGroupFromModelGroupId('grp-phone')).toBe('van-phong');
  });
});
