import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { searchMatch } from '@/lib/search';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import type { MultiSelectOption } from './multi-select';

interface GroupedOptions<T> {
  group: string | undefined;
  options: Array<MultiSelectOption<T>>;
}

interface MultiSelectListProps<T> {
  options: Array<MultiSelectOption<T>>;
  selectedValues: string[];
  query: string;
  emptyMessage: string;
  onToggle: (option: MultiSelectOption<T>) => void;
}

export function nodeToString(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(nodeToString).join(' ');
  }

  return '';
}

function getOptionSearchText<T>(option: MultiSelectOption<T>): string {
  return option.searchableText ?? nodeToString(option.label) ?? option.value;
}

function groupOptions<T>(
  options: Array<MultiSelectOption<T>>,
): Array<GroupedOptions<T>> {
  const groups = new Map<string | undefined, Array<MultiSelectOption<T>>>();

  options.forEach((option) => {
    const current = groups.get(option.group) ?? [];
    current.push(option);
    groups.set(option.group, current);
  });

  return Array.from(groups.entries()).map(([group, groupOptions]) => ({
    group,
    options: groupOptions,
  }));
}

export function filterMultiSelectOptions<T>(
  options: Array<MultiSelectOption<T>>,
  query: string,
): Array<MultiSelectOption<T>> {
  return options.filter((option) =>
    searchMatch(getOptionSearchText(option), query),
  );
}

export function MultiSelectList<T>({
  options,
  selectedValues,
  query,
  emptyMessage,
  onToggle,
}: MultiSelectListProps<T>) {
  const filteredOptions = useMemo(
    () => filterMultiSelectOptions(options, query),
    [options, query],
  );
  const groupedOptions = useMemo(
    () => groupOptions(filteredOptions),
    [filteredOptions],
  );
  return (
    <CommandList>
      {filteredOptions.length === 0 ? (
        <CommandEmpty>{emptyMessage}</CommandEmpty>
      ) : (
        groupedOptions.map((group) => (
          <CommandGroup
            key={group.group ?? '__ungrouped__'}
            heading={group.group}
          >
            {group.options.map((option) => {
              const isSelected = selectedValues.includes(option.value);

              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  onSelect={() => onToggle(option)}
                  className={cn(
                    'min-h-8 text-foreground',
                    option.disabled && 'text-disabled-foreground',
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={option.disabled}
                    aria-label={`Chọn ${nodeToString(option.label) || option.value}`}
                    tabIndex={-1}
                    className="pointer-events-none size-4"
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {option.label}
                  </span>
                  {option.count !== undefined ? (
                    <span className="ms-auto shrink-0 tabular-nums text-muted-foreground">
                      {option.count}
                    </span>
                  ) : null}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))
      )}
    </CommandList>
  );
}
