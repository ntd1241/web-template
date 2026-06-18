import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { format, isValid, parse } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { CreateEmployeeFormValues } from '../schemas/employee-create.schema';

const DATE_INPUT_FORMAT = 'dd/MM/yyyy';

function formatDateInput(date: Date | null | undefined): string {
  if (!date || !isValid(date)) {
    return '';
  }

  return format(date, DATE_INPUT_FORMAT);
}

function parseDateInput(value: string): Date | undefined {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const parsedDate = parse(trimmedValue, DATE_INPUT_FORMAT, new Date());

  if (
    !isValid(parsedDate) ||
    format(parsedDate, DATE_INPUT_FORMAT) !== trimmedValue
  ) {
    return undefined;
  }

  return parsedDate;
}

/** Trường ngày vào làm nhập được cả bàn phím, paste chuỗi ngày và chọn lịch. */
export function CreateEmployeeStartDateField() {
  const form = useFormContext<CreateEmployeeFormValues>();
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [dateText, setDateText] = useState(() =>
    formatDateInput(form.getValues('startDate')),
  );

  return (
    <FormField
      control={form.control}
      name="startDate"
      render={({ field }) => {
        const selectedDate =
          field.value instanceof Date && isValid(field.value)
            ? field.value
            : undefined;

        const handleStartDateTextChange = (
          event: ChangeEvent<HTMLInputElement>,
        ) => {
          const nextValue = event.target.value;
          setDateText(nextValue);
          field.onChange(parseDateInput(nextValue));
        };

        const handleStartDateBlur = () => {
          field.onBlur();

          const parsedDate = parseDateInput(dateText);
          if (parsedDate) {
            setDateText(formatDateInput(parsedDate));
          }
        };

        const handleStartDateSelect = (date: Date | undefined) => {
          if (!date) {
            return;
          }

          field.onChange(date);
          setDateText(formatDateInput(date));
          setIsStartDateOpen(false);
        };

        return (
          <FormItem>
            <FormLabel>
              Ngày vào làm
              <span className="text-destructive"> *</span>
            </FormLabel>
            <div className="flex w-full">
              <FormControl>
                <Input
                  inputMode="numeric"
                  placeholder="dd/MM/yyyy"
                  value={dateText}
                  onChange={handleStartDateTextChange}
                  onBlur={handleStartDateBlur}
                  className="rounded-e-none border-e-0"
                />
              </FormControl>
              <Popover
                open={isStartDateOpen}
                onOpenChange={setIsStartDateOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    aria-label="Chọn ngày vào làm"
                    variant="outline"
                    mode="input"
                    className={cn(
                      'shrink-0 rounded-s-none px-2.5',
                      !selectedDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarDays />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={vi}
                    selected={selectedDate}
                    onSelect={handleStartDateSelect}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
