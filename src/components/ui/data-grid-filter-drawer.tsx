import { useState } from 'react';
import type { ReactNode } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

export interface DataGridFilterDrawerProps {
  children: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  title?: ReactNode;
  trigger?: ReactNode;
}

/** Shared right-side drawer shell for detailed DataGrid filters. */
export function DataGridFilterDrawer({
  children,
  description,
  footer,
  onOpenChange,
  open,
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
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <DrawerTitle>{title}</DrawerTitle>
              {description ? (
                <DrawerDescription>{description}</DrawerDescription>
              ) : null}
            </div>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                mode="icon"
                size="md"
                aria-label="Đóng"
                title="Đóng"
              >
                <X />
              </Button>
            </DrawerClose>
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
