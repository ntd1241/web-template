import type { OrderItem } from '../model/order';

export const MOCK_ORDER_ITEMS: Record<string, OrderItem[]> = {
  demo: [
    {
      id: 'oi01',
      name: 'Gạo ST25',
      unit: 'Bao',
      quantity: 12,
      unitPrice: 185000,
      note: 'Bao 10kg',
    },
    {
      id: 'oi02',
      name: 'Cà phê rang xay',
      unit: 'Kg',
      quantity: 8,
      unitPrice: 220000,
      note: 'Loại đặc biệt',
    },
    {
      id: 'oi03',
      name: 'Nước mắm Phú Quốc',
      unit: 'Thùng',
      quantity: 5,
      unitPrice: 360000,
      note: '12 chai/thùng',
    },
    {
      id: 'oi04',
      name: 'Trà sen Tây Hồ',
      unit: 'Hộp',
      quantity: 15,
      unitPrice: 95000,
      note: '',
    },
  ],
};
