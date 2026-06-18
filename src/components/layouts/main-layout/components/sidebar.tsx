import { useLayout } from './context';
import { SidebarPrimary } from './sidebar-primary';
import { SidebarSecondary } from './sidebar-secondary';

export function Sidebar() {
  const { isSidebarOpen } = useLayout();

  return (
    <aside className="fixed inset-y-0 start-0 z-20 flex w-(--sidebar-current-width) shrink-0 overflow-hidden border-e border-border bg-card transition-[width] duration-200 ease-out">
      <SidebarPrimary />
      {isSidebarOpen && <SidebarSecondary />}
    </aside>
  );
}
