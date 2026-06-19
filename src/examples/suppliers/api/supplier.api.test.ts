import { describe, expect, it, vi } from 'vitest';
import { MOCK_SUPPLIERS } from '../data/suppliers.mock';
import { supplierApi } from './supplier.api';

vi.mock('@/config/env', () => ({ env: { useMock: true, apiUrl: '/api' } }));

describe('supplierApi.getList (mock)', () => {
  it('phân trang đúng số lượng nhà cung cấp', async () => {
    const res = await supplierApi.getList({ page: 1, pageSize: 4 });

    expect(res.items).toHaveLength(4);
    expect(res.total).toBe(MOCK_SUPPLIERS.length);
    expect(res.page).toBe(1);
    expect(res.pageSize).toBe(4);
  });

  it('lọc theo mã, tên hoặc người liên hệ', async () => {
    const res = await supplierApi.getList({
      page: 1,
      pageSize: 10,
      keyword: 'minh anh',
    });

    expect(res.total).toBe(1);
    expect(res.items[0].code).toBe('NCC-003');
  });
});
