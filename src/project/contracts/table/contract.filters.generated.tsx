/**
 * Scaffolded by filter-builder from `src/project/contracts/table/contract.filters.fixture.ts`. Run npm run gen:filter — do NOT hand-write this file.
 * You own this file now — keep domain state, renderers, and API mapping outside the builder.
 */
import { FilterToolbar } from '@/components/ui/filter-toolbar';

export interface ContractFilterBarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ContractFilterBar({
  keyword,
  onKeywordChange,
  disabled = false,
  className,
}: ContractFilterBarProps) {
  return (
    <FilterToolbar
      className={className}
      fields={[
        {
          kind: 'search',
          value: keyword,
          onValueChange: onKeywordChange,
          placeholder: 'Tìm theo mã, tên hoặc khách hàng',
          className: 'w-72',
          debounceMs: 300,
          disabled,
        },
      ]}
    />
  );
}
