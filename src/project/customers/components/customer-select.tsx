import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { useTenant } from '@/providers/tenant-provider';
import { useUser } from '@/providers/user-provider';
import {
  SelectSearch,
  type SearchSelectOption,
  type SelectSearchProps,
} from '@/components/ui/select-search';
import {
  loadCustomerSelectOptions,
  type CustomerSelectOption,
} from '../api/customers.api';
import { CustomerIdentity } from './customer-identity';

export type { CustomerSelectOption } from '../api/customers.api';

export interface CustomerSelectProps extends Omit<
  SelectSearchProps<CustomerSelectOption>,
  | 'options'
  | 'loading'
  | 'loadingMessage'
  | 'onSelect'
  | 'selectedOption'
  | 'renderOption'
> {
  selectedCustomer?: CustomerSelectOption;
  onSelect?: (customer: CustomerSelectOption | undefined) => void;
}

function toOption(
  customer: CustomerSelectOption,
): SearchSelectOption<CustomerSelectOption> {
  return {
    value: customer.id,
    label: <CustomerIdentity customer={customer} />,
    searchableText: `${customer.name} ${customer.customerCode}`,
    data: customer,
  };
}

export function CustomerSelect({
  value = '',
  selectedCustomer,
  placeholder = 'Chọn khách hàng',
  searchPlaceholder = 'Tìm khách hàng...',
  emptyMessage = 'Không tìm thấy khách hàng',
  disabled = false,
  className,
  onSelect,
  ...props
}: CustomerSelectProps) {
  const { userId } = useUser();
  const { tenantId } = useTenant();
  const query = useQuery({
    queryKey: ['project', 'customers', 'select-options', userId, tenantId],
    queryFn: () => {
      if (!userId || !tenantId) {
        throw new Error('Chưa xác định tổ chức hiện tại.');
      }
      return loadCustomerSelectOptions(userId, tenantId);
    },
    enabled: Boolean(userId && tenantId),
    staleTime: 5 * 60 * 1000,
  });

  const options = useMemo(() => (query.data ?? []).map(toOption), [query.data]);
  const selectedOption = selectedCustomer
    ? toOption(selectedCustomer)
    : undefined;

  return (
    <SelectSearch
      {...props}
      value={value}
      options={options}
      selectedOption={selectedOption}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={
        query.isError ? getApiErrorMessage(query.error) : emptyMessage
      }
      loading={query.isPending}
      loadingMessage="Đang tải danh sách khách hàng..."
      disabled={disabled || !userId || !tenantId}
      renderOption={(option) => option.label}
      className={cn(
        'h-auto min-h-14 border-transparent bg-transparent py-2 shadow-none hover:bg-accent data-[state=open]:bg-accent',
        className,
      )}
      onSelect={(option) => onSelect?.(option?.data)}
    />
  );
}
