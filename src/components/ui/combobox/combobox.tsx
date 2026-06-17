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

export type ComboboxOption<T = unknown> = {
  value: string;
  label: ReactNode;
  searchableText?: string;
  data?: T;
  disabled?: boolean;
};

export interface ComboboxProps<T = unknown> {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (option: ComboboxOption<T> | undefined) => void;
  options: Array<ComboboxOption<T>>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  manualFilter?: boolean;
  renderOption?: (option: ComboboxOption<T>, isSelected: boolean) => ReactNode;
  triggerContent?:
    | ReactNode
    | ((option: ComboboxOption<T> | undefined) => ReactNode);
}

function getOptionSearchText<T>(option: ComboboxOption<T>): string {
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
  selectedOption: ComboboxOption<T> | undefined;
  placeholder: string;
  triggerContent: ComboboxProps<T>['triggerContent'];
}): ReactNode {
  if (typeof triggerContent === 'function') {
    return triggerContent(selectedOption);
  }

  if (triggerContent !== undefined) {
    return triggerContent;
  }

  return selectedOption?.label ?? placeholder;
}

export function Combobox<T = unknown>({
  value = '',
  onChange,
  onSelect,
  options,
  placeholder = 'Chọn...',
  searchPlaceholder = 'Tìm...',
  emptyMessage = 'Không có kết quả',
  disabled = false,
  manualFilter = false,
  renderOption,
  triggerContent,
}: ComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    if (manualFilter) {
      return options;
    }

    return options.filter((option) =>
      searchMatch(getOptionSearchText(option), query),
    );
  }, [manualFilter, options, query]);

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);

    if (!nextOpen) {
      setQuery('');
    }
  };

  const handleSelect = (option: ComboboxOption<T>) => {
    const nextValue = option.value === value ? '' : option.value;
    const nextOption = nextValue ? option : undefined;

    onChange?.(nextValue);
    onSelect?.(nextOption);
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
          disabled={disabled}
          variant="outline"
          mode="input"
          placeholder={!selectedOption}
          className="w-full justify-between border-border bg-field text-foreground"
        >
          <span className="min-w-0 truncate text-start">{content}</span>
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
          <CommandList>
            {filteredOptions.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const isSelected = option.value === value;

                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      onSelect={() => handleSelect(option)}
                      className={cn(
                        'min-h-8 text-foreground',
                        option.disabled && 'text-muted-foreground',
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
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
