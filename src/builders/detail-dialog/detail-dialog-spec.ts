import { z } from 'zod';
import { identifierSchema } from '../shared/schema-primitives';

const tabSchema = z.object({
  value: identifierSchema,
  label: z.string().min(1),
  icon: identifierSchema.optional(),
  contentMode: z.enum(['table', 'custom']).default('table'),
  fieldProp: identifierSchema.optional(),
  contentProp: identifierSchema.optional(),
  searchTextProp: identifierSchema.optional(),
});

export const detailDialogSpecSchema = z
  .object({
    componentName: identifierSchema,
    specPath: z.string().optional(),
    defaultTab: identifierSchema.optional(),
    tabs: z.array(tabSchema).min(1),
  })
  .superRefine((spec, ctx) => {
    const values = new Set<string>();
    const contentProps = new Set<string>();
    const searchTextProps = new Set<string>();

    spec.tabs.forEach((tab, index) => {
      if (values.has(tab.value)) {
        ctx.addIssue({
          code: 'custom',
          message: `tab value bị trùng: ${tab.value}`,
          path: ['tabs', index, 'value'],
        });
      }
      values.add(tab.value);

      const contentProp =
        tab.contentMode === 'table'
          ? (tab.fieldProp ?? `${tab.value}Fields`)
          : (tab.contentProp ?? `${tab.value}Content`);
      if (contentProps.has(contentProp)) {
        ctx.addIssue({
          code: 'custom',
          message: `content slot bị trùng: ${contentProp}`,
          path: ['tabs', index, 'fieldProp'],
        });
      }
      contentProps.add(contentProp);

      if (tab.searchTextProp) {
        if (searchTextProps.has(tab.searchTextProp)) {
          ctx.addIssue({
            code: 'custom',
            message: `searchTextProp bị trùng: ${tab.searchTextProp}`,
            path: ['tabs', index, 'searchTextProp'],
          });
        }
        searchTextProps.add(tab.searchTextProp);
      }
    });

    if (spec.defaultTab && !values.has(spec.defaultTab)) {
      ctx.addIssue({
        code: 'custom',
        message: `defaultTab không tồn tại: ${spec.defaultTab}`,
        path: ['defaultTab'],
      });
    }
  });

export type DetailDialogTabSpec = z.infer<typeof tabSchema>;
export type DetailDialogSpec = z.input<typeof detailDialogSpecSchema>;
export type ResolvedDetailDialogSpec = z.output<typeof detailDialogSpecSchema>;
