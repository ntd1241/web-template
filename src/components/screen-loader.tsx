'use client';

import { LogoSquareLoader } from '@/components/ui/loading';

export function ScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 transition-opacity duration-700 ease-in-out">
      <LogoSquareLoader />
      <div className="text-sm font-medium text-muted-foreground">
        Đang tải...
      </div>
    </div>
  );
}
