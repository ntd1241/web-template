import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
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
import { MultiSelectList, nodeToString } from './multi-select-list';

export type MultiSelectOption<T = unknown> = {
  value: string;
  label: ReactNode;
  searchableText?: string;
  group?: string;
  count?: number;
  data?: T;
  disabled?: boolean;
};

export interface MultiSelectProps<T = unknown> {
  value?: string[];
  onChange?: (values: string[]) => void;
  options: Array<MultiSelectOption<T>>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  maxChips?: number;
  className?: string;
}

export function MultiSelect<T = unknown>({
  value = [],
  onChange,
  options,
  placeholder = 'Chọn...',
  searchPlaceholder = 'Tìm...',
  emptyMessage = 'Không có kết quả',
  disabled = false,
  maxChips = 2,
  className,
}: MultiSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedOptions = useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value],
  );
  const visibleChips = selectedOptions.slice(0, maxChips);
  const overflowCount = Math.max(0, selectedOptions.length - maxChips);
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
  };

  const handleRemove = (nextValue: string) => {
    onChange?.(value.filter((item) => item !== nextValue));
  };

  const handleSelectAll = (visibleValues: string[]) => {
    onChange?.(Array.from(new Set([...value, ...visibleValues])));
  };

  const handleClearAll = () => {
    onChange?.([]);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          disabled={disabled}
          variant="outline"
          mode="input"
          placeholder={!hasSelection}
          className={cn(
            'h-8.5 w-full justify-between border-border bg-field text-foreground',
            className,
          )}
        >
          <span className="flex min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-hidden text-start">
            {hasSelection ? (
              <>
                {visibleChips.map((option) => {
                  const labelText = nodeToString(option.label) || option.value;

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
                  <Badge variant="outline" className="text-muted-foreground">
                    +{overflowCount}
                  </Badge>
                ) : null}
              </>
            ) : (
              <span className="truncate text-muted-foreground">
                {placeholder}
              </span>
            )}
          </span>
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) border-border bg-popover p-0 text-foreground"
        align="start"
      >
        <Command shouldFilter={false} className="bg-popover text-foreground">
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={searchPlaceholder}
          />
          <MultiSelectList
            options={options}
            selectedValues={value}
            query={query}
            emptyMessage={emptyMessage}
            onToggle={handleToggle}
            onSelectAll={handleSelectAll}
            onClearAll={handleClearAll}
          />
        </Command>
      </PopoverContent>
    </Popover>
  );
}
