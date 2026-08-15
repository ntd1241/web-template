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
import type { ContractFormValues } from '../model/contract';

const CURRENCY_OPTIONS = [{ value: 'VND', label: 'VND - Việt Nam đồng' }];

export function ContractCurrencyField({
  form,
}: {
  form: UseFormReturn<ContractFormValues>;
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
                {CURRENCY_OPTIONS.map((option) => (
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
