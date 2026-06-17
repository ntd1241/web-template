import { SidebarPrimary } from './sidebar-primary';
import { SidebarSecondary } from './sidebar-secondary';

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 start-0 z-20 flex w-(--sidebar-width) shrink-0 overflow-hidden border-e border-border bg-card">
      <SidebarPrimary />
      <SidebarSecondary />
    </aside>
  );
}
