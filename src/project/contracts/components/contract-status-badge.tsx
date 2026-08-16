import { Tag } from '@/components/ui/tag';
import {
  CONTRACT_STATUS_LABELS,
  CONTRACT_VERSION_STATUS_LABELS,
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
  active: '#16a34a',
  effective: '#16a34a',
  paid: '#16a34a',
  upcoming: '#2563eb',
  open: '#64748b',
  unpaid: '#64748b',
  draft: '#64748b',
  superseded: '#64748b',
  partially_paid: '#d97706',
  overdue: '#d97706',
  suspended: '#d97706',
  voided: '#dc2626',
  cancelled: '#dc2626',
  terminated: '#dc2626',
  expired: '#64748b',
};

const STATUS_LABELS: Record<string, string> = {
  ...CONTRACT_STATUS_LABELS,
  ...CONTRACT_VERSION_STATUS_LABELS,
  ...CONTRACT_CHARGE_STATUS_LABELS,
  ...CONTRACT_CHARGE_DISPLAY_STATUS_LABELS,
};

export interface ContractStatusBadgeProps {
  status: ContractBadgeStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function ContractStatusBadge({
  status,
  size = 'sm',
}: ContractStatusBadgeProps) {
  return (
    <Tag size={size} shape="circle" color={STATUS_COLORS[status] ?? '#64748b'}>
      {STATUS_LABELS[status] ?? status}
    </Tag>
  );
}
