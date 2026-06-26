import { describe, expect, it } from 'vitest';
import type { SpecDefinition, SpecOption } from '../model/spec-definition';
import {
  constrainSelectValue,
  formatSpecValue,
  isEmptySpecValue,
  isValidSpecValue,
} from './spec-value';

const options: SpecOption[] = [
  { id: 'mau-den', label: 'Đen', value: 'den' },
  { id: 'mau-xanh', label: 'Xanh', value: 'xanh' },
  { id: 'mau-do', label: 'Đỏ', value: 'do' },
];

const colorDef: SpecDefinition = {
  id: 'spec-color',
  code: 'TS-MAU',
  name: 'Màu sắc',
  dataType: 'list',
  defaultValueSetId: 'vs-color',
  defaultSelectionMode: 'single',
  allowModelSelectionOverride: true,
  allowModelValueSetOverride: true,
};

const weightDef: SpecDefinition = {
  id: 'spec-weight',
  code: 'TS-TL',
  name: 'Trọng lượng',
  dataType: 'number',
  unit: 'g',
  allowModelSelectionOverride: false,
  allowModelValueSetOverride: false,
};

describe('formatSpecValue', () => {
  it('hiển thị label option cho list chọn 1', () => {
    expect(formatSpecValue(colorDef, 'mau-xanh', options, 'single')).toBe('Xanh');
  });

  it('ghép đơn vị cho number, ưu tiên unit của value', () => {
    expect(formatSpecValue(weightDef, { amount: 187 })).toBe('187 g');
    expect(formatSpecValue(weightDef, { amount: 5, unit: 'kg' })).toBe('5 kg');
  });

  it('hiển thị Có/Không cho boolean', () => {
    expect(formatSpecValue({ ...weightDef, dataType: 'boolean' }, true)).toBe('Có');
  });

  it('nối nhiều label cho list chọn nhiều, "—" khi rỗng', () => {
    expect(formatSpecValue(colorDef, ['mau-den', 'mau-do'], options, 'multi')).toBe('Đen, Đỏ');
    expect(formatSpecValue(colorDef, [], options, 'multi')).toBe('—');
  });
});

describe('isValidSpecValue', () => {
  it('number cần amount hợp lệ', () => {
    expect(isValidSpecValue(weightDef, { amount: 1 })).toBe(true);
    expect(isValidSpecValue(weightDef, { amount: Number.NaN })).toBe(false);
    expect(isValidSpecValue(weightDef, 'x' as never)).toBe(false);
  });

  it('list chọn 1 cần string, list chọn nhiều cần mảng', () => {
    expect(isValidSpecValue(colorDef, 'mau-den', 'single')).toBe(true);
    expect(isValidSpecValue(colorDef, ['mau-den'], 'multi')).toBe(true);
    expect(isValidSpecValue(colorDef, 'mau-den', 'multi')).toBe(false);
  });
});

describe('isEmptySpecValue', () => {
  it('nhận diện rỗng đúng theo kiểu', () => {
    expect(isEmptySpecValue(undefined)).toBe(true);
    expect(isEmptySpecValue('')).toBe(true);
    expect(isEmptySpecValue([])).toBe(true);
    expect(isEmptySpecValue({ amount: Number.NaN })).toBe(true);
    expect(isEmptySpecValue('x')).toBe(false);
    expect(isEmptySpecValue(false)).toBe(false);
  });
});

describe('constrainSelectValue', () => {
  it('list chọn 1: loại giá trị ngoài allowed', () => {
    expect(
      constrainSelectValue(colorDef, 'mau-xanh', ['mau-den', 'mau-xanh'], 'single'),
    ).toBe('mau-xanh');
    expect(
      constrainSelectValue(colorDef, 'mau-do', ['mau-den', 'mau-xanh'], 'single'),
    ).toBeUndefined();
  });

  it('list chọn nhiều: chỉ giữ id nằm trong allowed', () => {
    expect(
      constrainSelectValue(colorDef, ['mau-xanh', 'mau-do'], ['mau-xanh'], 'multi'),
    ).toEqual(['mau-xanh']);
  });

  it('kiểu không phải select: giữ nguyên', () => {
    expect(constrainSelectValue({ ...weightDef, dataType: 'text' }, 'abc', undefined)).toBe('abc');
  });
});
