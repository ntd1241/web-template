/**
 * Scaffolded by filter-builder from `src/project/contracts/table/contract-receivable.filters.fixture.ts`. Run npm run gen:filter — do NOT hand-write this file.
 * You own this file now — keep domain state, renderers, and API mapping outside the builder.
 */
import type { ReactNode } from 'react';
import {
  FilterToolbar,
  type FilterToolbarOption,
} from '@/components/ui/filter-toolbar';

export type StatusFilterOption = FilterToolbarOption;

export interface ContractReceivableFilterBarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  statusOptions: readonly StatusFilterOption[];
  statusRenderOption?: (option: StatusFilterOption) => ReactNode;
  statusRenderValue?: (option: StatusFilterOption | undefined) => ReactNode;
  disabled?: boolean;
  className?: string;
}

export function ContractReceivableFilterBar({
  keyword,
  onKeywordChange,
  status,
  onStatusChange,
  statusOptions,
  statusRenderOption,
  statusRenderValue,
  disabled = false,
  className,
}: ContractReceivableFilterBarProps) {
  return (
    <FilterToolbar
      className={className}
      fields={[
        {
          kind: 'search',
          value: keyword,
          onValueChange: onKeywordChange,
          placeholder: 'Tìm theo khoản phí hoặc ngày',
          className: 'w-72',
          debounceMs: 300,
          disabled,
        },
        {
          kind: 'select',
          value: status,
          onValueChange: onStatusChange,
          options: statusOptions ?? [],
          label: 'Trạng thái',
          placeholder: 'Trạng thái',
          ariaLabel: 'Trạng thái kỳ thanh toán',
          className: 'w-48',
          disabled,
          renderOption: statusRenderOption,
          renderValue: statusRenderValue,
        },
      ]}
    />
  );
}
