import {
  StatusBadge,
  type StatusBadgeConfig,
} from '@/components/ui/data-grid-columns';
import {
  CONTRACT_TEMPLATE_STATUS_LABELS,
  type ContractTemplateStatus,
} from '../model/contract-template';

const config: StatusBadgeConfig<ContractTemplateStatus> = {
  draft: {
    label: CONTRACT_TEMPLATE_STATUS_LABELS.draft,
    className:
      'rounded-md border-transparent bg-muted px-2.5 py-1 text-xs text-muted-foreground',
    dotClassName: 'bg-muted-foreground opacity-100',
  },
  published: {
    label: CONTRACT_TEMPLATE_STATUS_LABELS.published,
    className:
      'rounded-md border-transparent bg-admin-success-bg px-2.5 py-1 text-xs text-admin-success-text',
    dotClassName: 'bg-admin-success-dot opacity-100',
  },
  archived: {
    label: CONTRACT_TEMPLATE_STATUS_LABELS.archived,
    className:
      'rounded-md border-transparent bg-muted px-2.5 py-1 text-xs text-muted-foreground',
    dotClassName: 'bg-muted-foreground opacity-100',
  },
};

export function ContractTemplateStatusBadge({
  status,
  size = 'md',
}: {
  status: ContractTemplateStatus;
  size?: 'sm' | 'md' | 'lg';
}) {
  return <StatusBadge status={status} config={config} size={size} />;
}
