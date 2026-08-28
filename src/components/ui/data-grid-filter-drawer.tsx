import { useState } from 'react';
import type { ReactNode } from 'react';
import { Filter, Save as SaveIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataGridDrawerAction } from '@/components/ui/data-grid-drawer-action';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

export interface DataGridFilterDrawerProps {
  children: ReactNode;
  footer?: ReactNode;
  onSaveToView?: () => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  canSaveToView?: boolean;
  saveDisabled?: boolean;
  isSaving?: boolean;
  title?: ReactNode;
  trigger?: ReactNode;
}

/** Shared right-side drawer shell for detailed DataGrid filters. */
export function DataGridFilterDrawer({
  children,
  footer,
  onSaveToView,
  onOpenChange,
  open,
  canSaveToView = true,
  saveDisabled = false,
  isSaving = false,
  title = 'Bộ lọc',
  trigger,
}: DataGridFilterDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const handleOpenChange = (nextOpen: boolean) => {
    if (open === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const defaultTrigger = (
    <Button variant="outline" mode="icon" aria-label="Bộ lọc" title="Bộ lọc">
      <Filter />
    </Button>
  );

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange} direction="right">
      <DrawerTrigger asChild>{trigger ?? defaultTrigger}</DrawerTrigger>
      <DrawerContent className="inset-y-0 right-0 bottom-auto left-auto mt-0 h-full w-[min(100vw,24rem)] rounded-none border-l [&>div:first-child]:hidden">
        <DrawerHeader className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <DrawerTitle>{title}</DrawerTitle>
            {onSaveToView ? (
              <DataGridDrawerAction
                icon={SaveIcon}
                label={
                  canSaveToView
                    ? 'Lưu cấu hình vào view đang chọn'
                    : 'Chọn một view để lưu cấu hình'
                }
                disabled={!canSaveToView || saveDisabled || isSaving}
                loading={isSaving}
                onClick={onSaveToView}
              />
            ) : null}
          </div>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
        {footer ? (
          <DrawerFooter className="border-t border-border px-5 py-4">
            {footer}
          </DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
