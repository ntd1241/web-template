import type {
  SavedViewConfig,
  TenantSavedView,
} from '@/project/saved-views/model/saved-view';
import type { ColumnOrderState, VisibilityState } from '@tanstack/react-table';
import { z } from 'zod';
import {
  BUSINESS_TYPES,
  CUSTOMER_LIST_INITIAL_FILTERS,
  CUSTOMER_STATUSES,
  type CustomerListFilters,
} from './customer';

export const CUSTOMER_SAVED_VIEW_RESOURCE = 'customers' as const;
export const CUSTOMER_SAVED_VIEW_MANAGE_PERMISSION = 'system:views:manage';

export const customerSavedViewFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Tên chế độ xem không được để trống.')
    .max(80, 'Tên chế độ xem không được vượt quá 80 ký tự.'),
});

export type CustomerSavedViewFormValues = z.infer<
  typeof customerSavedViewFormSchema
>;

export type CustomerSavedView = TenantSavedView<CustomerListFilters>;
export type CustomerSavedViewConfig = SavedViewConfig<CustomerListFilters>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function booleanRecord(value: unknown): VisibilityState {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => typeof item === 'boolean'),
  );
}

export function normalizeCustomerSavedViewConfig(
  value: unknown,
): CustomerSavedViewConfig {
  const source = isRecord(value) ? value : {};
  const rawFilters = isRecord(source.filters) ? source.filters : {};

  return {
    version: 1,
    keyword: typeof source.keyword === 'string' ? source.keyword : '',
    filters: {
      ...CUSTOMER_LIST_INITIAL_FILTERS,
      customerSearch:
        typeof rawFilters.customerSearch === 'string'
          ? rawFilters.customerSearch
          : '',
      businessTypes: stringArray(rawFilters.businessTypes).filter(
        (item): item is CustomerListFilters['businessTypes'][number] =>
          BUSINESS_TYPES.includes(
            item as CustomerListFilters['businessTypes'][number],
          ),
      ),
      contactSearch:
        typeof rawFilters.contactSearch === 'string'
          ? rawFilters.contactSearch
          : '',
      statuses: stringArray(rawFilters.statuses).filter(
        (item): item is CustomerListFilters['statuses'][number] =>
          CUSTOMER_STATUSES.includes(
            item as CustomerListFilters['statuses'][number],
          ),
      ),
      tagIds: stringArray(rawFilters.tagIds),
    },
    columnVisibility: booleanRecord(source.columnVisibility),
    columnOrder: stringArray(source.columnOrder) as ColumnOrderState,
  };
}

export function customerSavedViewConfigEquals(
  left: CustomerSavedViewConfig,
  right: CustomerSavedViewConfig,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
