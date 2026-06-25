import type { SpecValueSet } from '../model/spec-value-set';

export const SPEC_VALUE_SETS_MOCK: SpecValueSet[] = [
  {
    id: 'vs-color-basic',
    code: 'VS-COLOR-BASIC',
    name: 'Bảng màu cơ bản',
    kind: 'color',
    description: 'Màu phổ biến dùng cho thiết bị, phụ kiện và vỏ bảo hộ.',
    isActive: true,
    options: [
      { id: 'color-black', label: 'Đen', value: 'den', colorHex: '#111827' },
      { id: 'color-white', label: 'Trắng', value: 'trang', colorHex: '#f8fafc' },
      { id: 'color-blue', label: 'Xanh', value: 'xanh', colorHex: '#2563eb' },
      { id: 'color-red', label: 'Đỏ', value: 'do', colorHex: '#dc2626' },
      { id: 'color-yellow', label: 'Vàng', value: 'vang', colorHex: '#f59e0b' },
      { id: 'color-clear', label: 'Trong suốt', value: 'trong-suot', colorHex: '#e0f2fe' },
      { id: 'color-smoke', label: 'Xám khói', value: 'xam-khoi', colorHex: '#64748b' },
      { id: 'color-natural-titan', label: 'Titan tự nhiên', value: 'titan-tu-nhien', colorHex: '#a8a29e' },
    ],
  },
  {
    id: 'vs-color-dye',
    code: 'VS-COLOR-DYE',
    name: 'Bảng màu nhuộm',
    kind: 'color',
    description: 'Màu sơn/nhuộm mở rộng cho vỏ, tem nhãn và phụ kiện.',
    isActive: true,
    options: [
      { id: 'dye-graphite', label: 'Graphite', value: 'graphite', colorHex: '#1f2937' },
      { id: 'dye-cobalt', label: 'Cobalt', value: 'cobalt', colorHex: '#1d4ed8' },
      { id: 'dye-olive', label: 'Olive', value: 'olive', colorHex: '#4d7c0f' },
      { id: 'dye-copper', label: 'Copper', value: 'copper', colorHex: '#b45309' },
      { id: 'dye-rose', label: 'Rose', value: 'rose', colorHex: '#e11d48' },
    ],
  },
  {
    id: 'vs-storage',
    code: 'VS-STORAGE',
    name: 'Dung lượng lưu trữ',
    kind: 'generic',
    isActive: true,
    options: [
      { id: 'dl-128', label: '128 GB', value: '128' },
      { id: 'dl-256', label: '256 GB', value: '256' },
      { id: 'dl-512', label: '512 GB', value: '512' },
      { id: 'dl-1tb', label: '1 TB', value: '1024' },
    ],
  },
  {
    id: 'vs-ports',
    code: 'VS-PORTS',
    name: 'Cổng kết nối',
    kind: 'generic',
    isActive: true,
    options: [
      { id: 'port-usbc', label: 'USB-C', value: 'usb-c' },
      { id: 'port-lightning', label: 'Lightning', value: 'lightning' },
      { id: 'port-jack35', label: 'Jack 3.5mm', value: 'jack-35' },
      { id: 'port-hdmi', label: 'HDMI', value: 'hdmi' },
    ],
  },
];
