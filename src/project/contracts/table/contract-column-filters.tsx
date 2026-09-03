import type { MultiSelectOption } from '@/components/ui/multi-select';
import type { SelectOption } from '@/components/ui/option-select';
import type { CustomerSelectOption } from '../../customers/api/customers.api';
import { CustomerIdentity } from '../../customers/components/customer-identity';
import { ContractStatusBadge } from '../components/contract-status-badge';
import { CONTRACT_STATUS_LABELS, CONTRACT_STATUSES } from '../model/contract';
import {
  ContractCustomerColumnFilter,
  ContractTextColumnFilter,
} from './contract-column-filters.generated';

export interface ContractIdentityColumnFilterProps {
  contractSearch: string;
  onContractSearchChange: (value: string) => void;
  customerId: string;
  customerOptions: CustomerSelectOption[];
  customerOptionsLoading?: boolean;
  onCustomerIdChange: (value: string) => void;
}

export function ContractIdentityColumnFilter({
  contractSearch,
  onContractSearchChange,
  customerId,
  customerOptions,
  customerOptionsLoading = false,
  onCustomerIdChange,
}: ContractIdentityColumnFilterProps) {
  return (
    <div className="grid min-w-0 grid-cols-2 gap-1.5">
      <ContractTextColumnFilter
        value={contractSearch}
        onChange={onContractSearchChange}
      />
      <ContractCustomerColumnFilter
        value={customerId}
        options={customerOptions.map(toContractCustomerFilterOption)}
        loading={customerOptionsLoading}
        disabled={customerOptionsLoading && customerOptions.length === 0}
        triggerContent={renderContractCustomerFilterTrigger}
        renderOption={(option) => option.label}
        onChange={onCustomerIdChange}
      />
    </div>
  );
}

function toCustomerOption(
  customer: CustomerSelectOption,
): SelectOption<CustomerSelectOption> {
  return {
    value: customer.id,
    label: <CustomerIdentity customer={customer} />,
    searchableText: `${customer.name} ${customer.customerCode}`,
    data: customer,
  };
}

function renderTrigger(option: SelectOption | undefined) {
  const customer = option?.data as CustomerSelectOption | undefined;
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

export function toContractCustomerFilterOption(
  customer: CustomerSelectOption,
): SelectOption {
  return toCustomerOption(customer);
}

export function renderContractCustomerFilterTrigger(
  option: SelectOption | undefined,
) {
  return renderTrigger(option);
}

export const CONTRACT_STATUS_FILTER_OPTIONS: MultiSelectOption[] =
  CONTRACT_STATUSES.map((status) => ({
    value: status,
    label: <ContractStatusBadge status={status} size="sm" />,
    searchableText: CONTRACT_STATUS_LABELS[status],
    data: status,
  }));
