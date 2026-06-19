import { mockResponse } from '@/mocks/mock-response';
import type { PaginatedResponse } from '@/types/api.types';
import { env } from '@/config/env';
import { api } from '@/lib/axios';
import { searchMatch } from '@/lib/search';
import { MOCK_SUPPLIERS } from '../data/suppliers.mock';
import type { Supplier, SupplierListParams } from '../model/supplier';

const BASE = '/suppliers';

function filterMock(params: SupplierListParams): PaginatedResponse<Supplier> {
  const keyword = params.keyword?.trim() ?? '';
  const matched = keyword
    ? MOCK_SUPPLIERS.filter(
        (supplier) =>
          searchMatch(supplier.code, keyword) ||
          searchMatch(supplier.name, keyword) ||
          searchMatch(supplier.contact, keyword) ||
          searchMatch(supplier.phone, keyword),
      )
    : MOCK_SUPPLIERS;

  const start = (params.page - 1) * params.pageSize;
  const items = matched.slice(start, start + params.pageSize);

  return {
    items,
    total: matched.length,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export const supplierApi = {
  getList(params: SupplierListParams): Promise<PaginatedResponse<Supplier>> {
    if (env.useMock) return mockResponse(filterMock(params), 250);
    return api.get(BASE, { params });
  },
};
