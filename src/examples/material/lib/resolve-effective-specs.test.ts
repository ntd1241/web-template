import { describe, expect, it } from 'vitest';
import type { Material } from '../model/material';
import type { MaterialModel } from '../model/material-model';
import type { SpecDefinition } from '../model/spec-definition';
import { resolveEffectiveSpecs } from './resolve-effective-specs';

const definitions: SpecDefinition[] = [
  {
    id: 'spec-color',
    code: 'TS-MAU',
    name: 'Màu sắc',
    dataType: 'list',
    allowMultiple: false,
    allowDynamicValues: false,
    options: [
      { id: 'mau-den', label: 'Đen', value: 'den' },
      { id: 'mau-xanh', label: 'Xanh', value: 'xanh' },
      { id: 'mau-do', label: 'Đỏ', value: 'do' },
    ],
  },
  {
    id: 'spec-weight',
    code: 'TS-TL',
    name: 'Trọng lượng',
    dataType: 'number',
    unit: 'g',
    allowMultiple: false,
    allowDynamicValues: false,
  },
  {
    id: 'spec-date',
    code: 'TS-NGAY',
    name: 'Ngày sản xuất',
    dataType: 'date',
    allowMultiple: false,
    allowDynamicValues: false,
  },
];

const model: MaterialModel = {
  id: 'm1',
  code: 'M1',
  name: 'Mẫu test',
  groupId: 'g1',
  imageUrls: [],
  specs: [
    {
      specDefinitionId: 'spec-date',
      deviceMode: 'input',
      modelValue: '2026-01-01',
      isRequired: false,
      sortOrder: 3,
    },
    {
      specDefinitionId: 'spec-weight',
      deviceMode: 'fixed',
      modelValue: { amount: 187, unit: 'g' },
      isRequired: true,
      sortOrder: 1,
    },
    {
      specDefinitionId: 'spec-color',
      deviceMode: 'select',
      allowedOptionIds: ['mau-den', 'mau-xanh'],
      isRequired: true,
      sortOrder: 2,
    },
  ],
};

function makeMaterial(specValues: Material['specValues']): Material {
  return {
    id: 'd1',
    name: 'Thiết bị',
    code: 'TB1',
    imageUrl: '',
    group: 'kiem-ke',
    modelId: 'm1',
    specValues,
    tags: [],
  };
}

describe('resolveEffectiveSpecs', () => {
  it('sắp xếp theo sortOrder', () => {
    const result = resolveEffectiveSpecs(model, makeMaterial([]), definitions);
    expect(result.map((s) => s.specDefinitionId)).toEqual([
      'spec-weight',
      'spec-color',
      'spec-date',
    ]);
  });

  it('fixed kế thừa modelValue và read-only', () => {
    const weight = resolveEffectiveSpecs(
      model,
      makeMaterial([]),
      definitions,
    )[0];
    expect(weight.value).toEqual({ amount: 187, unit: 'g' });
    expect(weight.isReadOnly).toBe(true);
    expect(weight.source).toBe('model');
  });

  it('input lấy override nếu có, ngược lại dùng default của mẫu', () => {
    const noOverride = resolveEffectiveSpecs(
      model,
      makeMaterial([]),
      definitions,
    ).find((s) => s.specDefinitionId === 'spec-date');
    expect(noOverride?.value).toBe('2026-01-01');
    expect(noOverride?.source).toBe('default');

    const withOverride = resolveEffectiveSpecs(
      model,
      makeMaterial([{ specDefinitionId: 'spec-date', value: '2026-06-20' }]),
      definitions,
    ).find((s) => s.specDefinitionId === 'spec-date');
    expect(withOverride?.value).toBe('2026-06-20');
    expect(withOverride?.source).toBe('device');
  });

  it('select giữ giá trị trong allowed, loại giá trị ngoài allowed', () => {
    const valid = resolveEffectiveSpecs(
      model,
      makeMaterial([{ specDefinitionId: 'spec-color', value: 'mau-xanh' }]),
      definitions,
    ).find((s) => s.specDefinitionId === 'spec-color');
    expect(valid?.value).toBe('mau-xanh');
    expect(valid?.isReadOnly).toBe(false);

    const invalid = resolveEffectiveSpecs(
      model,
      makeMaterial([{ specDefinitionId: 'spec-color', value: 'mau-do' }]),
      definitions,
    ).find((s) => s.specDefinitionId === 'spec-color');
    expect(invalid?.value).toBeUndefined();
  });

  it('list động dùng dynamicOptions của mẫu để lọc giá trị thiết bị', () => {
    const dynamicDefinitions: SpecDefinition[] = [
      {
        id: 'spec-color',
        code: 'TS-MAU',
        name: 'Màu sắc',
        dataType: 'list',
        allowMultiple: false,
        allowDynamicValues: true,
      },
    ];
    const dynamicModel: MaterialModel = {
      id: 'm-dynamic',
      code: 'M-DYN',
      name: 'Mẫu dynamic',
      groupId: 'g1',
      imageUrls: [],
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
    };

    const valid = resolveEffectiveSpecs(
      dynamicModel,
      makeMaterial([
        { specDefinitionId: 'spec-color', value: 'iphone-blue-titan' },
      ]),
      dynamicDefinitions,
    )[0];
    expect(valid.value).toBe('iphone-blue-titan');

    const invalid = resolveEffectiveSpecs(
      dynamicModel,
      makeMaterial([
        { specDefinitionId: 'spec-color', value: 'samsung-violet' },
      ]),
      dynamicDefinitions,
    )[0];
    expect(invalid.value).toBeUndefined();
  });
});
