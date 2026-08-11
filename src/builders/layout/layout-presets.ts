import type {
  LayoutAreaHeight,
  LayoutAreaSize,
} from './layout-area-size-options';

export interface LayoutPresetDefaults {
  navigationSize: LayoutAreaSize;
  navigationMinSize: LayoutAreaSize;
  navigationMaxSize: LayoutAreaSize;
  navigationHeight: LayoutAreaHeight;
  contentHeight: LayoutAreaHeight;
  navigationResizable: boolean;
}

export interface LayoutPresetDefinition {
  value: string;
  label: string;
  description: string;
  defaults: LayoutPresetDefaults;
}

/**
 * Reusable starting points for common admin content layouts.
 *
 * Keep these values serializable so future page/layout builders can spread a
 * preset into their generated spec and still override individual fields.
 */
export const layoutPresets = {
  contentFit: {
    value: 'contentFit',
    label: 'Content fit',
    description:
      'Vùng điều hướng theo nội dung, vùng chính dùng scroll của layout.',
    defaults: {
      navigationSize: 'md',
      navigationMinSize: 'sm',
      navigationMaxSize: 'xl',
      navigationHeight: 'fit',
      contentHeight: 'fit',
      navigationResizable: false,
    },
  },
  fullHeightSplit: {
    value: 'fullHeightSplit',
    label: 'Full-height split',
    description: 'Hai vùng cùng đầy chiều cao, vùng dữ liệu tự quản lý scroll.',
    defaults: {
      navigationSize: 'xl',
      navigationMinSize: 'md',
      navigationMaxSize: 'xl',
      navigationHeight: 'fill',
      contentHeight: 'fill',
      navigationResizable: false,
    },
  },
} as const satisfies Record<string, LayoutPresetDefinition>;

export type LayoutPresetName = keyof typeof layoutPresets;

export const layoutPresetOptions = Object.values(layoutPresets);

export function getLayoutPreset(
  name: LayoutPresetName,
): (typeof layoutPresets)[LayoutPresetName] {
  return layoutPresets[name];
}
