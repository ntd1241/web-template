import { describe, expect, it } from 'vitest';
import {
  DATA_GRID_ACTION_VARIANTS,
  getDataGridActionVariant,
} from './action-button';

describe('data-grid action colors', () => {
  it('maps standard row actions to semantic button variants', () => {
    expect(DATA_GRID_ACTION_VARIANTS).toEqual({
      primary: 'primary',
      view: 'blue',
      edit: 'success',
      delete: 'destructive',
      archive: 'destructive',
      copy: 'info',
      other: 'info',
    });
    expect(getDataGridActionVariant('primary')).toBe('primary');
  });
});
