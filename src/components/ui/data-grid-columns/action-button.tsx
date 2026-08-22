import type { ComponentProps, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type DataGridAction =
  | 'primary'
  | 'view'
  | 'edit'
  | 'delete'
  | 'archive'
  | 'copy'
  | 'other';

export const DATA_GRID_ACTION_VARIANTS = {
  primary: 'primary',
  view: 'blue',
  edit: 'success',
  delete: 'destructive',
  archive: 'destructive',
  copy: 'info',
  other: 'info',
} as const satisfies Record<
  DataGridAction,
  NonNullable<ComponentProps<typeof Button>['variant']>
>;

export function getDataGridActionVariant(
  action: DataGridAction,
): NonNullable<ComponentProps<typeof Button>['variant']> {
  return DATA_GRID_ACTION_VARIANTS[action];
}

export interface DataGridActionButtonProps extends Omit<
  ComponentProps<typeof Button>,
  'variant' | 'appearance'
> {
  action: DataGridAction;
  tooltip?: ReactNode;
}

/**
 * Shared semantic action button for data-grid rows. Keep row actions as ghost
 * controls so the table stays visually quiet while preserving action meaning
 * through the color mapping.
 */
export function DataGridActionButton({
  action,
  tooltip,
  children,
  ...buttonProps
}: DataGridActionButtonProps) {
  const button = (
    <Button
      {...buttonProps}
      variant={getDataGridActionVariant(action)}
      appearance="ghost"
    >
      {children}
    </Button>
  );

  if (!tooltip) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        variant={
          action === 'delete' || action === 'archive'
            ? 'destructive'
            : undefined
        }
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
