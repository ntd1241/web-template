import { describe, expect, it } from 'vitest';
import type { SpecDefinition } from '../model/spec-definition';
import {
  constrainSelectValue,
  formatSpecValue,
  isEmptySpecValue,
  isValidSpecValue,
} from './spec-value';

const colorDef: SpecDefinition = {
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
};

const weightDef: SpecDefinition = {
  id: 'spec-weight',
  code: 'TS-TL',
  name: 'Trọng lượng',
  dataType: 'number',
  unit: 'g',
  allowMultiple: false,
  allowDynamicValues: false,
  allowModelOverride: true,
};

const portsDef: SpecDefinition = {
  id: 'spec-ports',
  code: 'TS-PORT',
  name: 'Cổng',
  dataType: 'list',
  allowMultiple: true,
  allowDynamicValues: false,
  allowModelOverride: true,
  options: [
    { id: 'port-usbc', label: 'USB-C', value: 'usb-c' },
    { id: 'port-hdmi', label: 'HDMI', value: 'hdmi' },
  ],
};

const dynamicColorDef: SpecDefinition = {
  id: 'spec-color-dynamic',
  code: 'TS-MAU-DYNAMIC',
  name: 'Màu sắc linh động',
  dataType: 'list',
  allowMultiple: false,
  allowDynamicValues: true,
  allowModelOverride: true,
};

const iphoneColorOptions = [
  { id: 'iphone-blue-titan', label: 'Xanh Titan', value: 'xanh-titan' },
  {
    id: 'iphone-natural-titan',
    label: 'Titan tự nhiên',
    value: 'titan-tu-nhien',
  },
];

describe('formatSpecValue', () => {
  it('hiển thị label option cho list chọn 1', () => {
    expect(formatSpecValue(colorDef, 'mau-xanh')).toBe('Xanh');
  });

  it('ghép đơn vị cho number, ưu tiên unit của value', () => {
    expect(formatSpecValue(weightDef, { amount: 187 })).toBe('187 g');
    expect(formatSpecValue(weightDef, { amount: 5, unit: 'kg' })).toBe('5 kg');
  });

  it('hiển thị Có/Không cho boolean', () => {
    expect(formatSpecValue({ ...weightDef, dataType: 'boolean' }, true)).toBe(
      'Có',
    );
  });

  it('nối nhiều label cho list chọn nhiều, "—" khi rỗng', () => {
    expect(formatSpecValue(portsDef, ['port-usbc', 'port-hdmi'])).toBe(
      'USB-C, HDMI',
    );
    expect(formatSpecValue(portsDef, [])).toBe('—');
  });

  it('hiển thị label list động từ option riêng của mẫu', () => {
    expect(
      formatSpecValue(dynamicColorDef, 'iphone-blue-titan', iphoneColorOptions),
    ).toBe('Xanh Titan');
  });
});

describe('isValidSpecValue', () => {
  it('number cần amount hợp lệ', () => {
    expect(isValidSpecValue(weightDef, { amount: 1 })).toBe(true);
    expect(isValidSpecValue(weightDef, { amount: Number.NaN })).toBe(false);
    expect(isValidSpecValue(weightDef, 'x' as never)).toBe(false);
  });

  it('list chọn 1 cần string, list chọn nhiều cần mảng', () => {
    expect(isValidSpecValue(colorDef, 'mau-den')).toBe(true);
    expect(isValidSpecValue(portsDef, ['port-usbc'])).toBe(true);
    expect(isValidSpecValue(portsDef, 'port-usbc' as never)).toBe(false);
  });

  it('list động chọn 1 cần string', () => {
    expect(isValidSpecValue(dynamicColorDef, 'iphone-blue-titan')).toBe(true);
    expect(isValidSpecValue(dynamicColorDef, ['iphone-blue-titan'])).toBe(
      false,
    );
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
      constrainSelectValue(colorDef, 'mau-xanh', ['mau-den', 'mau-xanh']),
    ).toBe('mau-xanh');
    expect(
      constrainSelectValue(colorDef, 'mau-do', ['mau-den', 'mau-xanh']),
    ).toBeUndefined();
  });

  it('list chọn nhiều: chỉ giữ id nằm trong allowed', () => {
    expect(
      constrainSelectValue(portsDef, ['port-usbc', 'port-hdmi'], ['port-usbc']),
    ).toEqual(['port-usbc']);
  });

  it('list động: loại giá trị ngoài option riêng của mẫu', () => {
    expect(
      constrainSelectValue(dynamicColorDef, 'iphone-blue-titan', [
        'iphone-blue-titan',
      ]),
    ).toBe('iphone-blue-titan');
    expect(
      constrainSelectValue(dynamicColorDef, 'samsung-violet', [
        'iphone-blue-titan',
      ]),
    ).toBeUndefined();
  });

  it('kiểu không phải select: giữ nguyên', () => {
    expect(
      constrainSelectValue(
        { ...weightDef, dataType: 'text' },
        'abc',
        undefined,
      ),
    ).toBe('abc');
  });
});
