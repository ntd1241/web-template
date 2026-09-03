import { formatDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import {
  getContractDateStatus,
  type ContractDateStatusTone,
} from '../model/contract';

const DATE_STATUS_CLASS_NAMES: Record<ContractDateStatusTone, string> = {
  neutral: 'text-muted-foreground',
  warning: 'text-admin-amber-dark',
  destructive: 'text-destructive',
};

export function ContractDateCell({
  date,
  reminderDays,
  emptyLabel,
  today,
}: {
  date: string | null | undefined;
  reminderDays: number;
  emptyLabel: string;
  today?: Date;
}) {
  const status = getContractDateStatus(date, reminderDays, today);

  if (!status || !date) {
    return <span className="text-sm text-muted-foreground">{emptyLabel}</span>;
  }

  return (
    <div className="flex min-w-0 flex-col gap-0.5 text-sm">
      <span>{formatDate(date)}</span>
      {status.tone !== 'neutral' ? (
        <span
          className={cn(
            'text-xs font-medium',
            DATE_STATUS_CLASS_NAMES[status.tone],
          )}
        >
          {status.label}
        </span>
      ) : null}
    </div>
  );
}
