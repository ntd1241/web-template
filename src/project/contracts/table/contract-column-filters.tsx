import type { MultiSelectOption } from '@/components/ui/multi-select';
import type { SelectOption } from '@/components/ui/option-select';
import type { CustomerSelectOption } from '../../customers/api/customers.api';
import { CustomerIdentity } from '../../customers/components/customer-identity';
import { ContractStatusBadge } from '../components/contract-status-badge';
import { CONTRACT_STATUS_LABELS, CONTRACT_STATUSES } from '../model/contract';

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
