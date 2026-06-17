import { describe, expect, it } from 'vitest';
import { normalizeVi, searchMatch } from './search';

describe('normalizeVi', () => {
  it('normalizes Vietnamese accents and case', () => {
    expect(normalizeVi(' Nguyễn ')).toBe('nguyen');
  });

  it('maps đ and Đ to d', () => {
    expect(normalizeVi('Đồng Đăng')).toBe('dong dang');
  });

  it('is null-safe', () => {
    expect(normalizeVi(null)).toBe('');
    expect(normalizeVi(undefined)).toBe('');
  });
});

describe('searchMatch', () => {
  it('matches accented text with an accent-free query', () => {
    expect(searchMatch('Nguyễn Văn An', 'nguyen')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(searchMatch('Quản Lý', 'quan ly')).toBe(true);
  });

  it('matches d queries against đ text', () => {
    expect(searchMatch('Đặng Thị Hoa', 'dang')).toBe(true);
  });

  it('returns true for an empty query', () => {
    expect(searchMatch('Nhân viên', '')).toBe(true);
    expect(searchMatch(null, undefined)).toBe(true);
  });

  it('is null-safe for non-empty queries', () => {
    expect(searchMatch(null, 'abc')).toBe(false);
  });
});
