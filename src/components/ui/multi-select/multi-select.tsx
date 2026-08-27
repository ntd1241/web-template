import { Fragment, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge, BadgeButton } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandInput } from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  filterMultiSelectOptions,
  filterNestedMultiSelectOptions,
  flattenMultiSelectOptions,
  MultiSelectList,
  NestedMultiSelectList,
  nodeToString,
} from './multi-select-list';

export type MultiSelectOption<T = unknown> = {
  value: string;
  label: ReactNode;
  ariaLabel?: string;
  searchableText?: string;
  group?: string;
  count?: number;
  data?: T;
  disabled?: boolean;
};

export type MultiSelectGroupOption<T = unknown> = Omit<
  MultiSelectOption<T>,
  'value' | 'group'
> & {
  value?: string;
  options: Array<MultiSelectTreeOption<T>>;
};

export type MultiSelectTreeOption<T = unknown> =
  MultiSelectOption<T> | MultiSelectGroupOption<T>;

export type MultiSelectSize = 'sm' | 'md' | 'lg';

export interface MultiSelectProps<T = unknown> {
  value?: string[];
  onChange?: (values: string[]) => void;
  options: Array<MultiSelectOption<T>>;
  nestedOptions?: Array<MultiSelectTreeOption<T>>;
  placeholder?: string;
  searchPlaceholder?: string;
  searchMode?: 'popover' | 'inline';
  emptyMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
  renderSelectedOption?: (
    option: MultiSelectOption<T>,
    onRemove: () => void,
  ) => ReactNode;
  disabled?: boolean;
  maxChips?: number;
  showSelectedOptionWrapper?: boolean;
  showSelectedOptionsInTrigger?: boolean;
  size?: MultiSelectSize;
  ariaLabel?: string;
  className?: string;
}

