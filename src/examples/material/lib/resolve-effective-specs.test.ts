import { describe, expect, it } from 'vitest';
import type { Material } from '../model/material';
import type { MaterialModel } from '../model/material-model';
import type { SpecDefinition } from '../model/spec-definition';
import type { SpecValueSet } from '../model/spec-value-set';
import {
  resolveEffectiveOptions,
  resolveEffectiveSpecs,
} from './resolve-effective-specs';

const valueSets: SpecValueSet[] = [
  {
    id: 'vs-basic',
    code: 'VS-BASIC',
    name: 'Bảng màu cơ bản',
    kind: 'color',
    isActive: true,
    options: [
      { id: 'black', label: 'Đen', value: 'black' },
      { id: 'white', label: 'Trắng', value: 'white' },
      { id: 'clear', label: 'Trong', value: 'clear' },
      { id: 'smoke', label: 'Khói', value: 'smoke' },
      { id: 'red', label: 'Đỏ', value: 'red' },
    ],
  },
  {
    id: 'vs-dye',
    code: 'VS-DYE',
    name: 'Bảng màu nhuộm',
    kind: 'color',
    isActive: true,
    options: [
      { id: 'dye-cobalt', label: 'Cobalt', value: 'cobalt' },
      { id: 'dye-rose', label: 'Rose', value: 'rose' },
    ],
  },
];

