import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  OptionSelect,
  type OptionSelectProps,
} from '@/components/ui/option-select';
import {
  BUSINESS_TYPE_LABELS,
  BUSINESS_TYPES,
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_STATUSES,
  type BusinessType,
  type CustomerStatus,
} from '../model/customer';

type CustomerSelectSize = OptionSelectProps['size'];

interface CustomerFilterSelectBaseProps {
  className?: string;
  disabled?: boolean;
  'aria-invalid'?: boolean;
  size?: CustomerSelectSize;
  placeholder?: string;
}

function BusinessTypeBadge({ value }: { value: BusinessType }) {
  return (
    <Badge
      appearance="outline"
      variant="outline"
      className="rounded-md px-2.5 py-1 text-xs"
    >
      {BUSINESS_TYPE_LABELS[value]}
    </Badge>
  );
}

const BUSINESS_TYPE_OPTIONS = BUSINESS_TYPES.map((value) => ({
  value,
  label: BUSINESS_TYPE_LABELS[value],
  searchableText: BUSINESS_TYPE_LABELS[value],
}));

function CustomerStatusBadge({ value }: { value: CustomerStatus }) {
  return (
    <Badge
      appearance={value === 'active' ? 'light' : 'outline'}
      variant={value === 'active' ? 'success' : 'outline'}
      className="rounded-md px-2.5 py-1 text-xs"
    >
      {CUSTOMER_STATUS_LABELS[value]}
    </Badge>
  );
}

const CUSTOMER_STATUS_OPTIONS = CUSTOMER_STATUSES.map((value) => ({
  value,
  label: CUSTOMER_STATUS_LABELS[value],
  searchableText: CUSTOMER_STATUS_LABELS[value],
}));

export interface CustomerBusinessTypeSelectProps extends CustomerFilterSelectBaseProps {
  value?: BusinessType;
  onChange: (value?: BusinessType) => void;
}

export function CustomerBusinessTypeSelect({
  value,
  onChange,
  className,
  disabled,
  size = 'md',
  placeholder = 'Tất cả',
  'aria-invalid': ariaInvalid,
}: CustomerBusinessTypeSelectProps) {
  return (
    <OptionSelect
      value={value ?? ''}
      onChange={(nextValue) =>
        onChange((nextValue || undefined) as BusinessType | undefined)
      }
      options={BUSINESS_TYPE_OPTIONS}
      canDeselect
      searchable={false}
      placeholder={placeholder}
      size={size}
      aria-invalid={ariaInvalid}
      renderOption={(option) => (
        <BusinessTypeBadge value={option.value as BusinessType} />
      )}
      triggerContent={(option) =>
        option ? (
          <BusinessTypeBadge value={option.value as BusinessType} />
        ) : undefined
      }
      disabled={disabled}
      className={cn('w-full', className)}
    />
  );
}

export interface CustomerStatusSelectProps extends CustomerFilterSelectBaseProps {
  value?: CustomerStatus;
  onChange: (value?: CustomerStatus) => void;
}

export function CustomerStatusSelect({
  value,
  onChange,
  className,
  disabled,
  size = 'md',
  placeholder = 'Tất cả',
  'aria-invalid': ariaInvalid,
}: CustomerStatusSelectProps) {
  return (
    <OptionSelect
      value={value ?? ''}
      onChange={(nextValue) =>
        onChange((nextValue || undefined) as CustomerStatus | undefined)
      }
      options={CUSTOMER_STATUS_OPTIONS}
      canDeselect
      searchable={false}
      placeholder={placeholder}
      size={size}
      aria-invalid={ariaInvalid}
      renderOption={(option) => (
        <CustomerStatusBadge value={option.value as CustomerStatus} />
      )}
      triggerContent={(option) =>
        option ? (
          <CustomerStatusBadge value={option.value as CustomerStatus} />
        ) : undefined
      }
      disabled={disabled}
      className={cn('w-full', className)}
    />
  );
}
