import {
  DateRangeFilter,
  NumberRangeFilter,
  type DateRangeValue,
  type NumberRangeValue,
} from '@/components/ui/filters/range-filter';
import {
  SelectSearch,
  type SearchSelectOption,
} from '@/components/ui/select-search';
import {
  MultiSelect,
  type MultiSelectOption,
} from '@/components/ui/multi-select';
import { SearchInput } from '@/components/ui/inputs/search-input';
import type { CustomerSelectOption } from '../../customers/api/customers.api';
import { CustomerIdentity } from '../../customers/components/customer-identity';
import { ContractStatusBadge } from '../components/contract-status-badge';
import {
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUSES,
  type ContractStatus,
} from '../model/contract';

interface ContractCustomerColumnFilterProps {
  customerId: string;
  customerOptions: CustomerSelectOption[];
  customerOptionsLoading?: boolean;
  onCustomerIdChange: (value: string) => void;
}

function toCustomerOption(
  customer: CustomerSelectOption,
): SearchSelectOption<CustomerSelectOption> {
  return {
    value: customer.id,
    label: <CustomerIdentity customer={customer} />,
    searchableText: `${customer.name} ${customer.customerCode}`,
    data: customer,
  };
}

function renderTrigger(
  option: SearchSelectOption<CustomerSelectOption> | undefined,
) {
  const customer = option?.data;
  if (!customer) return null;

  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="min-w-0 truncate">{customer.name}</span>
      <span className="shrink-0 text-disabled-foreground">
        ({customer.customerCode})
      </span>
    </span>
  );
}

export function ContractCustomerColumnFilter({
  customerId,
  customerOptions,
  customerOptionsLoading = false,
  onCustomerIdChange,
}: ContractCustomerColumnFilterProps) {
  const options = customerOptions.map(toCustomerOption);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5 font-normal">
      <SelectSearch
        value={customerId}
        options={options}
        placeholder=""
        searchPlaceholder="Tìm khách hàng..."
        triggerContent={renderTrigger}
        loading={customerOptionsLoading}
        loadingMessage="Đang tải khách hàng..."
        disabled={customerOptionsLoading && options.length === 0}
        className="h-7 min-h-7 min-w-0 flex-1 rounded-md bg-background px-2.5 text-xs"
        onChange={onCustomerIdChange}
        renderOption={(option) => option.label}
      />
    </div>
  );
}

export function ContractTextColumnFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <SearchInput
      value={value}
      onSearch={onChange}
      debounceMs={300}
      variant="sm"
      background="background"
      placeholder=""
      aria-label="Tìm theo tên hoặc mã hợp đồng"
      className="min-w-0 w-full shrink-0"
    />
  );
}

interface ContractStatusColumnFilterProps {
  value: ContractStatus[];
  onChange: (value: ContractStatus[]) => void;
}

export function ContractStatusColumnFilter({
  value,
  onChange,
}: ContractStatusColumnFilterProps) {
  const options: MultiSelectOption<ContractStatus>[] = CONTRACT_STATUSES.map(
    (status) => ({
      value: status,
      label: <ContractStatusBadge status={status} size="sm" />,
      searchableText: CONTRACT_STATUS_LABELS[status],
      data: status,
    }),
  );

  return (
    <MultiSelect
      value={value}
      options={options}
      placeholder=""
      searchPlaceholder="Tìm trạng thái..."
      maxChips={0}
      className="h-7 min-h-7 min-w-0 rounded-md bg-background px-2.5 text-xs"
      onChange={onChange}
    />
  );
}

export function ContractOutstandingColumnFilter({
  value,
  onChange,
}: {
  value: NumberRangeValue;
  onChange: (value: NumberRangeValue) => void;
}) {
  return (
    <div className="min-w-0 w-full">
      <NumberRangeFilter
        value={value}
        onChange={onChange}
        label="Còn phải thu"
        placeholder=""
      />
    </div>
  );
}

export function ContractNextDueDateColumnFilter({
  value,
  onChange,
}: {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}) {
  return (
    <div className="min-w-0 w-full">
      <DateRangeFilter
        value={value}
        onChange={onChange}
        label="Hạn gần nhất"
        placeholder=""
      />
    </div>
  );
}
