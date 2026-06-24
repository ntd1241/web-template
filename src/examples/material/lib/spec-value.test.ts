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
  dataType: 'single_select',
  isActive: true,
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
  isActive: true,
};

const portsDef: SpecDefinition = {
  id: 'spec-ports',
  code: 'TS-PORT',
  name: 'Cổng',
  dataType: 'multi_select',
  isActive: true,
  options: [
    { id: 'port-usbc', label: 'USB-C', value: 'usb-c' },
    { id: 'port-hdmi', label: 'HDMI', value: 'hdmi' },
  ],
};

const dynamicColorDef: SpecDefinition = {
  id: 'spec-color-dynamic',
  code: 'TS-MAU-DYNAMIC',
  name: 'Màu sắc linh động',
  dataType: 'dynamic_list',
  isActive: true,
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
  it('hiển thị label option cho single_select', () => {
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

  it('nối nhiều label cho multi_select, "—" khi rỗng', () => {
    expect(formatSpecValue(portsDef, ['port-usbc', 'port-hdmi'])).toBe(
      'USB-C, HDMI',
    );
    expect(formatSpecValue(portsDef, [])).toBe('—');
  });

  it('hiển thị label dynamic_list từ option riêng của mẫu', () => {
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

  it('single_select cần string, multi_select cần mảng', () => {
    expect(isValidSpecValue(colorDef, 'mau-den')).toBe(true);
    expect(isValidSpecValue(portsDef, ['port-usbc'])).toBe(true);
    expect(isValidSpecValue(portsDef, 'port-usbc' as never)).toBe(false);
  });

  it('dynamic_list cần string', () => {
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
  it('single_select: loại giá trị ngoài allowed', () => {
    expect(
      constrainSelectValue('single_select', 'mau-xanh', [
        'mau-den',
        'mau-xanh',
      ]),
    ).toBe('mau-xanh');
    expect(
      constrainSelectValue('single_select', 'mau-do', ['mau-den', 'mau-xanh']),
    ).toBeUndefined();
  });

  it('multi_select: chỉ giữ id nằm trong allowed', () => {
    expect(
      constrainSelectValue(
        'multi_select',
        ['port-usbc', 'port-hdmi'],
        ['port-usbc'],
      ),
    ).toEqual(['port-usbc']);
  });

  it('dynamic_list: loại giá trị ngoài option riêng của mẫu', () => {
    expect(
      constrainSelectValue('dynamic_list', 'iphone-blue-titan', [
        'iphone-blue-titan',
      ]),
    ).toBe('iphone-blue-titan');
    expect(
      constrainSelectValue('dynamic_list', 'samsung-violet', [
        'iphone-blue-titan',
      ]),
    ).toBeUndefined();
  });

  it('kiểu không phải select: giữ nguyên', () => {
    expect(constrainSelectValue('text', 'abc', undefined)).toBe('abc');
  });
});
