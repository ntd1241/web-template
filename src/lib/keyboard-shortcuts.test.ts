import { describe, expect, it } from 'vitest';
import { matchesKeyboardShortcut } from './keyboard-shortcuts';

function key(
  value: string,
  modifiers: Partial<
    Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'>
  > = {},
) {
  return {
    key: value,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    ...modifiers,
  } as KeyboardEvent;
}

describe('keyboard shortcuts', () => {
  it('supports save with Ctrl on Windows and Meta on macOS', () => {
    expect(matchesKeyboardShortcut(key('s', { ctrlKey: true }), 'mod+s')).toBe(
      true,
    );
    expect(matchesKeyboardShortcut(key('s', { metaKey: true }), 'mod+s')).toBe(
      true,
    );
    expect(matchesKeyboardShortcut(key('s'), 'mod+s')).toBe(false);
  });

  it('keeps slash search separate from shortcut help', () => {
    expect(matchesKeyboardShortcut(key('/'), 'slash')).toBe(true);
    expect(matchesKeyboardShortcut(key('?', { shiftKey: true }), 'slash')).toBe(
      false,
    );
    expect(matchesKeyboardShortcut(key('/', { ctrlKey: true }), 'mod+/')).toBe(
      true,
    );
  });

  it('matches page actions only with the Alt modifier', () => {
    expect(matchesKeyboardShortcut(key('n', { altKey: true }), 'alt+n')).toBe(
      true,
    );
    expect(matchesKeyboardShortcut(key('n'), 'alt+n')).toBe(false);
    expect(matchesKeyboardShortcut(key('e', { altKey: true }), 'alt+e')).toBe(
      true,
    );
  });
});
