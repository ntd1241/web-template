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
        { specDefinitionId: 'spec-color', value: 'iphone-blue-titan' },
        { specDefinitionId: 'spec-storage', value: 'dl-512' },
        { specDefinitionId: 'spec-weight', value: { amount: 200, unit: 'g' } },
        { specDefinitionId: 'spec-mfg-date', value: '2026-06-23' },
      ],
      SPEC_DEFINITIONS_MOCK,
    );

    expect(specValues).toEqual([
      { specDefinitionId: 'spec-color', value: 'iphone-blue-titan' },
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
        { specDefinitionId: 'spec-color', value: 'helmet-yellow' },
        { specDefinitionId: 'spec-storage', value: 'dl-1tb' },
      ],
      SPEC_DEFINITIONS_MOCK,
    );

    expect(specValues).toEqual([]);
  });

  it('lọc dynamic_list theo dynamicOptions riêng của mẫu', () => {
    const model = {
      id: 'model-dynamic-color',
      code: 'MDL-DYNAMIC',
      name: 'Điện thoại nhiều màu',
      groupId: 'grp-phone',
      imageUrls: [],
      isActive: true,
      specs: [
        {
          specDefinitionId: 'spec-color',
          deviceMode: 'select',
          dynamicOptions: [
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
        dataType: 'dynamic_list',
        isActive: true,
      },
    ] satisfies typeof SPEC_DEFINITIONS_MOCK;

    expect(
      buildMaterialSpecValues(
        model,
        [{ specDefinitionId: 'spec-color', value: 'iphone-blue-titan' }],
        definitions,
      ),
    ).toEqual([{ specDefinitionId: 'spec-color', value: 'iphone-blue-titan' }]);

    expect(
      buildMaterialSpecValues(
        model,
        [{ specDefinitionId: 'spec-color', value: 'samsung-violet' }],
        definitions,
      ),
    ).toEqual([]);
  });

  it('báo thiếu thông số bắt buộc của thiết bị', () => {
    const model = MATERIAL_MODELS_MOCK.find(
      (item) => item.id === 'model-iphone17pro',
    );

    expect(model).toBeDefined();
    const missing = validateMaterialSpecValues(
      model!,
      [{ specDefinitionId: 'spec-color', value: 'iphone-black-titan' }],
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
