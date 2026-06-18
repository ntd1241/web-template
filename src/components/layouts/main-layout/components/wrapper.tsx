import { Outlet } from 'react-router-dom';
import { useLayout } from './context';
import { Header } from './header';
import { Sidebar } from './sidebar';

export function Wrapper() {
  const { isMobile } = useLayout();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted text-foreground">
      {!isMobile && <Sidebar />}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main
          className="min-h-0 flex-1 overflow-hidden pt-(--header-height-mobile) transition-[padding] duration-200 ease-out lg:ps-[var(--sidebar-current-width)] lg:pt-(--header-height)"
          role="content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
