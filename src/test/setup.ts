import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Dọn DOM sau mỗi test để tránh rò rỉ giữa các test.
afterEach(() => {
  cleanup();
});
