import { useUiStore } from '@/stores/ui.store';
import { LayoutTemplate, Pin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  getMenuItemKey,
  MENU_GROUPS,
  resolveMenuTarget,
} from '@/config/menu.config';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SidebarHeader } from './sidebar-header';

export function SidebarSecondary() {
  const { pathname } = useLocation();
  const wireframeMode = useUiStore((s) => s.wireframeMode);
  const toggleWireframeMode = useUiStore((s) => s.toggleWireframeMode);
  const pinnedMenuPaths = useUiStore((s) => s.pinnedMenuPaths);
  const togglePinnedMenu = useUiStore((s) => s.togglePinnedMenu);

  return (
    <div className="flex w-(--sidebar-menu-width) min-w-0 flex-col bg-card">
      <SidebarHeader />
      <ScrollArea
        className="min-h-0 flex-1"
        viewportClassName="[&>div]:!block [&>div]:!w-full [&>div]:!min-w-0"
      >
        <nav className="space-y-6 px-3 py-4">
          {MENU_GROUPS.map((group) => {
            const items = group.items
              .map((item) => ({
                item,
                target: resolveMenuTarget(item, wireframeMode),
              }))
              .filter((entry) => entry.target !== null);

            if (items.length === 0) return null;

            return (
              <section key={group.title}>
                <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {group.title}
                </h2>
                <div className="space-y-1">
                  {items.map(({ item, target }) => {
                    const active = pathname === target!.to;
                    const Icon = item.icon;

                    const menuKey = getMenuItemKey(item);
                    const pinned = pinnedMenuPaths.includes(menuKey);

                    return (
                      <div
                        key={item.label}
                        className="group/menu-item relative"
                      >
                        <Link
                          to={target!.to}
                          className={cn(
                            'flex h-9 w-full min-w-0 items-center gap-3 rounded-lg px-3 pe-12 text-sm font-medium text-foreground transition-colors hover:bg-field hover:text-accent-foreground',
                            active &&
                              'bg-[#dbeafe] text-[#0e5cd6] hover:bg-[#dbeafe] hover:text-[#0e5cd6] [&_svg]:text-[#0e5cd6]',
                          )}
                        >
                          <Icon className="size-4.5 shrink-0 text-foreground" />
                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>
                          {target!.isWireframe && (
                            <span className="ml-auto rounded bg-border px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase text-muted-foreground">
                              block
                            </span>
                          )}
                        </Link>
                        {item.badge !== undefined && (
                          <Badge
                            size="sm"
                            shape="circle"
                            variant={active ? 'primary' : 'secondary'}
                            appearance={active ? 'default' : 'light'}
                            className="absolute end-3 top-1/2 -translate-y-1/2 group-hover/menu-item:hidden"
                          >
                            {item.badge}
                          </Badge>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              mode="icon"
                              size="sm"
                              aria-label={
                                pinned
                                  ? `Bỏ ghim ${item.label}`
                                  : `Ghim ${item.label}`
                              }
                              aria-pressed={pinned}
                              onClick={() => togglePinnedMenu(menuKey)}
                              className={cn(
                                'absolute end-3 top-1/2 size-6 -translate-y-1/2 text-muted-foreground opacity-0 hover:bg-transparent hover:text-primary data-[state=open]:bg-transparent group-hover/menu-item:opacity-100',
                                pinned && 'text-primary',
                              )}
                            >
                              <Pin
                                className="size-4"
                                fill={pinned ? 'currentColor' : 'none'}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {pinned ? 'Bỏ ghim' : 'Ghim'}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-border px-4 py-3">
        <label className="flex cursor-pointer items-center gap-2.5">
          <LayoutTemplate className="size-4 text-admin-neutral-400" />
          <span className="flex-1 text-xs font-medium text-admin-neutral-600">
            Block layout
          </span>
          <Switch
            checked={wireframeMode}
            onCheckedChange={toggleWireframeMode}
            aria-label="Bật chế độ block layout"
          />
        </label>
        <p className="mt-2 text-xs font-medium text-admin-neutral-400">
          v0.0.1
        </p>
      </div>
    </div>
  );
}
