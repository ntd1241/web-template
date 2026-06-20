'use client';

import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useDataGrid } from '@/components/ui/data-grid';
import { Separator } from '@/components/ui/separator';

interface DataGridActionBarProps {
  /** Action controls (e.g. a bulk Select + Apply button, a delete button). */
  children?: ReactNode;
  className?: string;
  /** Override the selection label. Receives the visible-selected row count. */
  selectionLabel?: (count: number) => ReactNode;
  /** Hide the built-in "Bỏ chọn" clear button (default shown). */
  hideClear?: boolean;
}

/**
 * Floating bulk-action bar for a `DataGrid`. Reads the table from `useDataGrid()`,
 * appears centered at the bottom while one or more visible rows are selected, and
 * hosts bulk controls passed as `children`. Render it inside `<DataGrid>`; the
 * page owns what the actions do (e.g. a batched mutation over the selected rows).
 */
export function DataGridActionBar({
  children,
  className,
  selectionLabel,
  hideClear = false,
}: DataGridActionBarProps) {
  const { table } = useDataGrid();
  const count = table.getFilteredSelectedRowModel().rows.length;

  if (count === 0) {
    return null;
  }

  return (
    <div
      role="toolbar"
      aria-label="Thao tác hàng loạt"
      className={cn(
        'fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2 shadow-lg',
        'animate-in fade-in-0 slide-in-from-bottom-4 duration-200',
        className,
      )}
    >
      <span className="px-1 text-sm font-medium text-foreground">
        {selectionLabel ? selectionLabel(count) : `Đã chọn ${count}`}
      </span>

      {children ? (
        <>
          <DataGridActionBarSeparator />
          {children}
        </>
      ) : null}

      {!hideClear ? (
        <>
          <DataGridActionBarSeparator />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetRowSelection()}
          >
            <X />
            Bỏ chọn
          </Button>
        </>
      ) : null}
    </div>
  );
}

/** Vertical divider between action-bar groups. */
export function DataGridActionBarSeparator({
  className,
}: {
  className?: string;
}) {
  return <Separator orientation="vertical" className={cn('h-5', className)} />;
}
