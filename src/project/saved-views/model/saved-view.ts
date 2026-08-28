import type { ColumnOrderState, VisibilityState } from '@tanstack/react-table';

export const SAVED_VIEW_RESOURCES = [
  'customers',
  'employees',
  'contracts',
  'contract_templates',
] as const;

export type SavedViewResource = (typeof SAVED_VIEW_RESOURCES)[number];

export interface SavedViewConfig<
  TFilters extends object = Record<string, unknown>,
> {
  version: 1;
  keyword: string;
  filters: TFilters;
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
}

export interface TenantSavedView<
  TFilters extends object = Record<string, unknown>,
> {
  id: string;
  tenantId: string;
  resource: SavedViewResource;
  name: string;
  config: SavedViewConfig<TFilters>;
  isDefault: boolean;
  version: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}
