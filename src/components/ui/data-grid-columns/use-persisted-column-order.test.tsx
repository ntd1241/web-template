import type { ColumnOrderState } from '@tanstack/react-table';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { usePersistedColumnOrder } from './use-persisted-column-order';

describe('usePersistedColumnOrder', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists and rehydrates the column order', () => {
    const { result } = renderHook(() =>
      usePersistedColumnOrder('test.column-order', ['name', 'email']),
    );

    act(() => {
      result.current.onColumnOrderChange(['email', 'name']);
    });

    expect(localStorage.getItem('test.column-order')).toBe(
      JSON.stringify(['email', 'name']),
    );

    const rehydrated = renderHook(() =>
      usePersistedColumnOrder('test.column-order', ['name', 'email']),
    );

    expect(rehydrated.result.current.columnOrder).toEqual(['email', 'name']);
  });

  it('supports updater functions', () => {
    const { result } = renderHook(() =>
      usePersistedColumnOrder('test.column-order', ['name']),
    );

    act(() => {
      result.current.onColumnOrderChange((previous: ColumnOrderState) => [
        ...previous,
        'email',
      ]);
    });

    expect(result.current.columnOrder).toEqual(['name', 'email']);
  });
});
