/**
 * Scaffolded by saved-view-builder from `src/project/contracts/model/contract-saved-view.spec.ts`. Run npm run gen:saved-view — do NOT hand-write this file.
 * This adapter owns persistence normalization for one list resource; page state and query behavior stay in the feature hook.
 */
import type {
  SavedViewConfig,
  TenantSavedView,
} from '@/project/saved-views/model/saved-view';
import type { ColumnOrderState, VisibilityState } from '@tanstack/react-table';
import {
  CONTRACT_LIST_INITIAL_FILTERS,
  CONTRACT_STATUSES,
  type ContractListFilters,
} from './contract';

export const CONTRACT_SAVED_VIEW_RESOURCE = 'contracts' as const;
export const CONTRACT_SAVED_VIEW_MANAGE_PERMISSION = 'system:views:manage';

export type ContractSavedView = TenantSavedView<ContractListFilters>;
export type ContractSavedViewConfig = SavedViewConfig<ContractListFilters>;

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

export function normalizeContractSavedViewConfig(
  value: unknown,
): ContractSavedViewConfig {
  const source = isRecord(value) ? value : {};
  const rawFilters = isRecord(source.filters) ? source.filters : {};

  return {
    version: 1,
    keyword: typeof source.keyword === 'string' ? source.keyword : '',
    filters: {
      ...CONTRACT_LIST_INITIAL_FILTERS,
      status: stringArray(rawFilters.status).filter(
        (item): item is ContractListFilters['status'][number] =>
          CONTRACT_STATUSES.includes(
            item as ContractListFilters['status'][number],
          ),
      ),
      contractSearch:
        typeof rawFilters.contractSearch === 'string'
          ? rawFilters.contractSearch
          : CONTRACT_LIST_INITIAL_FILTERS.contractSearch,
      customerId:
        typeof rawFilters.customerId === 'string'
          ? rawFilters.customerId
          : CONTRACT_LIST_INITIAL_FILTERS.customerId,
      outstandingMin:
        typeof rawFilters.outstandingMin === 'number' &&
        Number.isFinite(rawFilters.outstandingMin)
          ? rawFilters.outstandingMin
          : undefined,
      outstandingMax:
        typeof rawFilters.outstandingMax === 'number' &&
        Number.isFinite(rawFilters.outstandingMax)
          ? rawFilters.outstandingMax
          : undefined,
      nextDueFrom:
        typeof rawFilters.nextDueFrom === 'string'
          ? rawFilters.nextDueFrom
          : CONTRACT_LIST_INITIAL_FILTERS.nextDueFrom,
      nextDueTo:
        typeof rawFilters.nextDueTo === 'string'
          ? rawFilters.nextDueTo
          : CONTRACT_LIST_INITIAL_FILTERS.nextDueTo,
    },
    columnVisibility: booleanRecord(source.columnVisibility),
    columnOrder: stringArray(source.columnOrder) as ColumnOrderState,
  };
}

export function contractSavedViewConfigEquals(
  left: ContractSavedViewConfig,
  right: ContractSavedViewConfig,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
