import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutState {
  style: React.CSSProperties;
  bodyClassName: string;
  isMobile: boolean;
  isSidebarOpen: boolean;
  sidebarToggle: () => void;
}

interface LayoutProviderProps {
  children: ReactNode;
  style?: React.CSSProperties;
  bodyClassName?: string;
}

const LayoutContext = createContext<LayoutState | undefined>(undefined);

export function LayoutProvider({ children, style: customStyle, bodyClassName = '' }: LayoutProviderProps) {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const style = {
    '--sidebar-width': '280px',
    '--sidebar-collapsed-width': '56px',
    '--sidebar-menu-width': '224px',
    '--header-height': '64px',
    '--header-height-mobile': '64px',
    ...customStyle,
  } as React.CSSProperties;

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
    <LayoutContext.Provider value={{ bodyClassName, style, isMobile, isSidebarOpen, sidebarToggle }}>
      <div data-slot="layout-wrapper" className="flex grow" data-sidebar-open={isSidebarOpen} style={style}>
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
