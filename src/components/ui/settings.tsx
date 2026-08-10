import * as React from 'react';
import { cn } from '@/lib/utils';

type SettingsRowProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  control?: React.ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
  controlClassName?: string;
};

function SettingsGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="settings-group"
      className={cn(
        'divide-y divide-border rounded-lg border border-border/70',
        className,
      )}
      {...props}
    />
  );
}

function SettingsRow({
  title,
  description,
  control,
  titleClassName,
  descriptionClassName,
  controlClassName,
  className,
  ...props
}: SettingsRowProps) {
  return (
    <div
      data-slot="settings-row"
      className={cn(
        'flex items-center justify-between gap-4 px-4 py-3.5',
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        <div
          data-slot="settings-row-title"
          className={cn('text-sm font-medium text-foreground', titleClassName)}
        >
          {title}
        </div>
        {description !== undefined && description !== null && (
          <div
            data-slot="settings-row-description"
            className={cn(
              'mt-1 text-xs text-muted-foreground',
              descriptionClassName,
            )}
          >
            {description}
          </div>
        )}
      </div>
      {control !== undefined && control !== null && (
        <div className={cn('shrink-0', controlClassName)}>{control}</div>
      )}
    </div>
  );
}

export { SettingsGroup, SettingsRow };
