import { Badge } from '@/components/ui/badge';
import type { MultiSelectOption } from '@/components/ui/multi-select';
import {
  BUSINESS_TYPE_LABELS,
  BUSINESS_TYPES,
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_STATUSES,
} from '../model/customer';

export const CUSTOMER_BUSINESS_TYPE_FILTER_OPTIONS: MultiSelectOption[] =
  BUSINESS_TYPES.map((businessType) => ({
    value: businessType,
    label: (
      <Badge
        appearance="outline"
        variant="outline"
        className="rounded-md px-2.5 py-1 text-xs"
      >
        {BUSINESS_TYPE_LABELS[businessType]}
      </Badge>
    ),
    searchableText: BUSINESS_TYPE_LABELS[businessType],
    data: businessType,
  }));

export const CUSTOMER_STATUS_FILTER_OPTIONS: MultiSelectOption[] =
  CUSTOMER_STATUSES.map((status) => ({
    value: status,
    label: (
      <Badge
        appearance={status === 'active' ? 'light' : 'outline'}
        variant={status === 'active' ? 'success' : 'outline'}
        className="rounded-md px-2.5 py-1 text-xs"
      >
        {CUSTOMER_STATUS_LABELS[status]}
      </Badge>
    ),
    searchableText: CUSTOMER_STATUS_LABELS[status],
    data: status,
  }));
