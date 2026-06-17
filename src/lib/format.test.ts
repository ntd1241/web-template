import { describe, expect, it } from 'vitest';
import {
  formatCompact,
  formatCurrencyVND,
  formatNumber,
  formatPercent,
} from './format';

describe('format helpers', () => {
  it('formats grouped Vietnamese numbers', () => {
    expect(formatNumber(1234567)).toBe('1.234.567');
    expect(formatNumber(1234.5, { minimumFractionDigits: 1 })).toBe('1.234,5');
  });

  it('formats VND currency with the dong suffix', () => {
    expect(formatCurrencyVND(1234567)).toMatch(/^1\.234\.567\s*₫$/);
  });

  it('formats percent values from ratios', () => {
    expect(formatPercent(0.125, 1)).toBe('12,5%');
  });

  it('formats compact Vietnamese numbers', () => {
    expect(formatCompact(1200000)).toMatch(/^1,2\s*(Tr|tr)$/);
  });

  it('returns an empty string for nullish or NaN values', () => {
    expect(formatNumber(null)).toBe('');
    expect(formatCurrencyVND(undefined)).toBe('');
    expect(formatPercent(Number.NaN)).toBe('');
    expect(formatCompact(Number.NaN)).toBe('');
  });
});
