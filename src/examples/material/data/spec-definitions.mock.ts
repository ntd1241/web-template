import type { SpecDefinition } from '../model/spec-definition';

/** Danh mục thông số kỹ thuật mock. */
export const SPEC_DEFINITIONS_MOCK: SpecDefinition[] = [
  {
    id: 'spec-color',
    code: 'TS-MAU',
    name: 'Màu sắc',
    dataType: 'dynamic_list',
    description: 'Màu sắc bên ngoài của thiết bị',
    isActive: true,
  },
  {
    id: 'spec-storage',
    code: 'TS-DUNGLUONG',
    name: 'Dung lượng',
    dataType: 'single_select',
    isActive: true,
    options: [
      { id: 'dl-128', label: '128 GB', value: '128' },
      { id: 'dl-256', label: '256 GB', value: '256' },
      { id: 'dl-512', label: '512 GB', value: '512' },
      { id: 'dl-1tb', label: '1 TB', value: '1024' },
    ],
  },
  {
    id: 'spec-weight',
    code: 'TS-TRONGLUONG',
    name: 'Trọng lượng',
    dataType: 'number',
    unit: 'g',
    isActive: true,
  },
  {
    id: 'spec-screen',
    code: 'TS-MANHINH',
    name: 'Kích thước màn hình',
    dataType: 'number',
    unit: 'inch',
    isActive: true,
  },
  {
    id: 'spec-waterproof',
    code: 'TS-CHONGNUOC',
    name: 'Chống nước',
    dataType: 'boolean',
    isActive: true,
  },
  {
    id: 'spec-mfg-date',
    code: 'TS-NGAYSX',
    name: 'Ngày sản xuất',
    dataType: 'date',
    isActive: true,
  },
  {
    id: 'spec-material',
    code: 'TS-CHATLIEU',
    name: 'Chất liệu',
    dataType: 'text',
    isActive: true,
  },
  {
    id: 'spec-ports',
    code: 'TS-CONGKETNOI',
    name: 'Cổng kết nối',
    dataType: 'multi_select',
    isActive: true,
    options: [
      { id: 'port-usbc', label: 'USB-C', value: 'usb-c' },
      { id: 'port-lightning', label: 'Lightning', value: 'lightning' },
      { id: 'port-jack35', label: 'Jack 3.5mm', value: 'jack-35' },
      { id: 'port-hdmi', label: 'HDMI', value: 'hdmi' },
    ],
  },
];
