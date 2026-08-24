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

/** The only color-specific fill token used by solid color badges/swatches. */
export const COLOR_PRIMARY_CLASSES: Record<AppColor, string> = {
  blue: 'bg-admin-blue-primary',
  violet: 'bg-admin-violet-primary',
  red: 'bg-admin-red-primary',
  green: 'bg-admin-success-text',
  amber: 'bg-admin-amber-primary',
  slate: 'bg-muted-foreground',
};

export const COLOR_SWATCH_CLASSES: Record<AppColor, string> =
  Object.fromEntries(
    APP_COLORS.map((color) => [
      color,
      `border-transparent ${COLOR_PRIMARY_CLASSES[color]}`,
    ]),
  ) as Record<AppColor, string>;

export const COLOR_TEXT_CLASSES: Record<AppColor, string> = {
  blue: 'text-admin-blue-dark',
  violet: 'text-admin-violet-dark',
  red: 'text-admin-red-dark',
  green: 'text-admin-success-text',
  amber: 'text-admin-amber-dark',
  slate: 'text-muted-foreground',
};

export type ColorBadgeAppearance = 'default' | 'light' | 'outline' | 'ghost';

const COLOR_BADGE_COMMON_CLASSES: Record<
  Exclude<ColorBadgeAppearance, 'default'>,
  string
> = {
  light: 'border-current/20 bg-current/10',
  outline: 'border-current/40 bg-transparent',
  ghost: 'border-transparent bg-transparent hover:bg-current/10',
};

export const COLOR_BADGE_CLASSES: Record<
  AppColor,
  Record<ColorBadgeAppearance, string>
> = Object.fromEntries(
  APP_COLORS.map((color) => [
    color,
    {
      default: `border-transparent ${COLOR_PRIMARY_CLASSES[color]} text-white`,
      light: `${COLOR_BADGE_COMMON_CLASSES.light} ${COLOR_TEXT_CLASSES[color]}`,
      outline: `${COLOR_BADGE_COMMON_CLASSES.outline} ${COLOR_TEXT_CLASSES[color]}`,
      ghost: `${COLOR_BADGE_COMMON_CLASSES.ghost} ${COLOR_TEXT_CLASSES[color]}`,
    },
  ]),
) as Record<AppColor, Record<ColorBadgeAppearance, string>>;

export function getColorBadgeClass(
  color: AppColor,
  appearance: ColorBadgeAppearance = 'default',
) {
  return COLOR_BADGE_CLASSES[color][appearance];
}
