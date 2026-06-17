import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, ComponentProps } from 'react';
import { Search, X } from 'lucide-react';
import { debounce } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, InputWrapper } from '@/components/ui/input';

export interface SearchInputProps extends Omit<
  ComponentProps<typeof Input>,
  'onChange' | 'type' | 'value'
> {
  value?: string;
  onSearch?: (value: string) => void;
  debounceMs?: number;
}

export function SearchInput({
  value = '',
  onSearch,
  debounceMs = 300,
  placeholder = 'Tìm kiếm...',
  className,
  variant,
  disabled,
  ...props
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const cancelTokenRef = useRef(0);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const debouncedSearch = useMemo(
    () =>
      debounce((nextValue: unknown, token: unknown) => {
        if (
          typeof nextValue === 'string' &&
          typeof token === 'number' &&
          token === cancelTokenRef.current
        ) {
          onSearchRef.current?.(nextValue);
        }
      }, debounceMs),
    [debounceMs],
  );

  useEffect(() => {
    return () => {
      cancelTokenRef.current += 1;
    };
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    const nextToken = cancelTokenRef.current + 1;

    cancelTokenRef.current = nextToken;
    setInputValue(nextValue);
    debouncedSearch(nextValue, nextToken);
  };

  const handleClear = () => {
    cancelTokenRef.current += 1;
    setInputValue('');
    onSearchRef.current?.('');
  };

  return (
    <InputWrapper
      variant={variant}
      className={cn('bg-field text-foreground', className)}
    >
      <Search className="text-muted-foreground" aria-hidden="true" />
      <Input
        {...props}
        type="search"
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleChange}
      />
      {inputValue ? (
        <Button
          type="button"
          variant="ghost"
          mode="icon"
          size="sm"
          aria-label="Xóa tìm kiếm"
          disabled={disabled}
          onClick={handleClear}
          className="-me-1 size-6 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </InputWrapper>
  );
}
