import { useEffect, useState } from 'react';

/** Trả về giá trị đã debounce — dùng cho ô tìm kiếm để tránh query mỗi lần gõ. */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
