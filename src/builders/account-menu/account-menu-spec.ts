import { z } from 'zod';

const IDENTIFIER = /^[a-zA-Z_$][\w$]*$/;

const identifier = z.string().regex(IDENTIFIER, 'phải là một định danh hợp lệ');

const iconName = identifier;

const badgeSchema = z.object({
  text: z.string().min(1),
  tooltip: z.string().min(1),
  variant: z
    .enum(['primary', 'secondary', 'destructive', 'warning', 'info'])
    .default('destructive'),
});

const itemBaseShape = {
  key: identifier,
  label: z.string().min(1),
  icon: iconName,
  description: z.string().min(1).optional(),
};

const itemSchema = z.discriminatedUnion('kind', [
  z.object({
    ...itemBaseShape,
    kind: z.literal('item'),
    destructive: z.boolean().default(false),
    badge: badgeSchema.optional(),
  }),
  z.object({
    ...itemBaseShape,
    kind: z.literal('switch'),
    defaultChecked: z.boolean().default(false),
  }),
  z.object({
    ...itemBaseShape,
    kind: z.literal('submenu'),
    valueMode: z.enum(['label', 'asset', 'none']).default('label'),
    defaultValue: z.string().optional(),
    options: z
      .array(
        z.object({
          value: identifier,
          label: z.string().min(1),
          asset: z.string().min(1).optional(),
          assetAlt: z.string().min(1).optional(),
        }),
      )
      .min(1),
  }),
]);

const groupSchema = z.object({
  key: identifier,
  label: z.string().min(1).optional(),
  items: z.array(itemSchema).min(1),
});

export const accountMenuSpecSchema = z
  .object({
    componentName: identifier,
    specPath: z.string().optional(),
    groups: z.array(groupSchema).min(1),
  })
  .superRefine((spec, ctx) => {
    const itemKeys = new Set<string>();

    for (const [groupIndex, group] of spec.groups.entries()) {
      for (const [itemIndex, item] of group.items.entries()) {
        if (itemKeys.has(item.key)) {
          ctx.addIssue({
            code: 'custom',
            message: `item key bị trùng: ${item.key}`,
            path: ['groups', groupIndex, 'items', itemIndex, 'key'],
          });
        }
        itemKeys.add(item.key);

        if (item.kind !== 'submenu') continue;

        const optionValues = new Set<string>();
        for (const [optionIndex, option] of item.options.entries()) {
          if (optionValues.has(option.value)) {
            ctx.addIssue({
              code: 'custom',
              message: `submenu option value bị trùng: ${option.value}`,
              path: [
                'groups',
                groupIndex,
                'items',
                itemIndex,
                'options',
                optionIndex,
                'value',
              ],
            });
          }
          optionValues.add(option.value);
        }

        if (item.defaultValue && !optionValues.has(item.defaultValue)) {
          ctx.addIssue({
            code: 'custom',
            message: 'defaultValue phải trùng với một option của submenu',
            path: ['groups', groupIndex, 'items', itemIndex, 'defaultValue'],
          });
        }

        if (
          item.valueMode === 'asset' &&
          !item.options.some((option) => option.asset)
        ) {
          ctx.addIssue({
            code: 'custom',
            message: 'valueMode asset cần ít nhất một option có asset',
            path: ['groups', groupIndex, 'items', itemIndex, 'valueMode'],
          });
        }
      }
    }
  });

export type AccountMenuItemSpec = z.infer<typeof itemSchema>;
export type AccountMenuGroupSpec = z.infer<typeof groupSchema>;
export type AccountMenuSpec = z.input<typeof accountMenuSpecSchema>;
export type ResolvedAccountMenuSpec = z.output<typeof accountMenuSpecSchema>;
