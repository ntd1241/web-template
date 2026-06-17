import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MOCK_EMPLOYEES } from '../data/employees.mock';
import { employeeApi } from './employee.api';

// Ép chế độ mock cho test, độc lập với .env.
vi.mock('@/config/env', () => ({ env: { useMock: true, apiUrl: '/api' } }));

describe('employeeApi.getList (mock)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('phân trang đúng số lượng', async () => {
    const res = await employeeApi.getList({ page: 1, pageSize: 5 });
    expect(res.items).toHaveLength(5);
    expect(res.total).toBe(MOCK_EMPLOYEES.length);
    expect(res.page).toBe(1);
  });

  it('lọc theo từ khóa tên/username', async () => {
    const res = await employeeApi.getList({
      page: 1,
      pageSize: 10,
      keyword: 'tranthanhhuy',
    });
    expect(res.total).toBe(1);
    expect(res.items[0].username).toBe('tranthanhhuy');
  });
});
