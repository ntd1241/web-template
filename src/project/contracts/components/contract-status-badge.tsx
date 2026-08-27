import {
  StatusBadge,
  type StatusBadgeConfig,
} from '@/components/ui/data-grid-columns';
import { Tag } from '@/components/ui/tag';
import {
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUSES,
  CONTRACT_VERSION_STATUS_LABELS,
  type ContractCashflowDirection,
  type ContractStatus,
  type ContractVersionStatus,
} from '../model/contract';
import {
  CONTRACT_CHARGE_DISPLAY_STATUS_LABELS,
  CONTRACT_CHARGE_STATUS_LABELS,
  type ContractChargeDisplayStatus,
  type ContractChargeStatus,
} from '../model/receivable';

type ContractBadgeStatus =
  | ContractStatus
  | ContractVersionStatus
  | ContractChargeStatus
  | ContractChargeDisplayStatus
  | string;

const STATUS_COLORS: Record<string, string> = {
  projected: '#64748b',
  active: '#16a34a',
  effective: '#16a34a',
  paid: '#16a34a',
  upcoming: '#2563eb',
  open: '#64748b',
  unpaid: '#dc2626',
  not_due: '#64748b',
  draft: '#64748b',
  superseded: '#64748b',
  partially_paid: '#ca8a04',
  overdue: '#d97706',
  suspended: '#d97706',
  voided: '#dc2626',
  cancelled: '#dc2626',
  terminated: '#64748b',
  expired: '#dc2626',
};

export const CONTRACT_STATUS_BADGE_CONFIG: StatusBadgeConfig<ContractStatus> = {
  draft: {
    label: 'Bản nháp',
    variant: 'outline',
    className: 'rounded-md px-2.5 py-1 text-xs text-muted-foreground',
  },
  active: {
    label: 'Đang hiệu lực',
    className:
      'rounded-md border-transparent bg-admin-success-bg px-2.5 py-1 text-xs text-admin-success-text',
    dotClassName: 'bg-admin-success-dot opacity-100',
  },
  suspended: {
    label: 'Tạm dừng',
    className:
      'rounded-md border-transparent bg-admin-amber-bg px-2.5 py-1 text-xs text-admin-amber-dark',
    dotClassName: 'bg-admin-amber-primary opacity-100',
  },
  expired: {
    label: 'Hết hạn',
    className:
      'rounded-md border-transparent bg-admin-red-bg px-2.5 py-1 text-xs text-admin-red-dark',
    dotClassName: 'bg-admin-red-primary opacity-100',
  },
  terminated: {
    label: 'Đã chấm dứt',
    className:
      'rounded-md border-transparent bg-muted px-2.5 py-1 text-xs text-muted-foreground',
    dotClassName: 'bg-muted-foreground opacity-100',
  },
};

const STATUS_LABELS: Record<string, string> = {
  ...CONTRACT_STATUS_LABELS,
  ...CONTRACT_VERSION_STATUS_LABELS,
  ...CONTRACT_CHARGE_STATUS_LABELS,
  ...CONTRACT_CHARGE_DISPLAY_STATUS_LABELS,
};

const CASHFLOW_STATUS_LABELS: Record<
  ContractCashflowDirection,
  Partial<Record<ContractChargeDisplayStatus, string>>
> = {
  receivable: {
    projected: 'Dự kiến thu',
    upcoming: 'Sắp tới hạn thu',
    unpaid: 'Chưa thu',
    partially_paid: 'Đã thu một phần',
    not_due: 'Chưa tới hạn thu',
    paid: 'Đã thu',
    overdue: 'Chưa thu',
    voided: 'Đã hủy',
  },
  payable: {
    projected: 'Dự kiến trả',
    upcoming: 'Sắp tới hạn trả',
    unpaid: 'Chưa trả',
    partially_paid: 'Đã trả một phần',
    not_due: 'Chưa tới hạn trả',
    paid: 'Đã trả',
    overdue: 'Chưa trả',
    voided: 'Đã hủy',
  },
};

export interface ContractStatusBadgeProps {
  status: ContractBadgeStatus;
  size?: 'sm' | 'md' | 'lg';
  direction?: ContractCashflowDirection;
  showDot?: boolean;
}

export function ContractStatusBadge({
  status,
  size = 'md',
  direction,
  showDot = false,
}: ContractStatusBadgeProps) {
  if (CONTRACT_STATUSES.includes(status as ContractStatus)) {
    return (
      <StatusBadge
        status={status}
        config={CONTRACT_STATUS_BADGE_CONFIG}
        size={size}
      />
    );
  }

  const directionLabel =
    direction &&
    CASHFLOW_STATUS_LABELS[direction][status as ContractChargeDisplayStatus];
  const colorStatus = direction && status === 'overdue' ? 'unpaid' : status;

  return (
    <Tag
      size={size}
      shape="circle"
      color={STATUS_COLORS[colorStatus] ?? '#64748b'}
    >
      {showDot && (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-current"
        />
      )}
      {directionLabel ?? STATUS_LABELS[status] ?? status}
    </Tag>
  );
}
