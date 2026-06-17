import { useUiStore } from '@/stores/ui.store';
import { LayoutTemplate } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { MENU_GROUPS, resolveMenuTarget } from '@/config/menu.config';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { SidebarHeader } from './sidebar-header';

export function SidebarSecondary() {
  const { pathname } = useLocation();
  const wireframeMode = useUiStore((s) => s.wireframeMode);
  const toggleWireframeMode = useUiStore((s) => s.toggleWireframeMode);

  return (
    <div className="flex w-(--sidebar-menu-width) min-w-0 flex-col bg-card">
      <SidebarHeader />
      <ScrollArea className="min-h-0 flex-1">
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
                <h2 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {group.title}
                </h2>
                <div className="space-y-1">
                  {items.map(({ item, target }) => {
                    const active = pathname === target!.to;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.label}
                        to={target!.to}
                        className={cn(
                          'flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-admin-blue-text transition-colors hover:bg-field hover:text-accent-foreground',
                          active &&
                            'bg-[#dbeafe] text-[#0e5cd6] hover:bg-[#dbeafe] hover:text-[#0e5cd6]',
                        )}
                      >
                        <Icon className="size-4.5 shrink-0 opacity-70" />
                        <span className="truncate">{item.label}</span>
                        {target!.isWireframe && (
                          <span className="ml-auto rounded bg-border px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                            block
                          </span>
                        )}
                      </Link>
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
          <span className="flex-1 text-[12px] font-medium text-admin-neutral-600">
            Block layout
          </span>
          <Switch
            checked={wireframeMode}
            onCheckedChange={toggleWireframeMode}
            aria-label="Bật chế độ block layout"
          />
        </label>
        <p className="mt-2 text-[11px] font-medium text-admin-neutral-400">
          v0.0.1
        </p>
      </div>
    </div>
  );
}
