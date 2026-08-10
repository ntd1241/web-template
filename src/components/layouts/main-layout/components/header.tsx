import { useEffect, useState } from 'react';
import {
  CircleHelp,
  Languages,
  LogOut,
  Menu,
  PanelLeft,
  PanelLeftClose,
  Settings,
  UserRound,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

const DISPLAY_LANGUAGES = [
  {
    code: 'vi',
    label: 'Tiếng Việt',
    flag: toAbsoluteUrl('/media/flags/vietnam.svg'),
  },
  {
    code: 'en',
    label: 'English',
    flag: toAbsoluteUrl('/media/flags/united-states.svg'),
  },
] as const;

export function Header() {
  const { isMobile, isSidebarOpen, sidebarToggle } = useLayout();
  const { pathname } = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [language, setLanguage] = useState('vi');
  const currentLanguage =
    DISPLAY_LANGUAGES.find((item) => item.code === language) ??
    DISPLAY_LANGUAGES[0];

  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  return (
    <header className="fixed end-0 start-0 top-0 z-10 flex h-(--header-height-mobile) shrink-0 items-center justify-between border-b border-border bg-card px-5 transition-[inset-inline-start] duration-200 ease-out lg:start-[var(--sidebar-current-width)] lg:h-(--header-height) lg:px-8">
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

        {!isMobile && (
          <Button
            variant="ghost"
            mode="icon"
            size="sm"
            aria-label={isSidebarOpen ? 'Thu gọn menu' : 'Mở rộng menu'}
            onClick={sidebarToggle}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeft className="size-4" />
            )}
          </Button>
        )}

        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold leading-tight text-zinc-900">
            Quản trị Tổ chức
          </h1>
          <nav className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Link to="/" className="hover:text-admin-neutral-700">
              Tổ chức
            </Link>
            <span className="text-admin-neutral-300">/</span>
            <span className="text-[#0e5cd6]">Nhân viên</span>
          </nav>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex shrink-0 items-center gap-3 rounded-lg p-1.5 text-left outline-hidden transition-colors hover:bg-field focus-visible:ring-2 focus-visible:ring-ring"
            type="button"
            aria-label="Mở menu tài khoản"
          >
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-semibold leading-tight text-admin-blue-darkest">
                Thanh Hiếu
              </span>
              <span className="mt-0.5 inline-flex rounded border border-admin-blue-light bg-secondary px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.06em] text-secondary-foreground">
                Tổ chức
              </span>
            </span>
            <Avatar className="size-10 rounded-full border border-admin-amber-light bg-gradient-to-br from-[#fff3e0] to-[#ffb74d] text-base font-bold text-[#f57c00] shadow-sm">
              <AvatarFallback className="border-0 bg-transparent text-[#f57c00]">
                T
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={8} className="w-64 p-1.5">
          <DropdownMenuLabel className="px-2 py-1.5">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 rounded-full border border-admin-amber-light bg-gradient-to-br from-[#fff3e0] to-[#ffb74d] text-base font-bold text-[#f57c00] shadow-sm">
                <AvatarFallback className="border-0 bg-transparent text-[#f57c00]">
                  T
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  Thanh Hiếu
                </p>
                <p className="truncate text-xs font-normal text-muted-foreground">
                  thanh.hieu@admin.vn
                </p>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
            <DropdownMenuItem>
              <UserRound />
              Tài khoản
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings />
              Cài đặt
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel>Tùy chọn</DropdownMenuLabel>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Languages />
                <span className="min-w-0 flex-1 truncate">Ngôn ngữ</span>
                <img
                  src={currentLanguage.flag}
                  alt={currentLanguage.label}
                  className="h-3.5 w-5 shrink-0 rounded-sm object-cover"
                />
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuRadioGroup
                  value={language}
                  onValueChange={setLanguage}
                >
                  {DISPLAY_LANGUAGES.map((item) => (
                    <DropdownMenuRadioItem
                      key={item.code}
                      value={item.code}
                      indicator="check"
                      indicatorPosition="end"
                      className="gap-2"
                    >
                      <img
                        src={item.flag}
                        alt={item.label}
                        className="h-3.5 w-5 rounded-sm object-cover"
                      />
                      {item.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem>
              <CircleHelp />
              Trợ giúp
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem variant="destructive">
            <LogOut />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
