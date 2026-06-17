import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useLayout } from './context';
import { SidebarPrimary } from './sidebar-primary';
import { SidebarSecondary } from './sidebar-secondary';

export function Header() {
  const { isMobile } = useLayout();
  const { pathname } = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  return (
    <header className="fixed end-0 start-0 top-0 z-10 flex h-(--header-height-mobile) shrink-0 items-center justify-between border-b border-border bg-card px-5 lg:start-[var(--sidebar-width)] lg:h-(--header-height) lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        {isMobile && (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                mode="icon"
                size="sm"
                aria-label="Mở menu"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              className="w-[280px] gap-0 p-0"
              side="left"
              close={false}
            >
              <SheetHeader className="p-0" />
              <SheetBody className="flex p-0">
                <SidebarPrimary />
                <SidebarSecondary />
              </SheetBody>
            </SheetContent>
          </Sheet>
        )}

        <div className="min-w-0">
          <h1 className="truncate text-[18px] font-bold leading-tight text-zinc-900">
            Quản trị Tổ chức
          </h1>
          <nav className="mt-0.5 flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
            <Link to="/" className="hover:text-admin-neutral-700">
              Tổ chức
            </Link>
            <span className="text-admin-neutral-300">/</span>
            <span className="text-[#267a2b]">Nhân viên</span>
          </nav>
        </div>
      </div>

      <button
        className="flex shrink-0 items-center gap-3 rounded-lg p-1.5 text-left transition-colors hover:bg-field"
        type="button"
      >
        <span className="hidden text-right sm:block">
          <span className="block text-[14px] font-semibold leading-tight text-admin-blue-darkest">
            Thanh Hiếu
          </span>
          <span className="mt-0.5 inline-flex rounded border border-admin-blue-light bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-secondary-foreground">
            Tổ chức
          </span>
        </span>
        <span className="flex size-10 items-center justify-center rounded-full border border-admin-amber-light bg-gradient-to-br from-[#fff3e0] to-[#ffb74d] text-[16px] font-bold text-[#f57c00] shadow-sm">
          T
        </span>
      </button>
    </header>
  );
}
