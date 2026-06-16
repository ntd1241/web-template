import { useUiStore } from '@/stores/ui.store';
import { Blocks, CircleHelp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { MENU_GROUPS, resolveMenuTarget } from '@/config/menu.config';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function SidebarPrimary() {
  const { pathname } = useLocation();
  const wireframeMode = useUiStore((s) => s.wireframeMode);

  // Một icon đại diện cho mỗi nhóm có ít nhất một trang truy cập được.
  const railItems = MENU_GROUPS.map((group) => {
    const first = group.items
      .map((item) => resolveMenuTarget(item, wireframeMode))
      .find((target) => target !== null);
    return first
      ? { label: group.title, icon: group.items[0].icon, to: first.to }
      : null;
  }).filter((item) => item !== null);

  return (
    <div className="flex w-(--sidebar-collapsed-width) shrink-0 flex-col items-center bg-admin-neutral-900 py-4 text-white">
      <Link
        to="/"
        className="mb-6 flex size-8 items-center justify-center rounded-lg bg-white text-admin-primary shadow-sm"
        aria-label="Trang chủ"
      >
        <Blocks className="size-5" />
      </Link>

      <nav className="flex flex-1 flex-col items-center gap-2">
        {railItems.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;

          return (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Link
                  to={item.to}
                  aria-label={item.label}
                  className={cn(
                    'flex size-10 items-center justify-center rounded-lg text-white/55 transition-colors hover:bg-white/10 hover:text-white',
                    active &&
                      'bg-admin-primary text-white shadow-sm hover:bg-admin-primary',
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
