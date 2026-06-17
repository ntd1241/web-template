import { cn } from '@/lib/utils';
import { Badge, BadgeDot, type BadgeProps } from '@/components/ui/badge';

export type StatusBadgeConfig<TStatus extends string> = Record<
  TStatus,
  {
    label: string;
    variant?: BadgeProps['variant'];
    dotClassName?: string;
    className?: string;
  }
>;

export interface StatusBadgeProps<TStatus extends string> {
  status: TStatus | string | null | undefined;
  config: StatusBadgeConfig<TStatus>;
}

export function StatusBadge<TStatus extends string>({
  status,
  config,
}: StatusBadgeProps<TStatus>) {
  const rawStatus = status ?? '';
  const statusConfig = config[rawStatus as TStatus];

  if (!statusConfig) {
    return <span>{rawStatus}</span>;
  }

  return (
    <Badge
      variant={statusConfig.variant}
      className={cn('gap-1.5', statusConfig.className)}
    >
      {statusConfig.dotClassName && (
        <BadgeDot className={statusConfig.dotClassName} />
      )}
      {statusConfig.label}
    </Badge>
  );
}
