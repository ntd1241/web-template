import { mockResponse } from '@/mocks/mock-response';
import type { PaginatedResponse } from '@/types/api.types';
import { env } from '@/config/env';
import { api } from '@/lib/axios';
import { MOCK_EMPLOYEES } from '../data/employees.mock';
import type { Employee, EmployeeListParams } from '../model/employee';

const BASE = '/employees';

function filterMock(params: EmployeeListParams): PaginatedResponse<Employee> {
  const keyword = params.keyword?.trim().toLowerCase() ?? '';
  const matched = keyword
    ? MOCK_EMPLOYEES.filter(
        (e) =>
          e.name.toLowerCase().includes(keyword) ||
          e.username.toLowerCase().includes(keyword),
      )
    : MOCK_EMPLOYEES;

  const start = (params.page - 1) * params.pageSize;
  const items = matched.slice(start, start + params.pageSize);

  return {
    items,
    total: matched.length,
    page: params.page,
    pageSize: params.pageSize,
  };
}

/**
 * API nhân viên — mock-first. Khi `env.useMock` bật, trả mock; ngược lại gọi REST thật.
 * Đây là chỗ DUY NHẤT chạm tới network cho domain này (docs/00 §3).
 */
export const employeeApi = {
  getList(params: EmployeeListParams): Promise<PaginatedResponse<Employee>> {
    if (env.useMock) return mockResponse(filterMock(params));
    return api.get(BASE, { params });
  },

  setStatus(id: string, status: Employee['status']): Promise<Employee> {
    if (env.useMock) {
      const found = MOCK_EMPLOYEES.find((e) => e.id === id);
      return mockResponse({ ...(found as Employee), status }, 250);
    }
    return api.patch(`${BASE}/${id}/status`, { status });
  },
};
