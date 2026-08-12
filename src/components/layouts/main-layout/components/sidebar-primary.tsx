import { useUiStore } from '@/stores/ui.store';
import { Blocks, BookOpen, CircleHelp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getMenuItemKey, resolveMenuTarget } from '@/config/menu.types';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLayout } from './context';

const secondaryRailItems = [
  { label: 'Hướng dẫn sử dụng', icon: BookOpen },
] as const;

export function SidebarPrimary() {
  const { pathname } = useLocation();
  const { shell } = useLayout();
  const wireframeMode = useUiStore((s) => s.wireframeMode);
  const pinnedMenuPaths = useUiStore((s) => s.pinnedMenuPaths);

  const pinnedItems = pinnedMenuPaths
    .map((path) => {
      for (const group of shell.menuGroups) {
        const item = group.items.find(
          (menuItem) => getMenuItemKey(menuItem) === path,
        );
        if (!item) continue;

        const target = resolveMenuTarget(item, wireframeMode);
        if (target) return { ...item, ...target };
      }

      return null;
    })
    .filter((item) => item !== null);

  const hasRailContent =
    pinnedItems.length > 0 || secondaryRailItems.length > 0;

  return (
    <div className="flex w-(--sidebar-collapsed-width) shrink-0 flex-col items-center bg-admin-neutral-900 py-4 text-white">
      <Link
        to={shell.homePath}
        className="flex size-8 items-center justify-center rounded-lg bg-white text-primary shadow-sm"
        aria-label="Trang chủ"
      >
        <Blocks className="size-5" />
      </Link>

      <div className="flex flex-1 flex-col items-center">
        {hasRailContent && <div className="my-3 h-px w-6 bg-white/15" />}

        {pinnedItems.length > 0 && (
          <>
            <nav className="flex flex-col items-center gap-2">
              {pinnedItems.map((item) => {
                const active = pathname === item.to;
                const Icon = item.icon;

                return (
                  <Tooltip key={getMenuItemKey(item)}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.to}
                        aria-label={item.label}
                        className={cn(
                          'flex size-10 items-center justify-center rounded-lg text-white/55 transition-colors hover:bg-white/10 hover:text-white',
                          active &&
                            'bg-primary text-white shadow-sm hover:bg-primary',
                        )}
                      >
                        <Icon className="size-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
            <div className="my-3 h-px w-6 bg-white/15" />
          </>
        )}

        <nav className="flex flex-col items-center gap-2">
          {secondaryRailItems.map((item) => {
            const Icon = item.icon;

            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={item.label}
                    className="flex size-10 items-center justify-center rounded-lg text-white/55 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="size-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="flex size-10 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Trợ giúp"
            type="button"
          >
            <CircleHelp className="size-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">Trợ giúp</TooltipContent>
      </Tooltip>
    </div>
  );
}
