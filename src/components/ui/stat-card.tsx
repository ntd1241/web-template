import type { HTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  icon?: LucideIcon;
  emphasis?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  emphasis = false,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      data-slot="stat-card"
      className={cn('rounded-lg border border-border px-4 py-3', className)}
      {...props}
    >
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className={cn(
              'mt-1 text-base font-semibold tabular-nums text-foreground',
              emphasis && 'font-bold text-primary',
            )}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
