import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** UI/app preferences toàn cục (sidebar, ...). Persist để giữ giữa các phiên. */
interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
    }),
    { name: 'ui-storage' },
  ),
);
