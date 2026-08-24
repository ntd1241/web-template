/**
 * Scaffolded by column-filter-builder from `src/builders/column-filter/__fixtures__/showcase.column-filter.fixture.ts`. Run `npm run gen:column-filter` — do NOT hand-write this file.
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
import {
  NumberRangeFilter,
  type NumberRangeValue,
} from '@/components/ui/filters/range-filter';
import {
  DateRangeFilter,
  type DateRangeValue,
} from '@/components/ui/filters/range-filter';

export interface TextColumnFilterProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface CustomerColumnFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchSelectOption[];
  loading?: boolean;
  triggerContent?: SelectSearchProps['triggerContent'];
  renderOption?: SelectSearchProps['renderOption'];
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

export interface OutstandingColumnFilterProps {
  value: NumberRangeValue;
  onChange: (value: NumberRangeValue) => void;
  disabled?: boolean;
  className?: string;
}

export interface NextDueColumnFilterProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  disabled?: boolean;
  className?: string;
}

export function ContractTextColumnFilter({
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
      aria-label="Tìm theo tên hoặc mã hợp đồng"
      variant="sm"
      className={cn('min-w-0 w-full shrink-0', className)}
      disabled={disabled}
    />
  );
}

export function ContractCustomerColumnFilter({
  value,
  onChange,
  options,
  loading = false,
  triggerContent,
  renderOption,
  disabled = false,
  className,
}: CustomerColumnFilterProps) {
  return (
    <SelectSearch
      value={value}
      onChange={onChange}
      options={options}
      placeholder=""
      searchPlaceholder="Tìm khách hàng..."
      loadingMessage="Đang tải khách hàng..."
      ariaLabel="Khách hàng"
      loading={loading}
      disabled={disabled}
      triggerContent={triggerContent}
      renderOption={renderOption}
      className={cn(
        'h-7 min-h-7 min-w-0 flex-1 rounded-md bg-background px-2.5 text-xs',
        className,
      )}
    />
  );
}

export function ContractStatusColumnFilter({
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

export function ContractOutstandingColumnFilter({
  value,
  onChange,
  disabled = false,
  className,
}: OutstandingColumnFilterProps) {
  return (
    <div className={cn('min-w-0 w-full', className)}>
      <NumberRangeFilter
        value={value}
        onChange={onChange}
        label="Còn phải thu"
        placeholder=""
        disabled={disabled}
      />
    </div>
  );
}

export function ContractNextDueColumnFilter({
  value,
  onChange,
  disabled = false,
  className,
}: NextDueColumnFilterProps) {
  return (
    <div className={cn('min-w-0 w-full', className)}>
      <DateRangeFilter
        value={value}
        onChange={onChange}
        label="Hạn gần nhất"
        placeholder=""
        disabled={disabled}
      />
    </div>
  );
}
