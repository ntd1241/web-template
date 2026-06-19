import { createQueryKeys } from '@/constants/query-keys';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { SupplierListParams } from '../model/supplier';
import { supplierApi } from './supplier.api';

export const supplierKeys = createQueryKeys<SupplierListParams>('suppliers');

export function useSupplierListQuery(params: SupplierListParams) {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => supplierApi.getList(params),
    placeholderData: keepPreviousData,
  });
}
