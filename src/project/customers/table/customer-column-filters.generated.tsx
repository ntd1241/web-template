/**
 * Scaffolded by column-filter-builder from `src/project/customers/table/customer-column-filters.fixture.ts`. Run `npm run gen:column-filter` — do NOT hand-write this file.
 * You own this file now — wire the generated filters into the table and keep domain mapping outside the builder.
 */
import { cn } from '@/lib/utils';
import { SearchInput } from '@/components/ui/inputs/search-input';
import {
  CustomerBusinessTypeSelect,
  CustomerStatusSelect,
} from '../components/customer-filter-selects';

export interface TextColumnFilterProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface BusinessTypeColumnFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export interface ContactColumnFilterProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface StatusColumnFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export function CustomerTextColumnFilter({
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
      aria-label={'Tìm theo tên hoặc mã khách hàng'}
      variant="sm"
      className={cn('min-w-0 w-full shrink-0 bg-background', className)}
      disabled={disabled}
    />
  );
}

export function CustomerBusinessTypeColumnFilter({
  value,
  onChange,
  disabled = false,
  className,
}: BusinessTypeColumnFilterProps) {
  return (
    <CustomerBusinessTypeSelect
      value={value[0] as 'individual' | 'organization' | undefined}
      onChange={(nextValue) => onChange(nextValue ? [nextValue] : [])}
      placeholder="Tất cả"
      size="sm"
      disabled={disabled}
      className={cn('min-w-0 bg-background', className)}
    />
  );
}

export function CustomerContactColumnFilter({
  value,
  onChange,
  disabled = false,
  className,
}: ContactColumnFilterProps) {
  return (
    <SearchInput
      value={value}
      onSearch={onChange}
      debounceMs={300}
      placeholder={''}
      aria-label={'Tìm theo số điện thoại hoặc email'}
      variant="sm"
      className={cn('min-w-0 w-full shrink-0 bg-background', className)}
      disabled={disabled}
    />
  );
}

export function CustomerStatusColumnFilter({
  value,
  onChange,
  disabled = false,
  className,
}: StatusColumnFilterProps) {
  return (
    <CustomerStatusSelect
      value={value[0] as 'active' | 'inactive' | undefined}
      onChange={(nextValue) => onChange(nextValue ? [nextValue] : [])}
      placeholder="Tất cả"
      size="sm"
      disabled={disabled}
      className={cn('min-w-0 bg-background', className)}
    />
  );
}
