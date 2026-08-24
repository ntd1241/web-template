/**
 * Scaffolded by filter-builder from `src/builders/filter/__fixtures__/showcase.filter.fixture.ts`. Run npm run gen:filter — do NOT hand-write this file.
 * You own this file now — keep domain state, renderers, and API mapping outside the builder.
 */
import type { ReactNode } from 'react';
import {
  FilterToolbar,
  type FilterToolbarOption,
} from '@/components/ui/filter-toolbar';

export type StatusFilterOption = FilterToolbarOption;

const ShowcaseFilterBarStatusOptions: FilterToolbarOption[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang hoạt động' },
];

export interface ShowcaseFilterBarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  statusOptions?: readonly StatusFilterOption[];
  statusRenderOption?: (option: StatusFilterOption) => ReactNode;
  statusRenderValue?: (option: StatusFilterOption | undefined) => ReactNode;
  disabled?: boolean;
  className?: string;
}

export function ShowcaseFilterBar({
  keyword,
  onKeywordChange,
  status,
  onStatusChange,
  statusOptions,
  statusRenderOption,
  statusRenderValue,
  disabled = false,
  className,
}: ShowcaseFilterBarProps) {
  return (
    <FilterToolbar
      className={className}
      fields={[
        {
          kind: 'search',
          value: keyword,
          onValueChange: onKeywordChange,
          placeholder: 'Tìm kiếm...',
          className: 'w-64',
          debounceMs: 300,
          disabled,
        },
        {
          kind: 'select',
          value: status,
          onValueChange: onStatusChange,
          options: statusOptions ?? ShowcaseFilterBarStatusOptions,
          label: 'Trạng thái',
          placeholder: 'Trạng thái',
          ariaLabel: undefined,
          className: 'w-44',
          disabled,
          renderOption: statusRenderOption,
          renderValue: statusRenderValue,
        },
      ]}
    />
  );
}
