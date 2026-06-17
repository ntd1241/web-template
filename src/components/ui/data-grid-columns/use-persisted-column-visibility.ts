import { useCallback, useState } from 'react';
import type {
  OnChangeFn,
  Updater,
  VisibilityState,
} from '@tanstack/react-table';
import { getStorageItem, setStorageItem } from '@/lib/storage';

function resolveUpdater<TValue>(
  updaterOrValue: Updater<TValue>,
  previous: TValue,
): TValue {
  if (typeof updaterOrValue === 'function') {
    const updater = updaterOrValue as (old: TValue) => TValue;
    return updater(previous);
  }

  return updaterOrValue;
}

export function usePersistedColumnVisibility(
  storageKey: string,
  defaults: VisibilityState = {},
): {
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: OnChangeFn<VisibilityState>;
} {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => getStorageItem<VisibilityState>(storageKey) ?? defaults,
  );

  const onColumnVisibilityChange = useCallback<OnChangeFn<VisibilityState>>(
    (updaterOrValue) => {
      setColumnVisibility((previous) => {
        const next = resolveUpdater(updaterOrValue, previous);
        setStorageItem(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  return { columnVisibility, onColumnVisibilityChange };
}
