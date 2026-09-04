import { describe, expect, it } from 'vitest';
import { getDataGridActionsColumnSize } from './action-column';

describe('getDataGridActionsColumnSize', () => {
  it('fits the shared dense-cell spacing around icon actions', () => {
    expect(getDataGridActionsColumnSize(1)).toBe(48);
    expect(getDataGridActionsColumnSize(2)).toBe(80);
    expect(getDataGridActionsColumnSize(3)).toBe(112);
  });

  it('keeps invalid or fractional counts safe', () => {
    expect(getDataGridActionsColumnSize(0)).toBe(48);
    expect(getDataGridActionsColumnSize(2.9)).toBe(80);
    expect(getDataGridActionsColumnSize(Number.NaN)).toBe(48);
  });
});
