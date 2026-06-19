import type { Material } from '../model/material';

/** Mock-first material list for the management table pilot. */
export const MATERIALS_MOCK: Material[] = [
  {
    id: '601af811-5def-4bd0-b8d3-8429dece65a7',
    name: 'Máy kiểm kê QR S-24',
    code: 'TB-QR-000601',
    imageUrl: '',
    group: 'kiem-ke',
    tags: ['QR', 'Kho trung tâm', 'Đang dùng'],
  },
  {
    id: 'a2c1f0d2-1111-4a2b-9c3d-2b6f4e5a7c01',
    name: 'Máy in nhiệt tem nhãn',
    code: 'VP-IN-000218',
    imageUrl: '',
    group: 'van-phong',
    tags: ['Tem nhãn', 'Tầng 2'],
  },
  {
    id: 'b3d2e1c3-2222-4b3c-8d4e-3c7f5e6b8d02',
    name: 'Mũ bảo hộ lao động',
    code: 'AT-BH-000045',
    imageUrl: '',
    group: 'an-toan',
    tags: ['Bảo hộ', 'Cấp phát'],
  },
  {
    id: 'c4e3f2d4-3333-4c4d-9e5f-4d8a6f7c9e03',
    name: 'Máy khoan cầm tay Bosch',
    code: 'CC-KH-000732',
    imageUrl: '',
    group: 'cong-cu',
    tags: ['Điện cầm tay', 'Bảo trì'],
  },
  {
    id: 'd5f4a3e5-4444-4d5e-8f6a-5e9b7a8d0f04',
    name: 'Cân điện tử kiểm kê 50kg',
    code: 'TB-CA-000118',
    imageUrl: '',
    group: 'kiem-ke',
    tags: ['Cân', 'Kho B'],
  },
  {
    id: 'e6a5b4f6-5555-4e6f-9a7b-6f0c8b9e1a05',
    name: 'Bình chữa cháy CO2 5kg',
    code: 'AT-PCCC-000077',
    imageUrl: '',
    group: 'an-toan',
    tags: ['PCCC', 'Định kỳ'],
  },
];
