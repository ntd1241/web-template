import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { searchMatch } from '@/lib/search';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export type SearchSelectOption<T = unknown> = {
  value: string;
  label: ReactNode;
  searchableText?: string;
  group?: string;
  data?: T;
  disabled?: boolean;
};

export interface SelectSearchProps<T = unknown> {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (option: SearchSelectOption<T> | undefined) => void;
  options: Array<SearchSelectOption<T>>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  manualFilter?: boolean;
  canDeselect?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  selectedOption?: SearchSelectOption<T>;
  renderOption?: (
    option: SearchSelectOption<T>,
    isSelected: boolean,
  ) => ReactNode;
  triggerContent?:
    ReactNode | ((option: SearchSelectOption<T> | undefined) => ReactNode);
  className?: string;
  onOpenChange?: (open: boolean) => void;
  onSearchChange?: (query: string) => void;
}

export function getSearchSelectOptionText<T>(
  option: SearchSelectOption<T>,
): string {
  if (option.searchableText !== undefined) {
    return option.searchableText;
  }

  return typeof option.label === 'string' ? option.label : option.value;
}

function getTriggerContent<T>({
  selectedOption,
  placeholder,
  triggerContent,
}: {
  selectedOption: SearchSelectOption<T> | undefined;
  placeholder: string;
  triggerContent: SelectSearchProps<T>['triggerContent'];
}): ReactNode {
  if (typeof triggerContent === 'function') {
    return triggerContent(selectedOption);
  }

  if (triggerContent !== undefined) {
    return triggerContent;
  }

  return selectedOption?.label ?? placeholder;
}

function groupOptions<T>(
  options: Array<SearchSelectOption<T>>,
): Array<[string, Array<SearchSelectOption<T>>]> {
  const groups = new Map<string, Array<SearchSelectOption<T>>>();

  options.forEach((option) => {
    const group = option.group ?? '';
    const groupOptions = groups.get(group) ?? [];
    groupOptions.push(option);
    groups.set(group, groupOptions);
  });

  return [...groups.entries()];
}

export function SelectSearch<T = unknown>({
  value = '',
  onChange,
  onSelect,
  options,
  placeholder = 'Chọn...',
  searchPlaceholder = 'Tìm...',
  emptyMessage = 'Không có kết quả',
  disabled = false,
  manualFilter = false,
  canDeselect = true,
  loading = false,
  loadingMessage = 'Đang tải...',
  selectedOption: selectedOptionProp,
  renderOption,
  triggerContent,
  className,
  onOpenChange,
  onSearchChange,
}: SelectSearchProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedOption = useMemo(() => {
    if (selectedOptionProp?.value === value) {
      return selectedOptionProp;
    }

    return options.find((option) => option.value === value);
  }, [options, selectedOptionProp, value]);

  const filteredOptions = useMemo(() => {
    if (manualFilter) {
      return options;
    }

    return options.filter((option) =>
      searchMatch(getSearchSelectOptionText(option), query),
    );
  }, [manualFilter, options, query]);

  const groupedOptions = useMemo(
    () => groupOptions(filteredOptions),
    [filteredOptions],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    onOpenChange?.(nextOpen);

    if (!nextOpen) {
      setQuery('');
      onSearchChange?.('');
    }
  };

  const handleSelect = (option: SearchSelectOption<T>) => {
    const isSameValue = option.value === value;

    if (isSameValue && !canDeselect) {
      return;
    }

    const nextValue = isSameValue ? '' : option.value;
    onChange?.(nextValue);
    onSelect?.(nextValue ? option : undefined);
    handleOpenChange(false);
  };

  const content = getTriggerContent({
    selectedOption,
    placeholder,
    triggerContent,
  });

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-busy={loading}
          disabled={disabled}
          variant="outline"
          mode="input"
          placeholder={!selectedOption}
          className={cn(
            'w-full justify-between border-border bg-field text-foreground',
            className,
          )}
        >
          <span className="min-w-0 truncate text-start">{content}</span>
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) min-w-[220px] border-border bg-popover p-0 text-foreground"
        align="start"
      >
        <Command shouldFilter={false} className="bg-popover text-foreground">
          <CommandInput
            value={query}
            onValueChange={(nextQuery) => {
              setQuery(nextQuery);
              onSearchChange?.(nextQuery);
            }}
            placeholder={searchPlaceholder}
          />
          <CommandList>
            {loading ? (
              <div
                role="status"
                className="px-3 py-6 text-center text-sm text-muted-foreground"
              >
                {loadingMessage}
              </div>
            ) : groupedOptions.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              groupedOptions.map(([group, groupItems]) => (
                <CommandGroup
                  key={group || 'ungrouped'}
                  heading={group || undefined}
                >
                  {groupItems.map((option) => {
                    const isSelected = option.value === value;

                    return (
                      <CommandItem
                        key={option.value}
                        value={getSearchSelectOptionText(option)}
                        disabled={option.disabled}
                        onSelect={() => handleSelect(option)}
                        className={cn(
                          'min-h-8 text-foreground',
                          option.disabled && 'text-disabled-foreground',
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {renderOption
                            ? renderOption(option, isSelected)
                            : option.label}
                        </span>
                        <Check
                          className={cn(
                            'size-4 text-foreground',
                            isSelected ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
