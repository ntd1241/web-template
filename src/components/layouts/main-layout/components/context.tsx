import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useUiStore } from '@/stores/ui.store';
import { useLocation } from 'react-router-dom';
import { resolveMenuTarget, type MenuGroupConfig } from '@/config/menu.types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAppSettings } from '@/providers/app-settings-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

export interface LayoutShellConfig {
  menuGroups: MenuGroupConfig[];
  homePath: string;
  brandName: string;
  headerTitle: string;
  accountRoles: string[];
  breadcrumbRootLabel: string;
  breadcrumbRootPath: string;
  breadcrumbCurrent: string;
  breadcrumbItems?: LayoutBreadcrumbItem[];
}

export interface LayoutBreadcrumbItem {
  label: string;
  path?: string;
}

interface LayoutState {
  style: CSSProperties;
  bodyClassName: string;
  isMobile: boolean;
  isSidebarOpen: boolean;
  sidebarToggle: () => void;
  shell: LayoutShellConfig;
}

interface LayoutProviderProps {
  children: ReactNode;
  style?: CSSProperties;
  bodyClassName?: string;
  shell?: Partial<LayoutShellConfig>;
}

const LayoutContext = createContext<LayoutState | undefined>(undefined);

export function LayoutProvider({
  children,
  style: customStyle,
  bodyClassName = '',
  shell: customShell,
}: LayoutProviderProps) {
  const isMobile = useIsMobile();
  const { appearance } = useAppSettings();
  const { pathname } = useLocation();
  const wireframeMode = useUiStore((state) => state.wireframeMode);
  const shell: LayoutShellConfig = {
    menuGroups: [],
    homePath: '/',
    brandName: 'Admin Template',
    headerTitle: 'Quản trị Tổ chức',
    accountRoles: ['Tổ chức'],
    breadcrumbRootLabel: 'Tổ chức',
    breadcrumbRootPath: '/',
    breadcrumbCurrent: 'Nhân viên',
    ...customShell,
  };
  const isSidebarMenuRoute = shell.menuGroups.some((group) =>
    group.items.some((item) => {
      const target = resolveMenuTarget(item, wireframeMode);
      return target?.to === pathname;
    }),
  );
  const shouldAutoCollapseSidebar =
    appearance.autoCollapseSidebarOnDetail &&
    shell.menuGroups.length > 0 &&
    !isSidebarMenuRoute;
  const sidebarOpenBeforeAutoCollapseRef = useRef<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    !appearance.sidebarCollapsed,
  );

  useEffect(() => {
    if (shouldAutoCollapseSidebar) {
      if (sidebarOpenBeforeAutoCollapseRef.current === null) {
        sidebarOpenBeforeAutoCollapseRef.current = isSidebarOpen;
      }
      setIsSidebarOpen(false);
      return;
    }

    if (sidebarOpenBeforeAutoCollapseRef.current !== null) {
      const sidebarOpenBeforeAutoCollapse =
        sidebarOpenBeforeAutoCollapseRef.current;
      sidebarOpenBeforeAutoCollapseRef.current = null;
      setIsSidebarOpen(sidebarOpenBeforeAutoCollapse);
      return;
    }

    setIsSidebarOpen(!appearance.sidebarCollapsed);
  }, [appearance.sidebarCollapsed, shouldAutoCollapseSidebar]);

  const sidebarCurrentWidth = isSidebarOpen
    ? 'var(--sidebar-width)'
    : 'var(--sidebar-collapsed-width)';

  const style = {
    '--sidebar-width': '280px',
    '--sidebar-collapsed-width': '56px',
    '--sidebar-menu-width': '224px',
    '--sidebar-current-width': sidebarCurrentWidth,
    '--header-height': '64px',
    '--header-height-mobile': '64px',
    ...customStyle,
  } as CSSProperties;

  const sidebarToggle = () => setIsSidebarOpen((open) => !open);

  useEffect(() => {
    if (!bodyClassName) return;

    const body = document.body;
    const existingClasses = body.className;
    body.className = `${existingClasses} ${bodyClassName}`.trim();

    return () => {
      body.className = existingClasses;
    };
  }, [bodyClassName]);

  return (
    <LayoutContext.Provider
      value={{
        bodyClassName,
        style,
        isMobile,
        isSidebarOpen,
        sidebarToggle,
        shell,
      }}
    >
      <div
        data-slot="layout-wrapper"
        className="flex grow"
        data-sidebar-open={isSidebarOpen}
        style={style}
      >
        <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
      </div>
    </LayoutContext.Provider>
  );
}

export const useLayout = () => {
  const context = useContext(LayoutContext);

  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }

  return context;
};
