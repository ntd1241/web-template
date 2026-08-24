import { Fragment, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SearchInput } from './inputs/search-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

export interface FilterToolbarOption {
  value: string;
  label: string;
}

export interface FilterToolbarSearchField {
  kind: 'search';
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  disabled?: boolean;
}

export interface FilterToolbarSelectField {
  kind: 'select';
  value: string;
  onValueChange: (value: string) => void;
  options: readonly FilterToolbarOption[];
  label?: ReactNode;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  renderOption?: (option: FilterToolbarOption) => ReactNode;
  renderValue?: (option: FilterToolbarOption | undefined) => ReactNode;
}

export type FilterToolbarField =
  | FilterToolbarSearchField
  | FilterToolbarSelectField;

export interface FilterToolbarProps {
  fields: readonly FilterToolbarField[];
  className?: string;
}

export function FilterToolbar({ fields, className }: FilterToolbarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {fields.map((field, index) => (
        <Fragment key={`${field.kind}-${index}`}>
          {field.kind === 'search' ? (
            <SearchInput
              className={field.className}
              placeholder={field.placeholder}
              value={field.value}
              debounceMs={field.debounceMs}
              disabled={field.disabled}
              onSearch={field.onValueChange}
            />
          ) : (
            <Select
              value={field.value}
              onValueChange={field.onValueChange}
              disabled={field.disabled}
            >
              <SelectTrigger
                className={field.className}
                aria-label={field.ariaLabel}
              >
                <SelectValue
                  label={field.label}
                  placeholder={field.placeholder}
                >
                  {field.renderValue?.(
                    field.options.find(
                      (option) => option.value === field.value,
                    ),
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    textValue={option.label}
                  >
                    {field.renderOption?.(option) ?? option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Fragment>
      ))}
    </div>
  );
}
