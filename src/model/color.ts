export const APP_COLORS = [
  'blue',
  'violet',
  'red',
  'green',
  'amber',
  'slate',
] as const;

export type AppColor = (typeof APP_COLORS)[number];

export const COLOR_LABELS: Record<AppColor, string> = {
  blue: 'Xanh dương',
  violet: 'Tím',
  red: 'Đỏ',
  green: 'Xanh lá',
  amber: 'Cam',
  slate: 'Xám',
};

export const COLOR_SWATCH_CLASSES: Record<AppColor, string> = {
  blue: 'border-admin-blue-primary bg-admin-blue-primary',
  violet: 'border-admin-violet-primary bg-admin-violet-primary',
  red: 'border-admin-red-primary bg-admin-red-primary',
  green: 'border-admin-success-text bg-admin-success-text',
  amber: 'border-admin-amber-primary bg-admin-amber-primary',
  slate: 'border-muted-foreground bg-muted-foreground',
};

export const COLOR_TEXT_CLASSES: Record<AppColor, string> = {
  blue: 'text-admin-blue-dark',
  violet: 'text-admin-violet-dark',
  red: 'text-admin-red-dark',
  green: 'text-admin-success-text',
  amber: 'text-admin-amber-dark',
  slate: 'text-muted-foreground',
};

export type ColorBadgeAppearance = 'default' | 'light' | 'outline' | 'ghost';

export const COLOR_BADGE_CLASSES: Record<
  AppColor,
  Record<ColorBadgeAppearance, string>
> = {
  blue: {
    default: 'border-transparent bg-admin-blue-primary text-white',
    light: 'border-admin-blue-light bg-admin-blue-bg text-admin-blue-dark',
    outline: 'border-admin-blue-light bg-transparent text-admin-blue-dark',
    ghost:
      'border-transparent bg-transparent text-admin-blue-dark hover:bg-admin-blue-bg',
  },
  violet: {
    default: 'border-transparent bg-admin-violet-primary text-white',
    light:
      'border-admin-violet-border bg-admin-violet-bg text-admin-violet-dark',
    outline: 'border-admin-violet-border bg-transparent text-admin-violet-dark',
    ghost:
      'border-transparent bg-transparent text-admin-violet-dark hover:bg-admin-violet-bg',
  },
  red: {
    default: 'border-transparent bg-admin-red-primary text-white',
    light: 'border-admin-red-light bg-admin-red-bg text-admin-red-dark',
    outline: 'border-admin-red-light bg-transparent text-admin-red-dark',
    ghost:
      'border-transparent bg-transparent text-admin-red-dark hover:bg-admin-red-bg',
  },
  green: {
    default: 'border-transparent bg-admin-success-text text-white',
    light:
      'border-admin-success-bg bg-admin-success-bg text-admin-success-text',
    outline: 'border-admin-success-bg bg-transparent text-admin-success-text',
    ghost:
      'border-transparent bg-transparent text-admin-success-text hover:bg-admin-success-bg',
  },
  amber: {
    default: 'border-transparent bg-admin-amber-primary text-white',
    light: 'border-admin-amber-border bg-admin-amber-bg text-admin-amber-dark',
    outline: 'border-admin-amber-border bg-transparent text-admin-amber-dark',
    ghost:
      'border-transparent bg-transparent text-admin-amber-dark hover:bg-admin-amber-bg',
  },
  slate: {
    default: 'border-transparent bg-muted-foreground text-white',
    light: 'border-border bg-muted text-muted-foreground',
    outline: 'border-border bg-transparent text-muted-foreground',
    ghost:
      'border-transparent bg-transparent text-muted-foreground hover:bg-muted',
  },
};

export function getColorBadgeClass(
  color: AppColor,
  appearance: ColorBadgeAppearance = 'default',
) {
  return COLOR_BADGE_CLASSES[color][appearance];
}
