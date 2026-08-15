import { z } from 'zod';
import { identifierSchema } from '../shared/schema-primitives';

const tabSchema = z.object({
  value: identifierSchema,
  label: z.string().min(1),
  icon: identifierSchema.optional(),
  contentProp: identifierSchema.optional(),
});

export const detailSpecSchema = z
  .object({
    componentName: identifierSchema,
    specPath: z.string().optional(),
    defaultTab: identifierSchema.optional(),
    tabs: z.array(tabSchema).min(1),
  })
  .superRefine((spec, ctx) => {
    const values = new Set<string>();
    const contentProps = new Set<string>();

    spec.tabs.forEach((tab, index) => {
      if (values.has(tab.value)) {
        ctx.addIssue({
          code: 'custom',
          message: `tab value bị trùng: ${tab.value}`,
          path: ['tabs', index, 'value'],
        });
      }
      values.add(tab.value);

      const contentProp = tab.contentProp ?? `${tab.value}Content`;
      if (contentProps.has(contentProp)) {
        ctx.addIssue({
          code: 'custom',
          message: `contentProp bị trùng: ${contentProp}`,
          path: ['tabs', index, 'contentProp'],
        });
      }
      contentProps.add(contentProp);
    });

    if (spec.defaultTab && !values.has(spec.defaultTab)) {
      ctx.addIssue({
        code: 'custom',
        message: `defaultTab không tồn tại: ${spec.defaultTab}`,
        path: ['defaultTab'],
      });
    }
  });

export type DetailTabSpec = z.infer<typeof tabSchema>;
export type DetailSpec = z.input<typeof detailSpecSchema>;
export type ResolvedDetailSpec = z.output<typeof detailSpecSchema>;
