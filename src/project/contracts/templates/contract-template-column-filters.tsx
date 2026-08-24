import type { MultiSelectOption } from '@/components/ui/multi-select';
import {
  CONTRACT_TEMPLATE_STATUS_LABELS,
  CONTRACT_TEMPLATE_STATUSES,
} from '../model/contract-template';
import { ContractTemplateStatusBadge } from './contract-template-status-badge';

export const CONTRACT_TEMPLATE_STATUS_FILTER_OPTIONS: MultiSelectOption[] =
  CONTRACT_TEMPLATE_STATUSES.map((status) => ({
    value: status,
    label: <ContractTemplateStatusBadge status={status} size="sm" />,
    searchableText: CONTRACT_TEMPLATE_STATUS_LABELS[status],
    data: status,
  }));
