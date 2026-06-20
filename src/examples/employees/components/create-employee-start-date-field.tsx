import { isValid } from 'date-fns';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DatePickerInput } from '@/components/ui/inputs/date-picker-input';
import type { CreateEmployeeFormValues } from '../schemas/employee-create.schema';

/** Trường ngày vào làm nhập được cả bàn phím, paste chuỗi ngày và chọn lịch. */
export function CreateEmployeeStartDateField() {
  const form = useFormContext<CreateEmployeeFormValues>();

  return (
    <FormField
      control={form.control}
      name="startDate"
      render={({ field }) => {
        const selectedDate =
          field.value instanceof Date && isValid(field.value)
            ? field.value
            : undefined;

        return (
          <FormItem>
            <FormLabel>
              Ngày vào làm
              <span className="text-destructive"> *</span>
            </FormLabel>
            <FormControl>
              <DatePickerInput
                value={selectedDate}
                onChange={field.onChange}
                onBlur={field.onBlur}
                calendarLabel="Chọn ngày vào làm"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
