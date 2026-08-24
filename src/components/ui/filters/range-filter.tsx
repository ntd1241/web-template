import type { ReactNode } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { formatDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import { useNumberFormat } from '@/providers/number-format-provider';
import { Button } from '@/components/ui/button';
import { DatePickerInput } from '@/components/ui/inputs/date-picker-input';
import { NumericInput } from '@/components/ui/inputs/numeric-input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface NumberRangeValue {
  min?: number;
  max?: number;
}

export interface DateRangeValue {
  from?: string;
  to?: string;
}

interface RangeFilterPopoverProps {
  active: boolean;
  summary: string;
  placeholder: string;
  ariaLabel: string;
  onClear: () => void;
  children: ReactNode;
}

function RangeFilterPopover({
  active,
  summary,
  placeholder,
  ariaLabel,
  onClear,
  children,
}: RangeFilterPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={ariaLabel}
          className="h-7 min-h-7 w-full shrink-0 justify-between gap-1 px-2.5 text-xs font-normal"
        >
          <span
            className={cn(
              'min-w-0 truncate text-start',
              !active && 'text-muted-foreground',
            )}
          >
            {active ? summary : placeholder}
          </span>
          <SlidersHorizontal className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-3">
          {children}
          {active && (
            <div className="border-t border-border pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-center"
                onClick={onClear}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function NumberRangeFilter({
  value,
  onChange,
  placeholder = 'Mọi giá trị',
  label = 'Khoảng giá trị',
}: {
  value: NumberRangeValue;
  onChange: (value: NumberRangeValue) => void;
  placeholder?: string;
  label?: string;
}) {
  const { formatCompactCurrency } = useNumberFormat();
  const active = value.min !== undefined || value.max !== undefined;
  const summary =
    value.min !== undefined && value.max !== undefined
      ? `${formatCompactCurrency(value.min)} – ${formatCompactCurrency(value.max)}`
      : value.min !== undefined
        ? `Từ ${formatCompactCurrency(value.min)}`
        : `Đến ${formatCompactCurrency(value.max ?? 0)}`;

  return (
    <RangeFilterPopover
      active={active}
      summary={summary}
      placeholder={placeholder}
      ariaLabel={label}
      onClear={() => onChange({})}
    >
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">{label}</p>
        <div className="grid grid-cols-2 gap-2">
          <NumericInput
            aria-label={`${label} từ`}
            variant="md"
            placeholder="Từ"
            value={value.min}
            onValueChange={(min) => onChange({ ...value, min })}
            className="text-left"
          />
          <NumericInput
            aria-label={`${label} đến`}
            variant="md"
            placeholder="Đến"
            value={value.max}
            onValueChange={(max) => onChange({ ...value, max })}
            className="text-left"
          />
        </div>
      </div>
    </RangeFilterPopover>
  );
}

export function DateRangeFilter({
  value,
  onChange,
  placeholder = 'Mọi ngày',
  label = 'Khoảng ngày',
}: {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  placeholder?: string;
  label?: string;
}) {
  const active = Boolean(value.from || value.to);
  const summary =
    value.from && value.to
      ? `${formatDate(value.from)} – ${formatDate(value.to)}`
      : value.from
        ? `Từ ${formatDate(value.from)}`
        : `Đến ${formatDate(value.to)}`;

  return (
    <RangeFilterPopover
      active={active}
      summary={summary}
      placeholder={placeholder}
      ariaLabel={label}
      onClear={() => onChange({})}
    >
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">{label}</p>
        <div className="grid grid-cols-2 gap-2">
          <DatePickerInput
            aria-label={`${label} từ`}
            calendarLabel={`Chọn ${label.toLowerCase()} từ`}
            variant="md"
            placeholder="Từ ngày"
            value={value.from}
            valueMode="iso-date"
            onChange={(from) =>
              onChange({
                ...value,
                from: typeof from === 'string' ? from : undefined,
              })
            }
          />
          <DatePickerInput
            aria-label={`${label} đến`}
            calendarLabel={`Chọn ${label.toLowerCase()} đến`}
            variant="md"
            placeholder="Đến ngày"
            value={value.to}
            valueMode="iso-date"
            onChange={(to) =>
              onChange({
                ...value,
                to: typeof to === 'string' ? to : undefined,
              })
            }
          />
        </div>
      </div>
    </RangeFilterPopover>
  );
}
