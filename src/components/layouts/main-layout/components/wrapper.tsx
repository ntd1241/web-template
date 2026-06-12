import { Outlet } from 'react-router-dom';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { useLayout } from './context';

export function Wrapper() {
  const { isMobile } = useLayout();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-agribase-page text-agribase-grey-800">
      {!isMobile && <Sidebar />}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main
          className="min-h-0 flex-1 overflow-hidden pt-(--header-height-mobile) lg:ps-[var(--sidebar-width)] lg:pt-(--header-height)"
          role="content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