const definitions: SpecDefinition[] = [
  {
    id: 'spec-color',
    code: 'TS-MAU',
    name: 'Màu sắc',
    dataType: 'list',
    defaultValueSetId: 'vs-basic',
    defaultSelectionMode: 'single',
    allowModelSelectionOverride: true,
    allowModelValueSetOverride: true,
  },
  {
    id: 'spec-color-fixed',
    code: 'TS-MAU-FIXED',
    name: 'Màu cố định',
    dataType: 'list',
    defaultValueSetId: 'vs-basic',
    defaultSelectionMode: 'single',
    allowModelSelectionOverride: false,
    allowModelValueSetOverride: false,
  },
  {
    id: 'spec-weight',
    code: 'TS-TL',
    name: 'Trọng lượng',
    dataType: 'number',
    unit: 'g',
    allowModelSelectionOverride: false,
    allowModelValueSetOverride: false,
  },
];

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
  it('cho phép cùng specDefinitionId xuất hiện nhiều lần trên một model', () => {
    const model: MaterialModel = {
      id: 'm1',
      code: 'M1',
      name: 'Kính hai màu',
      groupId: 'g1',
      imageUrls: [],
      specs: [
        {
          id: 'color-glass',
          source: 'catalog',
          specDefinitionId: 'spec-color',
          labelOverride: 'Màu kính',
          partKey: 'glass',
          optionSource: { mode: 'subset', optionIds: ['clear', 'smoke'] },
          materialValueMode: 'editable',
          isRequired: true,
          sortOrder: 2,
        },
        {
          id: 'color-shell',
          source: 'catalog',
          specDefinitionId: 'spec-color',
          labelOverride: 'Màu vỏ',
          partKey: 'shell',
          optionSource: { mode: 'subset', optionIds: ['black', 'white'] },
          materialValueMode: 'editable',
          isRequired: true,
          sortOrder: 1,
        },
      ],
    };

    const result = resolveEffectiveSpecs(model, makeMaterial([]), definitions, valueSets);

    expect(result.map((spec) => spec.materialModelSpecId)).toEqual([
      'color-shell',
      'color-glass',
    ]);
    expect(result.map((spec) => spec.label)).toEqual(['Màu vỏ', 'Màu kính']);
    expect(result.map((spec) => spec.options?.map((option) => option.id))).toEqual([
      ['black', 'white'],
      ['clear', 'smoke'],
    ]);
  });

  it('enforce gate single -> multi: allowed áp dụng, disallowed bị bỏ qua', () => {
    const allowedModel: MaterialModel = {
      id: 'm-allowed',
      code: 'M-ALLOWED',
      name: 'Nam châm',
      groupId: 'g1',
      imageUrls: [],
      specs: [
        {
          id: 'allowed',
          source: 'catalog',
          specDefinitionId: 'spec-color',
          selectionModeOverride: 'multi',
          materialValueMode: 'editable',
          isRequired: false,
          sortOrder: 1,
        },
        {
          id: 'blocked',
          source: 'catalog',
          specDefinitionId: 'spec-color-fixed',
          selectionModeOverride: 'multi',
          materialValueMode: 'editable',
          isRequired: false,
          sortOrder: 2,
        },
      ],
    };

    const result = resolveEffectiveSpecs(
      allowedModel,
      makeMaterial([
        { materialModelSpecId: 'allowed', value: ['black', 'red'] },
        { materialModelSpecId: 'blocked', value: ['black', 'red'] },
      ]),
      definitions,
      valueSets,
    );

    expect(result.find((spec) => spec.materialModelSpecId === 'allowed')?.selectionMode).toBe('multi');
    expect(result.find((spec) => spec.materialModelSpecId === 'allowed')?.value).toEqual(['black', 'red']);
    expect(result.find((spec) => spec.materialModelSpecId === 'blocked')?.selectionMode).toBe('single');
    expect(result.find((spec) => spec.materialModelSpecId === 'blocked')?.value).toBeUndefined();
  });

  it('áp dụng inherit/subset trên value set mặc định và value set override', () => {
    const definition = definitions[0];
    const inheritSpec = {
      id: 'inherit',
      source: 'catalog' as const,
      specDefinitionId: 'spec-color',
      optionSource: { mode: 'inherit' as const },
      materialValueMode: 'editable' as const,
      isRequired: false,
      sortOrder: 1,
    };
    const subsetSpec = {
      ...inheritSpec,
      id: 'subset',
      optionSource: { mode: 'subset' as const, optionIds: ['black'] },
    };
    const overrideSubsetSpec = {
      ...inheritSpec,
      id: 'override-subset',
      valueSetIdOverride: 'vs-dye',
      optionSource: { mode: 'subset' as const, optionIds: ['dye-rose'] },
    };

    expect(
      resolveEffectiveOptions(inheritSpec, definition, valueSets)?.map((option) => option.id),
    ).toEqual(['black', 'white', 'clear', 'smoke', 'red']);
    expect(
      resolveEffectiveOptions(subsetSpec, definition, valueSets)?.map((option) => option.id),
    ).toEqual(['black']);
    expect(
      resolveEffectiveOptions(overrideSubsetSpec, definition, valueSets)?.map((option) => option.id),
    ).toEqual(['dye-rose']);
  });

  it('bỏ qua valueSetIdOverride và subset khi gate không cho phép', () => {
    const definition = definitions[1];
    const spec = {
      id: 'blocked',
      source: 'catalog' as const,
      specDefinitionId: 'spec-color-fixed',
      valueSetIdOverride: 'vs-dye',
      optionSource: { mode: 'subset' as const, optionIds: ['dye-rose'] },
      materialValueMode: 'editable' as const,
      isRequired: false,
      sortOrder: 1,
    };

    expect(resolveEffectiveOptions(spec, definition, valueSets)?.map((option) => option.id)).toEqual([
      'black',
      'white',
      'clear',
      'smoke',
      'red',
    ]);
  });

  it('lọc value thiết bị không hợp lệ cho single và multi', () => {
    const model: MaterialModel = {
      id: 'm-filter',
      code: 'M-FILTER',
      name: 'Filter',
      groupId: 'g1',
      imageUrls: [],
      specs: [
        {
          id: 'single',
          source: 'catalog',
          specDefinitionId: 'spec-color',
          optionSource: { mode: 'subset', optionIds: ['black'] },
          materialValueMode: 'editable',
          isRequired: false,
          sortOrder: 1,
        },
        {
          id: 'multi',
          source: 'catalog',
          specDefinitionId: 'spec-color',
          selectionModeOverride: 'multi',
          optionSource: { mode: 'subset', optionIds: ['black'] },
          materialValueMode: 'editable',
          isRequired: false,
          sortOrder: 2,
        },
      ],
    };

    const result = resolveEffectiveSpecs(
      model,
      makeMaterial([
        { materialModelSpecId: 'single', value: 'red' },
        { materialModelSpecId: 'multi', value: ['black', 'red'] },
      ]),
      definitions,
      valueSets,
    );

    expect(result.find((spec) => spec.materialModelSpecId === 'single')?.value).toBeUndefined();
    expect(result.find((spec) => spec.materialModelSpecId === 'multi')?.value).toEqual(['black']);
  });
});
