import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getStorageItem, setStorageItem } from './storage';

describe('storage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reads and writes JSON values', () => {
    setStorageItem('storage.test', { visible: false });

    expect(getStorageItem<{ visible: boolean }>('storage.test')).toEqual({
      visible: false,
    });
  });

  it('returns undefined for missing or corrupt values', () => {
    expect(getStorageItem('storage.missing')).toBeUndefined();

    localStorage.setItem('storage.corrupt', '{');

    expect(getStorageItem('storage.corrupt')).toBeUndefined();
  });

  it('does not throw when localStorage write fails', () => {
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('quota');
      });

    expect(() => setStorageItem('storage.fail', true)).not.toThrow();

    setItem.mockRestore();
  });
});
