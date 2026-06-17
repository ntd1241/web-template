import type { VariantProps } from 'class-variance-authority';
import { NumericFormat } from 'react-number-format';
import type {
  NumberFormatValues,
  NumericFormatProps,
} from 'react-number-format';
import { cn } from '@/lib/utils';
import { inputVariants } from '@/components/ui/input';

/**
 * Usage:
 * <NumericInput
 *   value={amount}
 *   onValueChange={(value) => setAmount(value)}
 *   placeholder="Nhập số tiền"
 * />
 */
export interface NumericInputProps
  extends
    Omit<
      NumericFormatProps,
      | 'allowNegative'
      | 'decimalScale'
      | 'decimalSeparator'
      | 'onValueChange'
      | 'thousandSeparator'
      | 'type'
      | 'value'
    >,
    VariantProps<typeof inputVariants> {
  value?: number | string | null;
  onValueChange?: (value: number | undefined) => void;
  allowNegative?: boolean;
  decimalScale?: number;
  thousandSeparator?: string;
  decimalSeparator?: string;
}

export function NumericInput({
  className,
  variant,
  value,
  onValueChange,
  allowNegative = false,
  decimalScale,
  thousandSeparator = '.',
  decimalSeparator = ',',
  ...props
}: NumericInputProps) {
  const handleValueChange = (values: NumberFormatValues) => {
    onValueChange?.(values.value === '' ? undefined : values.floatValue);
  };

  return (
    <NumericFormat
      data-slot="input"
      value={value ?? ''}
      valueIsNumericString={typeof value === 'string'}
      allowNegative={allowNegative}
      decimalScale={decimalScale}
      thousandSeparator={thousandSeparator}
      decimalSeparator={decimalSeparator}
      onValueChange={handleValueChange}
      className={cn(
        inputVariants({ variant }),
        'text-right tabular-nums',
        className,
      )}
      {...props}
    />
  );
}
