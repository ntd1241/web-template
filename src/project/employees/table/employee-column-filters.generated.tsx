/**
 * Scaffolded by column-filter-builder from `src/project/employees/table/employee-column-filters.fixture.ts`. Run `npm run gen:column-filter` — do NOT hand-write this file.
 * You own this file now — wire the generated filters into the table and keep domain mapping outside the builder.
 */
import { cn } from '@/lib/utils';
import { SearchInput } from '@/components/ui/inputs/search-input';
import {
  SelectSearch,
  type SearchSelectOption,
  type SelectSearchProps,
} from '@/components/ui/select-search';
import {
  MultiSelect,
  type MultiSelectOption,
} from '@/components/ui/multi-select';

export interface TextColumnFilterProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface RolesColumnFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  disabled?: boolean;
  className?: string;
}

export interface StatusColumnFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  disabled?: boolean;
  className?: string;
}

export interface AccountColumnFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchSelectOption[];
  loading?: boolean;
  triggerContent?: SelectSearchProps['triggerContent'];
  renderOption?: SelectSearchProps['renderOption'];
  disabled?: boolean;
  className?: string;
}

export function EmployeeTextColumnFilter({
  value,
  onChange,
  disabled = false,
  className,
}: TextColumnFilterProps) {
  return (
    <SearchInput
      value={value}
      onSearch={onChange}
      debounceMs={300}
      placeholder=""
      aria-label="Tìm theo tên hoặc mã nhân viên"
      variant="sm"
      className={cn(
        'min-w-0 w-full shrink-0 bg-background',
        className,
      )}
      disabled={disabled}
    />
  );
}

export function EmployeeRolesColumnFilter({
  value,
  onChange,
  options,
  disabled = false,
  className,
}: RolesColumnFilterProps) {
  return (
    <MultiSelect
      value={value}
      options={options}
      placeholder=""
      searchPlaceholder="Tìm vai trò..."
      maxChips={0}
      disabled={disabled}
      className={cn(
        'h-7 min-h-7 min-w-0 rounded-md bg-background px-2.5 text-xs',
        className,
      )}
      onChange={onChange}
    />
  );
}

export function EmployeeStatusColumnFilter({
  value,
  onChange,
  options,
  disabled = false,
  className,
}: StatusColumnFilterProps) {
  return (
    <MultiSelect
      value={value}
      options={options}
      placeholder=""
      searchPlaceholder="Tìm trạng thái..."
      maxChips={0}
      disabled={disabled}
      className={cn(
        'h-7 min-h-7 min-w-0 rounded-md bg-background px-2.5 text-xs',
        className,
      )}
      onChange={onChange}
    />
  );
}

export function EmployeeAccountColumnFilter({
  value,
  onChange,
  options,
  loading = false,
  triggerContent,
  renderOption,
  disabled = false,
  className,
}: AccountColumnFilterProps) {
  return (
    <SelectSearch
      value={value}
      onChange={onChange}
      options={options}
      placeholder=""
      searchPlaceholder="Tìm trạng thái tài khoản..."
      ariaLabel="Tài khoản"
      loading={loading}
      disabled={disabled}
      triggerContent={triggerContent}
      renderOption={renderOption}
      className={cn(
        'h-7 min-h-7 min-w-0 rounded-md bg-background px-2.5 text-xs',
        className,
      )}
    />
  );
}
