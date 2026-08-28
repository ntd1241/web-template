import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/data-grid-columns';
import type { MultiSelectOption } from '@/components/ui/multi-select';
import type { SelectOption } from '@/components/ui/option-select';
import { ROLE_COLOR_LABELS } from '../../model/role-color';
import {
  EMPLOYEE_ACCOUNT_BADGE_CONFIG,
  EmployeeRoleBadge,
} from '../components/employee-badges';
import {
  EMPLOYEE_STATUS_LABELS,
  EMPLOYEE_STATUSES,
  type EmployeeRoleOption,
  type EmployeeStatus,
} from '../model/employee';

export const EMPLOYEE_STATUS_FILTER_OPTIONS: MultiSelectOption[] =
  EMPLOYEE_STATUSES.map((status) => ({
    value: status,
    label: (
      <Badge
        variant={status === 'active' ? 'success' : 'outline'}
        appearance="outline"
        className="rounded-md px-2.5 py-1 text-xs"
      >
        {EMPLOYEE_STATUS_LABELS[status]}
      </Badge>
    ),
    searchableText: EMPLOYEE_STATUS_LABELS[status],
    data: status,
  }));

export const EMPLOYEE_ACCOUNT_FILTER_OPTIONS: SelectOption[] = [
  {
    value: 'linked',
    label: <StatusBadge status="true" config={EMPLOYEE_ACCOUNT_BADGE_CONFIG} />,
    searchableText: 'Đã liên kết',
  },
  {
    value: 'unlinked',
    label: (
      <StatusBadge status="false" config={EMPLOYEE_ACCOUNT_BADGE_CONFIG} />
    ),
    searchableText: 'Chưa liên kết',
  },
];

export function toEmployeeRoleFilterOption(
  role: EmployeeRoleOption,
): MultiSelectOption<EmployeeRoleOption> {
  return {
    value: role.id,
    label: <EmployeeRoleBadge role={{ name: role.name, color: role.color }} />,
    searchableText: `${role.name} ${ROLE_COLOR_LABELS[role.color]}`,
    data: role,
  };
}

export function toEmployeeStatusFilterValue(value: string[]): EmployeeStatus[] {
  return value.filter((status): status is EmployeeStatus =>
    EMPLOYEE_STATUSES.includes(status as EmployeeStatus),
  );
}
