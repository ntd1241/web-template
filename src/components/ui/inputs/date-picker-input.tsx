import { useEffect, useState } from 'react';
import type { ChangeEvent, ComponentProps, FocusEvent } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { format, isValid, parse } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Input, type inputVariants } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const DATE_INPUT_FORMAT = 'dd/MM/yyyy';

function formatDateInput(date: Date | null | undefined): string {
  if (!date || !isValid(date)) return '';
  return format(date, DATE_INPUT_FORMAT);
}

function parseDateInput(value: string): Date | undefined {
  const trimmedValue = value.trim();
  if (!trimmedValue) return undefined;

  const parsedDate = parse(trimmedValue, DATE_INPUT_FORMAT, new Date());
  if (
    !isValid(parsedDate) ||
    format(parsedDate, DATE_INPUT_FORMAT) !== trimmedValue
  ) {
    return undefined;
  }

  return parsedDate;
}

export interface DatePickerInputProps
  extends
    Omit<
      ComponentProps<typeof Input>,
      'onBlur' | 'onChange' | 'type' | 'value'
    >,
    VariantProps<typeof inputVariants> {
  value?: Date | null;
  onChange?: (value: Date | undefined) => void;
  onBlur?: (event?: FocusEvent<HTMLInputElement>) => void;
  calendarLabel?: string;
}

export function DatePickerInput({
  className,
  value,
  onChange,
  onBlur,
  variant,
  placeholder = DATE_INPUT_FORMAT,
  calendarLabel = 'Chọn ngày',
  ...props
}: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dateText, setDateText] = useState(() => formatDateInput(value));
  const selectedDate =
    value instanceof Date && isValid(value) ? value : undefined;

  useEffect(() => {
    setDateText(formatDateInput(value));
  }, [value]);

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setDateText(nextValue);
    onChange?.(parseDateInput(nextValue));
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    onBlur?.(event);

    const parsedDate = parseDateInput(dateText);
    if (parsedDate) {
      setDateText(formatDateInput(parsedDate));
    }
  };

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;

    onChange?.(date);
    setDateText(formatDateInput(date));
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <Input
        {...props}
        inputMode="numeric"
        placeholder={placeholder}
        value={dateText}
        variant={variant}
        className={cn('pe-9', className)}
        onBlur={handleBlur}
        onChange={handleTextChange}
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={calendarLabel}
            className={cn(
              'absolute inset-y-px end-px inline-flex w-8 items-center justify-center rounded-e-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
              !selectedDate && 'text-muted-foreground',
            )}
          >
            <CalendarDays className="size-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={vi}
            selected={selectedDate}
            onSelect={handleSelect}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
