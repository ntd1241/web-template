import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ColorSelectOption<T extends string = string> {
  value: T;
  label: string;
  swatchClassName?: string;
  swatchStyle?: React.CSSProperties;
  textClassName?: string;
}

export interface ColorSelectProps<T extends string = string> {
  value: T;
  options: readonly ColorSelectOption<T>[];
  onValueChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
}

function ColorSwatch({
  className,
  style,
}: Pick<ColorSelectOption, 'swatchClassName' | 'swatchStyle'>) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-4 shrink-0 items-center justify-center rounded-sm border align-middle',
        className,
      )}
      style={style}
    />
  );
}

export function ColorSelect<T extends string>({
  value,
  options,
  onValueChange,
  placeholder = 'Chọn màu',
  className,
  contentClassName,
  disabled,
}: ColorSelectProps<T>) {
  const selectedOption = options.find((option) => option.value === value);

  const optionContent = (option: ColorSelectOption<T>) => (
    <span className="inline-flex min-w-0 items-center gap-2 align-middle leading-normal">
      <ColorSwatch
        className={option.swatchClassName}
        style={option.swatchStyle}
      />
      <span className={option.textClassName}>{option.label}</span>
    </span>
  );

  return (
    <Select
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as T)}
      disabled={disabled}
    >
      <SelectTrigger className={cn('items-center', className)}>
        <SelectValue
          className="!flex min-w-0 items-center leading-normal"
          placeholder={placeholder}
        >
          {selectedOption ? optionContent(selectedOption) : placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {optionContent(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
