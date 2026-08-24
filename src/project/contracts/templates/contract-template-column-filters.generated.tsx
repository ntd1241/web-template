/**
 * Scaffolded by column-filter-builder from `src/project/contracts/templates/contract-template-column-filters.fixture.ts`. Run `npm run gen:column-filter` — do NOT hand-write this file.
 * You own this file now — wire the generated filters into the table and keep domain mapping outside the builder.
 */
import { cn } from '@/lib/utils';
import {
  DateRangeFilter,
  NumberRangeFilter,
  type DateRangeValue,
  type NumberRangeValue,
} from '@/components/ui/filters/range-filter';
import { SearchInput } from '@/components/ui/inputs/search-input';
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

export interface StatusColumnFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  disabled?: boolean;
  className?: string;
}

export interface LineCountColumnFilterProps {
  value: NumberRangeValue;
  onChange: (value: NumberRangeValue) => void;
  disabled?: boolean;
  className?: string;
}

export interface ContractCountColumnFilterProps {
  value: NumberRangeValue;
  onChange: (value: NumberRangeValue) => void;
  disabled?: boolean;
  className?: string;
}

export interface VersionNoColumnFilterProps {
  value: NumberRangeValue;
  onChange: (value: NumberRangeValue) => void;
  disabled?: boolean;
  className?: string;
}

export interface UpdatedAtColumnFilterProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  disabled?: boolean;
  className?: string;
}

export function ContractTemplateTextColumnFilter({
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
      placeholder={''}
      aria-label={'Tìm theo tên hoặc mã mẫu hợp đồng'}
      variant="sm"
      className={cn('min-w-0 w-full shrink-0 bg-background', className)}
      disabled={disabled}
    />
  );
}

export function ContractTemplateStatusColumnFilter({
  value,
  onChange,
  options,
  disabled = false,
  className,
}: StatusColumnFilterProps) {
  return (
    <MultiSelect
      value={value}
      onChange={onChange}
      options={options}
      placeholder={''}
      searchPlaceholder={'Tìm trạng thái...'}
      maxChips={0}
      disabled={disabled}
      className={cn(
        'h-7 min-h-7 min-w-0 rounded-md bg-background px-2.5 text-xs',
        className,
      )}
    />
  );
}

export function ContractTemplateLineCountColumnFilter({
  value,
  onChange,
  disabled = false,
  className,
}: LineCountColumnFilterProps) {
  return (
    <div className={cn('min-w-0 w-full', className)}>
      <NumberRangeFilter
        value={value}
        onChange={onChange}
        label={'Khoản phí'}
        placeholder={''}
        disabled={disabled}
      />
    </div>
  );
}

export function ContractTemplateContractCountColumnFilter({
  value,
  onChange,
  disabled = false,
  className,
}: ContractCountColumnFilterProps) {
  return (
    <div className={cn('min-w-0 w-full', className)}>
      <NumberRangeFilter
        value={value}
        onChange={onChange}
        label={'Hợp đồng đã tạo'}
        placeholder={''}
        disabled={disabled}
      />
    </div>
  );
}

export function ContractTemplateVersionNoColumnFilter({
  value,
  onChange,
  disabled = false,
  className,
}: VersionNoColumnFilterProps) {
  return (
    <div className={cn('min-w-0 w-full', className)}>
      <NumberRangeFilter
        value={value}
        onChange={onChange}
        label={'Phiên bản'}
        placeholder={''}
        disabled={disabled}
      />
    </div>
  );
}

export function ContractTemplateUpdatedAtColumnFilter({
  value,
  onChange,
  disabled = false,
  className,
}: UpdatedAtColumnFilterProps) {
  return (
    <div className={cn('min-w-0 w-full', className)}>
      <DateRangeFilter
        value={value}
        onChange={onChange}
        label={'Cập nhật gần nhất'}
        placeholder={''}
        disabled={disabled}
      />
    </div>
  );
}
