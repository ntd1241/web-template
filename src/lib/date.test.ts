import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatDate, formatDateTime, formatRelative, formatTime } from './date';
import { setValidationLocale } from './validation';

describe('date helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-17T10:00:00+07:00'));
    setValidationLocale('vi');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats relative time with the active Vietnamese locale', () => {
    expect(formatRelative('2026-06-17T09:59:00+07:00')).toBe('1 phút trước');
  });

  it('formats date and time values with Vietnamese formats', () => {
    const value = '2026-06-17T09:05:00+07:00';

    expect(formatDate(value)).toBe('17/06/2026');
    expect(formatDateTime(value)).toBe('17/06/2026 09:05');
    expect(formatTime(value)).toBe('09:05');
  });

  it('returns an empty string for invalid or missing input', () => {
    expect(formatDate(undefined)).toBe('');
    expect(formatDateTime('not-a-date')).toBe('');
    expect(formatRelative(Number.NaN)).toBe('');
  });
});
