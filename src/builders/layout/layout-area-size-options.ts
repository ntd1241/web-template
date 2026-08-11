/**
 * Shared Tailwind width presets for layout areas.
 *
 * Keep the class names in the registry so layout pages and future layout
 * builders use the same size vocabulary and Tailwind can scan every class.
 */
export const layoutAreaSizeOptions = [
  { value: 'sm', label: 'Nhỏ', className: 'lg:w-56', widthRem: 14 },
  { value: 'md', label: 'Vừa', className: 'lg:w-64', widthRem: 16 },
  { value: 'lg', label: 'Lớn', className: 'lg:w-80', widthRem: 20 },
  { value: 'xl', label: 'Rộng', className: 'lg:w-96', widthRem: 24 },
] as const;

export type LayoutAreaSize = (typeof layoutAreaSizeOptions)[number]['value'];

export const DEFAULT_LAYOUT_AREA_SIZE: LayoutAreaSize = 'md';

export const layoutAreaHeightOptions = [
  { value: 'fit', label: 'Theo nội dung' },
  { value: 'fill', label: 'Đầy chiều cao' },
] as const;

export type LayoutAreaHeight =
  (typeof layoutAreaHeightOptions)[number]['value'];
