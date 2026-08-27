import { useCallback, useState } from 'react';
import type {
  ColumnOrderState,
  OnChangeFn,
  Updater,
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

export function usePersistedColumnOrder(
  storageKey: string,
  defaults: ColumnOrderState = [],
): {
  columnOrder: ColumnOrderState;
  onColumnOrderChange: OnChangeFn<ColumnOrderState>;
} {
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    () => getStorageItem<ColumnOrderState>(storageKey) ?? defaults,
  );

  const onColumnOrderChange = useCallback<OnChangeFn<ColumnOrderState>>(
    (updaterOrValue) => {
      setColumnOrder((previous) => {
        const next = resolveUpdater(updaterOrValue, previous);
        setStorageItem(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  return { columnOrder, onColumnOrderChange };
}
