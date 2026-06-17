import type { VisibilityState } from '@tanstack/react-table';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { usePersistedColumnVisibility } from './use-persisted-column-visibility';

describe('usePersistedColumnVisibility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists and rehydrates column visibility', () => {
    const { result } = renderHook(() =>
      usePersistedColumnVisibility('test.visibility', { name: true }),
    );

    act(() => {
      result.current.onColumnVisibilityChange({ name: false });
    });

    expect(localStorage.getItem('test.visibility')).toBe(
      JSON.stringify({ name: false }),
    );

    const rehydrated = renderHook(() =>
      usePersistedColumnVisibility('test.visibility', { name: true }),
    );

    expect(rehydrated.result.current.columnVisibility).toEqual({
      name: false,
    });
  });

  it('supports updater functions and falls back for corrupt storage', () => {
    localStorage.setItem('test.visibility', '{');

    const { result } = renderHook(() =>
      usePersistedColumnVisibility('test.visibility', {
        name: true,
      }),
    );

    expect(result.current.columnVisibility).toEqual({ name: true });

    act(() => {
      result.current.onColumnVisibilityChange((old: VisibilityState) => ({
        ...old,
        status: false,
      }));
    });

    expect(result.current.columnVisibility).toEqual({
      name: true,
      status: false,
    });
  });
});
