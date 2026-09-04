import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useKeyboardShortcut } from '@/lib/keyboard-shortcuts';
import { KeyboardShortcutsDialog } from '@/components/ui/keyboard-shortcuts-dialog';
import { useLayout } from './context';
import { Header } from './header';
import { Sidebar } from './sidebar';

export function Wrapper() {
  const { isMobile } = useLayout();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useKeyboardShortcut('mod+/', () => setShortcutsOpen(true));
  useKeyboardShortcut('slash', () => {
    if (document.querySelector('[data-slot="dialog-content"]')) return;

    const searchInput = document.querySelector<HTMLInputElement>(
      '[data-shortcut-target="page-search"]',
    );
    if (!searchInput || searchInput.disabled) return;

    searchInput.focus();
    searchInput.select();
  });
  useKeyboardShortcut('alt+n', () => {
    if (document.querySelector('[data-slot="dialog-content"]')) return;
    document
      .querySelector<HTMLButtonElement>(
        '[data-shortcut-action="create"]:not([disabled])',
      )
      ?.click();
  });
  useKeyboardShortcut('alt+e', () => {
    if (document.querySelector('[data-slot="dialog-content"]')) return;
    document
      .querySelector<HTMLButtonElement>(
        '[data-shortcut-action="edit"]:not([disabled])',
      )
      ?.click();
  });

  return (
    <div className="flex h-screen w-full min-w-0 overflow-hidden bg-muted text-foreground">
      {!isMobile && <Sidebar />}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main
          className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto pt-(--header-height-mobile) transition-[padding] duration-200 ease-out lg:ps-[var(--sidebar-current-width)] lg:pt-(--header-height)"
          role="content"
        >
          <Outlet />
        </main>
      </div>
      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />
    </div>
  );
}
