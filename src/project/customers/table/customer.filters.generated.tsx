/**
 * Scaffolded by filter-builder from `src/project/customers/table/customer.filters.fixture.ts`. Run npm run gen:filter — do NOT hand-write this file.
 * You own this file now — keep domain state, renderers, and API mapping outside the builder.
 */
import type { ReactNode } from 'react';
import {
  FilterToolbar,
  type FilterToolbarOption,
} from '@/components/ui/filter-toolbar';

export type TagFilterOption = FilterToolbarOption;

export interface CustomerFilterBarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  tag: string;
  onTagChange: (value: string) => void;
  tagOptions: readonly TagFilterOption[];
  tagRenderOption?: (option: TagFilterOption) => ReactNode;
  tagRenderValue?: (option: TagFilterOption | undefined) => ReactNode;
  disabled?: boolean;
  className?: string;
}

export function CustomerFilterBar({
  keyword,
  onKeywordChange,
  tag,
  onTagChange,
  tagOptions,
  tagRenderOption,
  tagRenderValue,
  disabled = false,
  className,
}: CustomerFilterBarProps) {
  return (
    <FilterToolbar
      className={className}
      fields={[
        {
          kind: 'search',
          value: keyword,
          onValueChange: onKeywordChange,
          placeholder: 'Tìm theo tên hoặc mã khách hàng',
          className: 'w-64',
          debounceMs: 300,
          disabled,
        },
        {
          kind: 'select',
          value: tag,
          onValueChange: onTagChange,
          options: tagOptions ?? [],
          label: undefined,
          placeholder: 'Tất cả nhóm',
          ariaLabel: 'Nhóm khách hàng',
          className: 'w-48',
          disabled,
          renderOption: tagRenderOption,
          renderValue: tagRenderValue,
        },
      ]}
    />
  );
}
