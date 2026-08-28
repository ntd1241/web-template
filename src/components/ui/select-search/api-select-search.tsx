import { useEffect, useMemo, useRef, useState } from 'react';
import type { OptionSelectProps, SelectOption } from './select-search';
import { OptionSelect } from './select-search';

export type ApiSelectSearchResult<T = unknown> =
  | Array<SelectOption<T>>
  | {
      options: Array<SelectOption<T>>;
    };

export type ApiSelectSearchLoadOptions<T = unknown> = (params: {
  search: string;
  signal: AbortSignal;
}) => Promise<ApiSelectSearchResult<T>>;

export interface ApiSelectSearchProps<T = unknown> extends Omit<
  OptionSelectProps<T>,
  'options' | 'loading' | 'loadingMessage' | 'selectedOption' | 'onSearchChange'
> {
  loadOptions: ApiSelectSearchLoadOptions<T>;
  selectedOption?: SelectOption<T>;
  debounceMs?: number;
  minSearchLength?: number;
  minSearchMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
}

export type ApiOptionSelectResult<T = unknown> = ApiSelectSearchResult<T>;
export type ApiOptionSelectLoadOptions<T = unknown> =
  ApiSelectSearchLoadOptions<T>;
export type ApiOptionSelectProps<T = unknown> = ApiSelectSearchProps<T>;

function normalizeResult<T>(
  result: ApiSelectSearchResult<T>,
): Array<SelectOption<T>> {
  return Array.isArray(result) ? result : result.options;
}

export function ApiSelectSearch<T = unknown>({
  loadOptions,
  selectedOption,
  debounceMs = 300,
  minSearchLength = 0,
  minSearchMessage,
  loadingMessage = 'Đang tải...',
  errorMessage: errorMessageProp = 'Không thể tải dữ liệu',
  onSelect,
  onOpenChange,
  ...props
}: ApiSelectSearchProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Array<SelectOption<T>>>([]);
  const [selectedOptionState, setSelectedOptionState] = useState<
    SelectOption<T> | undefined
  >(selectedOption);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const requestIdRef = useRef(0);
  const loadOptionsRef = useRef(loadOptions);

  useEffect(() => {
    loadOptionsRef.current = loadOptions;
  }, [loadOptions]);

  useEffect(() => {
    setSelectedOptionState(selectedOption);
  }, [selectedOption]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const search = query.trim();

    if (search.length < minSearchLength) {
      setOptions([]);
      setIsLoading(false);
      setErrorMessage(undefined);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      setErrorMessage(undefined);

      try {
        const result = await loadOptionsRef.current({
          search,
          signal: controller.signal,
        });

        if (requestId !== requestIdRef.current || controller.signal.aborted) {
          return;
        }

        setOptions(normalizeResult(result));
      } catch (error) {
        if (requestId !== requestIdRef.current || controller.signal.aborted) {
          return;
        }

        setOptions([]);
        setErrorMessage(
          error instanceof Error ? error.message : errorMessageProp,
        );
      } finally {
        if (requestId === requestIdRef.current && !controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [debounceMs, isOpen, minSearchLength, query, errorMessageProp]);

  const mergedOptions = useMemo(() => {
    const uniqueOptions = new Map<string, SelectOption<T>>();

    if (selectedOptionState) {
      uniqueOptions.set(selectedOptionState.value, selectedOptionState);
    }

    options.forEach((option) => {
      uniqueOptions.set(option.value, option);
    });

    return [...uniqueOptions.values()];
  }, [options, selectedOptionState]);

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    onOpenChange?.(nextOpen);

    if (!nextOpen) {
      setQuery('');
    }
  };

  const handleSelect: NonNullable<OptionSelectProps<T>['onSelect']> = (
    option,
  ) => {
    setSelectedOptionState(option);
    onSelect?.(option);
  };

  const shortQueryMessage =
    minSearchMessage ?? `Nhập ít nhất ${minSearchLength} ký tự để tìm kiếm`;
  const visibleErrorMessage = errorMessage
    ? errorMessage
    : query.trim().length < minSearchLength
      ? shortQueryMessage
      : undefined;

  return (
    <OptionSelect
      {...props}
      options={mergedOptions}
      selectedOption={selectedOptionState}
      loading={isLoading}
      loadingMessage={loadingMessage}
      emptyMessage={visibleErrorMessage ?? props.emptyMessage}
      onSelect={handleSelect}
      onOpenChange={handleOpenChange}
      onSearchChange={setQuery}
    />
  );
}

export const ApiOptionSelect = ApiSelectSearch;
