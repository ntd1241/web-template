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
    allowModelOverride: true,
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
    allowModelOverride: true,
  },
  {
    id: 'spec-date',
    code: 'TS-NGAY',
    name: 'Ngày sản xuất',
    dataType: 'date',
    allowMultiple: false,
    allowDynamicValues: false,
    allowModelOverride: false,
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
      id: 'spec-date',
      source: 'catalog',
      specDefinitionId: 'spec-date',
      materialValueMode: 'editable',
      defaultValue: '2026-01-01',
      isRequired: false,
      sortOrder: 3,
    },
    {
      id: 'spec-weight',
      source: 'catalog',
      specDefinitionId: 'spec-weight',
      materialValueMode: 'locked',
      defaultValue: { amount: 187, unit: 'g' },
      isRequired: true,
      sortOrder: 1,
    },
    {
      id: 'spec-color',
      source: 'catalog',
      specDefinitionId: 'spec-color',
      materialValueMode: 'editable',
      allowedOptions: [
        { id: 'mau-den', label: 'Đen', value: 'den' },
        { id: 'mau-xanh', label: 'Xanh', value: 'xanh' },
      ],
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
    expect(result.map((s) => s.materialModelSpecId)).toEqual([
      'spec-weight',
      'spec-color',
      'spec-date',
    ]);
  });

  it('locked kế thừa defaultValue của mẫu và read-only', () => {
    const weight = resolveEffectiveSpecs(
      model,
      makeMaterial([]),
      definitions,
    )[0];
    expect(weight.value).toEqual({ amount: 187, unit: 'g' });
    expect(weight.isReadOnly).toBe(true);
    expect(weight.source).toBe('model');
  });

  it('editable lấy override nếu có, ngược lại dùng default của mẫu', () => {
    const noOverride = resolveEffectiveSpecs(
      model,
      makeMaterial([]),
      definitions,
    ).find((s) => s.materialModelSpecId === 'spec-date');
    expect(noOverride?.value).toBe('2026-01-01');
    expect(noOverride?.source).toBe('default');

    const withOverride = resolveEffectiveSpecs(
      model,
      makeMaterial([{ materialModelSpecId: 'spec-date', value: '2026-06-20' }]),
      definitions,
    ).find((s) => s.materialModelSpecId === 'spec-date');
    expect(withOverride?.value).toBe('2026-06-20');
    expect(withOverride?.source).toBe('device');
  });

  it('lọc giá trị list ngoài allowedOptions của mẫu', () => {
    const valid = resolveEffectiveSpecs(
      model,
      makeMaterial([{ materialModelSpecId: 'spec-color', value: 'mau-xanh' }]),
      definitions,
    ).find((s) => s.materialModelSpecId === 'spec-color');
    expect(valid?.value).toBe('mau-xanh');
    expect(valid?.isReadOnly).toBe(false);

    const invalid = resolveEffectiveSpecs(
      model,
      makeMaterial([{ materialModelSpecId: 'spec-color', value: 'mau-do' }]),
      definitions,
    ).find((s) => s.materialModelSpecId === 'spec-color');
    expect(invalid?.value).toBeUndefined();
  });

  it('resolve thông số riêng của mẫu không nằm trong danh mục', () => {
    const customModel: MaterialModel = {
      id: 'm-custom',
      code: 'M-CUSTOM',
      name: 'Mẫu riêng',
      groupId: 'g1',
      imageUrls: [],
      specs: [
        {
          id: 'custom-pressure',
          source: 'custom',
          customDefinition: {
            code: 'TS-APSUAT',
            name: 'Áp suất',
            dataType: 'number',
            unit: 'bar',
            allowMultiple: false,
            allowDynamicValues: false,
            defaultValue: { amount: 6, unit: 'bar' },
          },
          materialValueMode: 'editable',
          isRequired: true,
          sortOrder: 1,
        },
      ],
    };

    const result = resolveEffectiveSpecs(
      customModel,
      makeMaterial([
        {
          materialModelSpecId: 'custom-pressure',
          value: { amount: 8, unit: 'bar' },
        },
      ]),
      definitions,
    )[0];

    expect(result.definition?.name).toBe('Áp suất');
    expect(result.value).toEqual({ amount: 8, unit: 'bar' });
  });
});
