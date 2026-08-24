/**
 * Scaffolded by filter-builder from `src/project/employees/table/employee.filters.fixture.ts`. Run npm run gen:filter — do NOT hand-write this file.
 * You own this file now — keep domain state, renderers, and API mapping outside the builder.
 */
import { FilterToolbar } from '@/components/ui/filter-toolbar';
import type { ReactNode } from 'react';

export interface EmployeeFilterBarOption {
  value: string;
  label: string;
}

export interface EmployeeFilterBarProps {
  tag: string;
  onTagChange: (value: string) => void;
  tagOptions: readonly EmployeeFilterBarOption[];
  renderTagOption?: (option: EmployeeFilterBarOption) => ReactNode;
  renderTagValue?: (
    option: EmployeeFilterBarOption | undefined,
  ) => ReactNode;
  disabled?: boolean;
  className?: string;
}

export function EmployeeFilterBar({
  tag,
  onTagChange,
  tagOptions,
  renderTagOption,
  renderTagValue,
  disabled = false,
  className,
}: EmployeeFilterBarProps) {
  return (
    <FilterToolbar
      className={className}
      fields={[
        {
          kind: 'select',
          value: tag,
          onValueChange: onTagChange,
          options: tagOptions,
          placeholder: 'Tất cả nhóm',
          ariaLabel: 'Nhóm nhân viên',
          className: 'w-48',
          disabled,
          renderOption: renderTagOption,
          renderValue: renderTagValue,
        },
      ]}
    />
  );
}
