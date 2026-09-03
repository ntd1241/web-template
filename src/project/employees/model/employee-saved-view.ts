/**
 * Scaffolded by saved-view-builder from `src/project/employees/model/employee-saved-view.spec.ts`. Run npm run gen:saved-view — do NOT hand-write this file.
 * This adapter owns persistence normalization for one list resource; page state and query behavior stay in the feature hook.
 */
import type {
  SavedViewConfig,
  TenantSavedView,
} from '@/project/saved-views/model/saved-view';
import type { ColumnOrderState, VisibilityState } from '@tanstack/react-table';
import {
  EMPLOYEE_LIST_INITIAL_FILTERS,
  EMPLOYEE_STATUSES,
  type EmployeeListFilters,
} from './employee';

export const EMPLOYEE_SAVED_VIEW_RESOURCE = 'employees' as const;
export const EMPLOYEE_SAVED_VIEW_MANAGE_PERMISSION = 'system:views:manage';

export type EmployeeSavedView = TenantSavedView<EmployeeListFilters>;
export type EmployeeSavedViewConfig = SavedViewConfig<EmployeeListFilters>;

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

export function normalizeEmployeeSavedViewConfig(
  value: unknown,
): EmployeeSavedViewConfig {
  const source = isRecord(value) ? value : {};
  const rawFilters = isRecord(source.filters) ? source.filters : {};

  return {
    version: 1,
    keyword: typeof source.keyword === 'string' ? source.keyword : '',
    filters: {
      ...EMPLOYEE_LIST_INITIAL_FILTERS,
      statuses: stringArray(rawFilters.statuses).filter(
        (item): item is EmployeeListFilters['statuses'][number] =>
          EMPLOYEE_STATUSES.includes(
            item as EmployeeListFilters['statuses'][number],
          ),
      ),
      roleIds: stringArray(rawFilters.roleIds),
      accountLinked:
        typeof rawFilters.accountLinked === 'string' &&
        ['all', 'linked', 'unlinked'].includes(rawFilters.accountLinked)
          ? (rawFilters.accountLinked as EmployeeListFilters['accountLinked'])
          : EMPLOYEE_LIST_INITIAL_FILTERS.accountLinked,
      tagIds: stringArray(rawFilters.tagIds),
    },
    columnVisibility: booleanRecord(source.columnVisibility),
    columnOrder: stringArray(source.columnOrder) as ColumnOrderState,
  };
}

export function employeeSavedViewConfigEquals(
  left: EmployeeSavedViewConfig,
  right: EmployeeSavedViewConfig,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
