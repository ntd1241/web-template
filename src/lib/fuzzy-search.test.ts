import { describe, expect, it } from 'vitest';
import { filterFuzzy, fuzzyMatch } from './fuzzy-search';

describe('fuzzy search', () => {
  it('ignores Vietnamese accents and supports subsequence matching', () => {
    expect(fuzzyMatch('nguyen van a', 'Nguyễn Văn A')).toBe(true);
    expect(fuzzyMatch('nva', 'Nguyễn Văn A')).toBe(true);
    expect(fuzzyMatch('hoàng', 'Nguyễn Văn A')).toBe(false);
  });

  it('filters typed rows by their searchable text', () => {
    const rows = [{ label: 'Mã hợp đồng' }, { label: 'Khách hàng' }];

    expect(filterFuzzy(rows, 'ma hop', (row) => row.label)).toEqual([rows[0]]);
  });
});