const multiSelectTriggerVariants = cva(
  'flex w-full items-center justify-between gap-2 rounded-md border border-border text-foreground',
  {
    variants: {
      size: {
        sm: 'h-7 min-h-7 px-2.5 text-xs',
        md: 'h-8.5 min-h-8.5 px-3 text-[0.8125rem]',
        lg: 'h-10 min-h-10 px-4 text-sm',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export function MultiSelect<T = unknown>({
  value = [],
  onChange,
  options,
  nestedOptions,
  placeholder = 'Chọn...',
  searchPlaceholder = 'Tìm...',
  searchMode = 'popover',
  emptyMessage = 'Không có kết quả',
  loading = false,
  loadingMessage = 'Đang tải...',
  renderSelectedOption,
  disabled = false,
  maxChips = 2,
  showSelectedOptionWrapper = false,
  showSelectedOptionsInTrigger = true,
  size,
  ariaLabel,
  className,
}: MultiSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedOptions = useMemo(() => {
    const availableOptions = nestedOptions
      ? flattenMultiSelectOptions(nestedOptions)
      : options;

    return availableOptions.filter((option) => value.includes(option.value));
  }, [nestedOptions, options, value]);
  const visibleChipLimit = selectedOptions.length === 1 ? 1 : maxChips;
  const visibleChips = showSelectedOptionsInTrigger
    ? selectedOptions.slice(0, visibleChipLimit)
    : [];
  const overflowCount = showSelectedOptionsInTrigger
    ? Math.max(0, selectedOptions.length - visibleChipLimit)
    : 0;
  const hasSelection = selectedOptions.length > 0;

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);

    if (!nextOpen) {
      setQuery('');
    }
  };

  const handleToggle = (option: MultiSelectOption<T>) => {
    if (option.disabled) {
      return;
    }

    const nextValues = value.includes(option.value)
      ? value.filter((item) => item !== option.value)
      : [...value, option.value];

    onChange?.(nextValues);
    setQuery('');
  };

  const handleRemove = (nextValue: string) => {
    onChange?.(value.filter((item) => item !== nextValue));
  };

  const handleToggleGroup = (groupOptions: MultiSelectOption<T>[]) => {
    const selectableValues = groupOptions
      .filter((option) => !option.disabled)
      .map((option) => option.value);
    if (selectableValues.length === 0) return;

    const allSelected = selectableValues.every((optionValue) =>
      value.includes(optionValue),
    );
    const nextValues = new Set(value);

    selectableValues.forEach((optionValue) => {
      if (allSelected) nextValues.delete(optionValue);
      else nextValues.add(optionValue);
    });

    onChange?.(Array.from(nextValues));
    setQuery('');
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== 'Enter' || !query.trim()) return;

    const firstMatch = (
      nestedOptions
        ? flattenMultiSelectOptions(
            filterNestedMultiSelectOptions(nestedOptions, query),
          )
        : filterMultiSelectOptions(options, query)
    ).find((option) => !option.disabled);
    if (!firstMatch) return;

    event.preventDefault();
    event.stopPropagation();
    handleToggle(firstMatch);
  };

  const handleInlineSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const inputQuery = event.currentTarget.value;

    if (event.key === 'Backspace' && !inputQuery && value.length > 0) {
      handleRemove(value[value.length - 1]);
      return;
    }

    if (event.key !== 'Enter' || !inputQuery.trim()) return;

    const firstMatch = (
      nestedOptions
        ? flattenMultiSelectOptions(
            filterNestedMultiSelectOptions(nestedOptions, inputQuery),
          )
        : filterMultiSelectOptions(options, inputQuery)
    ).find((option) => !option.disabled);
    if (!firstMatch) return;

    event.preventDefault();
    event.stopPropagation();
    handleToggle(firstMatch);
  };

  const triggerContent = (
    <>
      <span className="flex min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-hidden text-start">
        {visibleChips.map((option) => {
          const labelText =
            option.ariaLabel || nodeToString(option.label) || option.value;

          if (renderSelectedOption) {
            return (
              <Fragment key={option.value}>
                {renderSelectedOption(option, () => handleRemove(option.value))}
              </Fragment>
            );
          }

          if (!showSelectedOptionWrapper) {
            return <Fragment key={option.value}>{option.label}</Fragment>;
          }

          return (
            <Badge
              key={option.value}
              variant="secondary"
              appearance="light"
              className="max-w-32 justify-start"
            >
              <span className="min-w-0 truncate">{option.label}</span>
              <BadgeButton
                aria-label={`Bỏ ${labelText}`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleRemove(option.value);
                }}
              >
                <X />
              </BadgeButton>
            </Badge>
          );
        })}
        {overflowCount > 0 ? (
          <Badge variant="outline" className="shrink-0 text-muted-foreground">
            +{overflowCount}
          </Badge>
        ) : null}
        {searchMode === 'inline' ? (
          <input
            aria-label={searchPlaceholder}
            className="min-w-20 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            disabled={disabled}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsOpen(true)}
            onClick={(event) => {
              event.stopPropagation();
              if (!disabled) setIsOpen(true);
            }}
            onKeyDown={handleInlineSearchKeyDown}
            placeholder={hasSelection ? searchPlaceholder : placeholder}
          />
        ) : null}
        {searchMode !== 'inline' &&
        (!hasSelection || !showSelectedOptionsInTrigger) ? (
          <span className="truncate text-muted-foreground">{placeholder}</span>
        ) : null}
      </span>
      <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
    </>
  );

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {searchMode === 'inline' ? (
          <div
            role="combobox"
            aria-label={ariaLabel}
            aria-expanded={isOpen}
            aria-busy={loading}
            className={cn(
              multiSelectTriggerVariants({ size }),
              'bg-background py-1.5',
              disabled && 'cursor-not-allowed opacity-50',
              className,
            )}
            onClick={() => {
              if (!disabled) setIsOpen(true);
            }}
          >
            {triggerContent}
          </div>
        ) : (
          <Button
            type="button"
            role="combobox"
            aria-label={ariaLabel}
            aria-expanded={isOpen}
            aria-busy={loading}
            disabled={disabled}
            variant="outline"
            mode="input"
            placeholder={!hasSelection || !showSelectedOptionsInTrigger}
            className={cn(
              multiSelectTriggerVariants({ size }),
              'bg-background',
              className,
            )}
          >
            {triggerContent}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) min-w-[220px] border-border bg-popover p-0 text-foreground"
        align="start"
        onOpenAutoFocus={(event) => {
          if (searchMode === 'inline') event.preventDefault();
        }}
      >
        <Command shouldFilter={false} className="bg-popover text-foreground">
          {searchMode === 'popover' ? (
            <CommandInput
              autoFocus
              value={query}
              onValueChange={setQuery}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
            />
          ) : null}
          {loading ? (
            <div
              role="status"
              className="px-3 py-6 text-center text-sm text-muted-foreground"
            >
              {loadingMessage}
            </div>
          ) : nestedOptions ? (
            <NestedMultiSelectList
              options={nestedOptions}
              selectedValues={value}
              query={query}
              emptyMessage={emptyMessage}
              onToggle={handleToggle}
              onToggleGroup={handleToggleGroup}
            />
          ) : (
            <MultiSelectList
              options={options}
              selectedValues={value}
              query={query}
              emptyMessage={emptyMessage}
              onToggle={handleToggle}
            />
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
