import { Badge } from '@/components/ui/badge';
import type { ContractVersionStatus } from '../model/contract';

interface ContractVersionBadgeProps {
  versionNo: number;
  status: ContractVersionStatus;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ContractVersionBadge({
  versionNo,
  status,
  label,
  size = 'lg',
}: ContractVersionBadgeProps) {
  const variant =
    status === 'effective'
      ? 'primary'
      : status === 'draft'
        ? 'warning'
        : 'secondary';

  return (
    <Badge variant={variant} appearance="light" size={size} shape="circle">
      v{versionNo}
      {label ? <span className="opacity-75">· {label}</span> : null}
    </Badge>
  );
}
