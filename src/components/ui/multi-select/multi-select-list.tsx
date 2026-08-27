import { Fragment, useMemo } from 'react';
import type { ReactNode } from 'react';
import { fuzzyMatch } from '@/lib/fuzzy-search';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import type { MultiSelectOption, MultiSelectTreeOption } from './multi-select';

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
  return (
    option.searchableText ||
    option.ariaLabel ||
    nodeToString(option.label) ||
    option.value
  );
}

function isGroupOption<T>(
  option: MultiSelectTreeOption<T>,
): option is Extract<MultiSelectTreeOption<T>, { options: unknown[] }> {
  return 'options' in option && option.options.length > 0;
}

function getTreeOptionSearchText<T>(option: MultiSelectTreeOption<T>): string {
  return (
    option.searchableText ||
    nodeToString(option.label) ||
    ('value' in option ? option.value : '')
  );
}

export function flattenMultiSelectOptions<T>(
  options: Array<MultiSelectTreeOption<T>>,
): Array<MultiSelectOption<T>> {
  return options.flatMap((option) =>
    isGroupOption(option)
      ? flattenMultiSelectOptions(option.options)
      : [option],
  );
}

export function filterNestedMultiSelectOptions<T>(
  options: Array<MultiSelectTreeOption<T>>,
  query: string,
): Array<MultiSelectTreeOption<T>> {
  if (!query.trim()) return options;

  return options.flatMap((option) => {
    if (!isGroupOption(option)) {
      return fuzzyMatch(query, getTreeOptionSearchText(option)) ? [option] : [];
    }

    if (fuzzyMatch(query, getTreeOptionSearchText(option))) {
      return [option];
    }

    const matchingChildren = filterNestedMultiSelectOptions(
      option.options,
      query,
    );
    return matchingChildren.length
      ? [{ ...option, options: matchingChildren }]
      : [];
  });
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
    fuzzyMatch(query, getOptionSearchText(option)),
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

interface NestedMultiSelectListProps<T> {
  options: Array<MultiSelectTreeOption<T>>;
  selectedValues: string[];
  query: string;
  emptyMessage: string;
  onToggle: (option: MultiSelectOption<T>) => void;
  onToggleGroup: (options: MultiSelectOption<T>[]) => void;
}

function collectGroupOptions<T>(
  option: MultiSelectTreeOption<T>,
): Array<MultiSelectOption<T>> {
  return isGroupOption(option)
    ? flattenMultiSelectOptions(option.options)
    : [option];
}

function nestedOptionLabel<T>(option: MultiSelectTreeOption<T>): string {
  return (
    option.ariaLabel ||
    nodeToString(option.label) ||
    ('value' in option ? option.value : '') ||
    'mục'
  );
}

export function NestedMultiSelectList<T>({
  options,
  selectedValues,
  query,
  emptyMessage,
  onToggle,
  onToggleGroup,
}: NestedMultiSelectListProps<T>) {
  const filteredOptions = useMemo(
    () => filterNestedMultiSelectOptions(options, query),
    [options, query],
  );
  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  const renderOption = (
    option: MultiSelectTreeOption<T>,
    level: number,
    path: string,
  ): ReactNode => {
    const optionLabel = nestedOptionLabel(option);

    if (isGroupOption(option)) {
      const groupOptions = collectGroupOptions(option);
      const selectableOptions = groupOptions.filter((child) => !child.disabled);
      const selectedCount = selectableOptions.filter((child) =>
        selectedSet.has(child.value),
      ).length;
      const isSelected =
        selectableOptions.length > 0 &&
        selectedCount === selectableOptions.length;
      const isIndeterminate = selectedCount > 0 && !isSelected;

      return (
        <Fragment key={path}>
          <CommandItem
            value={path}
            disabled={selectableOptions.length === 0}
            onSelect={() => onToggleGroup(groupOptions)}
            className="min-h-8 text-foreground"
          >
            <div
              className="flex w-full items-center gap-2"
              style={{ paddingLeft: level * 16 }}
            >
              <Checkbox
                checked={isIndeterminate ? 'indeterminate' : isSelected}
                disabled={selectableOptions.length === 0}
                aria-label={`Chọn ${optionLabel}`}
                tabIndex={-1}
                className="pointer-events-none size-4"
              />
              <span className="min-w-0 flex-1 truncate font-medium">
                {option.label}
              </span>
            </div>
          </CommandItem>
          {option.options.map((child, index) =>
            renderOption(child, level + 1, `${path}.${index}`),
          )}
        </Fragment>
      );
    }

    const isSelected = selectedSet.has(option.value);

    return (
      <CommandItem
        key={path}
        value={path}
        disabled={option.disabled}
        onSelect={() => onToggle(option)}
        className={cn(
          'min-h-8 text-foreground',
          option.disabled && 'text-disabled-foreground',
        )}
      >
        <div
          className="flex w-full items-center gap-2"
          style={{ paddingLeft: level * 16 }}
        >
          <Checkbox
            checked={isSelected}
            disabled={option.disabled}
            aria-label={`Chọn ${optionLabel}`}
            tabIndex={-1}
            className="pointer-events-none size-4"
          />
          <span className="min-w-0 flex-1 truncate">{option.label}</span>
          {option.count !== undefined ? (
            <span className="ms-auto shrink-0 tabular-nums text-muted-foreground">
              {option.count}
            </span>
          ) : null}
        </div>
      </CommandItem>
    );
  };

  return (
    <CommandList>
      {filteredOptions.length === 0 ? (
        <CommandEmpty>{emptyMessage}</CommandEmpty>
      ) : (
        <CommandGroup>
          {filteredOptions.map((option, index) =>
            renderOption(option, 0, `option.${index}`),
          )}
        </CommandGroup>
      )}
    </CommandList>
  );
}
