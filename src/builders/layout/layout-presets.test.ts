import { describe, expect, it } from 'vitest';
import {
  getLayoutPreset,
  layoutPresetOptions,
  layoutPresets,
} from './layout-presets';

describe('layout presets', () => {
  it('provides content-fit and full-height split starting points', () => {
    expect(layoutPresetOptions.map((preset) => preset.value)).toEqual([
      'contentFit',
      'fullHeightSplit',
    ]);
    expect(layoutPresets.contentFit.defaults).toMatchObject({
      navigationSize: 'md',
      navigationHeight: 'fit',
      contentHeight: 'fit',
      navigationResizable: false,
    });
    expect(layoutPresets.fullHeightSplit.defaults).toMatchObject({
      navigationSize: 'xl',
      navigationHeight: 'fill',
      contentHeight: 'fill',
      navigationResizable: false,
    });
  });

  it('returns a preset by its stable name', () => {
    expect(getLayoutPreset('fullHeightSplit')).toBe(
      layoutPresets.fullHeightSplit,
    );
  });
});
