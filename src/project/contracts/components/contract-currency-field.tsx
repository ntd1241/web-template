import type { UseFormReturn } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CurrencyOption } from '../../model/currency';
import type { ContractFormValues } from '../model/contract';

export function ContractCurrencyField({
  form,
  options,
}: {
  form: UseFormReturn<ContractFormValues>;
  options: CurrencyOption[];
}) {
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="currencyCode"
        render={({ field }) => (
          <FormItem variant="compact">
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger size="sm">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
}
