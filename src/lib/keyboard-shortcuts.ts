import { useEffect, useRef } from 'react';

export type KeyboardShortcut =
  'mod+s' | 'mod+enter' | 'mod+/' | 'slash' | 'alt+n' | 'alt+e';

export const APP_KEYBOARD_SHORTCUTS = [
  { shortcut: 'Ctrl/Cmd + S', label: 'Lưu biểu mẫu đang mở' },
  { shortcut: 'Ctrl/Cmd + Enter', label: 'Lưu biểu mẫu đang mở' },
  { shortcut: 'Esc', label: 'Đóng hoặc hủy dialog/popover' },
  { shortcut: '/', label: 'Focus ô tìm kiếm của trang' },
  { shortcut: 'Alt + N', label: 'Tạo bản ghi mới' },
  { shortcut: 'Alt + E', label: 'Chỉnh sửa bản ghi hiện tại' },
  { shortcut: 'Ctrl/Cmd + /', label: 'Mở danh sách phím tắt' },
] as const;

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.isContentEditable ||
    target.matches('input, textarea, select, [contenteditable="true"]')
  );
}

export function matchesKeyboardShortcut(
  event: KeyboardEvent,
  shortcut: KeyboardShortcut,
): boolean {
  const key = event.key.toLowerCase();
  const hasMod = event.ctrlKey || event.metaKey;

  switch (shortcut) {
    case 'mod+s':
      return hasMod && key === 's' && !event.altKey;
    case 'mod+enter':
      return hasMod && key === 'enter' && !event.altKey;
    case 'mod+/':
      return hasMod && (event.key === '/' || event.key === '?');
    case 'slash':
      return event.key === '/' && !event.shiftKey && !hasMod && !event.altKey;
    case 'alt+n':
      return event.altKey && key === 'n' && !hasMod;
    case 'alt+e':
      return event.altKey && key === 'e' && !hasMod;
  }
}

export function useKeyboardShortcut(
  shortcut: KeyboardShortcut,
  handler: () => void,
  options: {
    enabled?: boolean;
    allowInEditable?: boolean;
  } = {},
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (options.enabled === false) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!options.allowInEditable && isEditableTarget(event.target)) {
        return;
      }
      if (!matchesKeyboardShortcut(event, shortcut)) return;

      event.preventDefault();
      handlerRef.current();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [options.allowInEditable, options.enabled, shortcut]);
}
