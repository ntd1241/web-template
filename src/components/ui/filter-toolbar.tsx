import { Fragment, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SearchInput } from './inputs/search-input';
import { OptionSelect } from './option-select';

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
  FilterToolbarSearchField | FilterToolbarSelectField;

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
            <OptionSelect
              value={field.value}
              onChange={field.onValueChange}
              options={field.options}
              searchable={false}
              disabled={field.disabled}
              ariaLabel={field.ariaLabel}
              placeholder={field.placeholder}
              className={field.className}
              triggerContent={(option) => (
                <span className="flex min-w-0 items-center gap-1">
                  {field.label ? (
                    <span className="shrink-0">{field.label}:</span>
                  ) : null}
                  <span className="min-w-0 truncate">
                    {field.renderValue?.(
                      option
                        ? field.options.find(
                            (candidate) => candidate.value === option.value,
                          )
                        : undefined,
                    ) ??
                      option?.label ??
                      field.placeholder}
                  </span>
                </span>
              )}
              renderOption={field.renderOption}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}
