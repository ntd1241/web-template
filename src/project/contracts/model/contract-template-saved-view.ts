/**
 * Scaffolded by saved-view-builder from `src/project/contracts/model/contract-template-saved-view.spec.ts`. Run npm run gen:saved-view — do NOT hand-write this file.
 * This adapter owns persistence normalization for one list resource; page state and query behavior stay in the feature hook.
 */
import type {
  SavedViewConfig,
  TenantSavedView,
} from '@/project/saved-views/model/saved-view';
import type { ColumnOrderState, VisibilityState } from '@tanstack/react-table';
import {
  CONTRACT_TEMPLATE_LIST_INITIAL_FILTERS,
  CONTRACT_TEMPLATE_STATUSES,
  type ContractTemplateListFilters,
} from './contract-template';

export const CONTRACT_TEMPLATE_SAVED_VIEW_RESOURCE =
  'contract_templates' as const;
export const CONTRACT_TEMPLATE_SAVED_VIEW_MANAGE_PERMISSION =
  'system:views:manage';

export type ContractTemplateSavedView =
  TenantSavedView<ContractTemplateListFilters>;
export type ContractTemplateSavedViewConfig =
  SavedViewConfig<ContractTemplateListFilters>;

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

export function normalizeContractTemplateSavedViewConfig(
  value: unknown,
): ContractTemplateSavedViewConfig {
  const source = isRecord(value) ? value : {};
  const rawFilters = isRecord(source.filters) ? source.filters : {};

  return {
    version: 1,
    keyword: typeof source.keyword === 'string' ? source.keyword : '',
    filters: {
      ...CONTRACT_TEMPLATE_LIST_INITIAL_FILTERS,
      templateSearch:
        typeof rawFilters.templateSearch === 'string'
          ? rawFilters.templateSearch
          : CONTRACT_TEMPLATE_LIST_INITIAL_FILTERS.templateSearch,
      status:
        typeof rawFilters.status === 'string' &&
        ['all', 'draft', 'published', 'archived'].includes(rawFilters.status)
          ? (rawFilters.status as ContractTemplateListFilters['status'])
          : CONTRACT_TEMPLATE_LIST_INITIAL_FILTERS.status,
      statuses: stringArray(rawFilters.statuses).filter(
        (item): item is ContractTemplateListFilters['statuses'][number] =>
          CONTRACT_TEMPLATE_STATUSES.includes(
            item as ContractTemplateListFilters['statuses'][number],
          ),
      ),
      tagIds: stringArray(rawFilters.tagIds),
      lineCountMin:
        typeof rawFilters.lineCountMin === 'number' &&
        Number.isFinite(rawFilters.lineCountMin)
          ? rawFilters.lineCountMin
          : undefined,
      lineCountMax:
        typeof rawFilters.lineCountMax === 'number' &&
        Number.isFinite(rawFilters.lineCountMax)
          ? rawFilters.lineCountMax
          : undefined,
      contractCountMin:
        typeof rawFilters.contractCountMin === 'number' &&
        Number.isFinite(rawFilters.contractCountMin)
          ? rawFilters.contractCountMin
          : undefined,
      contractCountMax:
        typeof rawFilters.contractCountMax === 'number' &&
        Number.isFinite(rawFilters.contractCountMax)
          ? rawFilters.contractCountMax
          : undefined,
      versionNoMin:
        typeof rawFilters.versionNoMin === 'number' &&
        Number.isFinite(rawFilters.versionNoMin)
          ? rawFilters.versionNoMin
          : undefined,
      versionNoMax:
        typeof rawFilters.versionNoMax === 'number' &&
        Number.isFinite(rawFilters.versionNoMax)
          ? rawFilters.versionNoMax
          : undefined,
      updatedFrom:
        typeof rawFilters.updatedFrom === 'string'
          ? rawFilters.updatedFrom
          : CONTRACT_TEMPLATE_LIST_INITIAL_FILTERS.updatedFrom,
      updatedTo:
        typeof rawFilters.updatedTo === 'string'
          ? rawFilters.updatedTo
          : CONTRACT_TEMPLATE_LIST_INITIAL_FILTERS.updatedTo,
    },
    columnVisibility: booleanRecord(source.columnVisibility),
    columnOrder: stringArray(source.columnOrder) as ColumnOrderState,
  };
}

export function contractTemplateSavedViewConfigEquals(
  left: ContractTemplateSavedViewConfig,
  right: ContractTemplateSavedViewConfig,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
