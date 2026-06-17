export function getStorageItem<T>(key: string): T | undefined {
  try {
    const storage = globalThis.localStorage;
    const value = storage.getItem(key);

    if (value === null) {
      return undefined;
    }

    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    globalThis.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage can be unavailable or full; persistence is best effort.
  }
}
