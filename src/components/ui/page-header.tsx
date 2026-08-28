import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { PageBackButton } from '@/components/ui/page-back-button';

export type PageHeaderProps = {
  title: ReactNode;
  titleAside?: ReactNode;
  actions?: ReactNode;
  backLabel?: string;
  onBack?: () => void;
  className?: string;
};

export function PageHeader({
  title,
  titleAside,
  actions,
  backLabel = 'Quay lại',
  onBack,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {onBack ? <PageBackButton label={backLabel} onClick={onBack} /> : null}
        <h1 className="shrink-0 text-lg font-semibold text-foreground">
          {title}
        </h1>
        {titleAside ? <div className="min-w-0 flex-1">{titleAside}</div> : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
