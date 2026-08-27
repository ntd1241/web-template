/**
 * Scaffolded by filter-builder from `src/project/employees/table/employee.filters.fixture.ts`. Run npm run gen:filter — do NOT hand-write this file.
 * You own this file now — keep domain state, renderers, and API mapping outside the builder.
 */
import { FilterToolbar } from '@/components/ui/filter-toolbar';

export interface EmployeeFilterBarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function EmployeeFilterBar({
  keyword,
  onKeywordChange,
  disabled = false,
  className,
}: EmployeeFilterBarProps) {
  return (
    <FilterToolbar
      className={className}
      fields={[
        {
          kind: 'search',
          value: keyword,
          onValueChange: onKeywordChange,
          placeholder: 'Tìm theo tên, mã hoặc chức vụ',
          className: 'w-64',
          debounceMs: 300,
          disabled,
        },
      ]}
    />
  );
}
