import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  CardDescription,
  CardHeader,
  CardHeading,
  CardTitle,
  CardToolbar,
} from './card';

export type DataGridHeaderVariant = 'title' | 'stats';

export interface DataGridHeaderProps {
  variant?: DataGridHeaderVariant;
  title?: ReactNode;
  description?: ReactNode;
  stats?: ReactNode;
  toolbar?: ReactNode;
  className?: string;
}

/**
 * Shared table header preset for list pages. Keep the title variant available
 * for legacy tables while allowing newer pages to lead with filterable stats.
 */
export function DataGridHeader({
  variant = 'title',
  title,
  description,
  stats,
  toolbar,
  className,
}: DataGridHeaderProps) {
  const leadingContent =
    variant === 'stats' ? (
      stats
    ) : (
      <CardHeading>
        {title ? <CardTitle>{title}</CardTitle> : null}
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeading>
    );

  return (
    <CardHeader
      className={cn(
        'flex-col items-stretch gap-4 xl:flex-row xl:items-center xl:justify-between',
        className,
      )}
    >
      <div className="min-w-0">{leadingContent}</div>
      {toolbar ? (
        <CardToolbar className="flex-wrap">{toolbar}</CardToolbar>
      ) : null}
    </CardHeader>
  );
}
