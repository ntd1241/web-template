import { z } from 'zod';
import { identifierSchema } from '../shared/schema-primitives';

const importGroupSchema = z.object({
  specifier: z.string().min(1),
  values: z.array(identifierSchema).default([]),
  types: z.array(identifierSchema).default([]),
});

const fieldSchema = z.object({
  name: identifierSchema,
  kind: z.enum([
    'string',
    'stringArray',
    'enumArray',
    'optionalNumber',
    'union',
  ]),
  allowedValues: z.array(z.string().min(1)).optional(),
  allowedValuesConst: identifierSchema.optional(),
});

export const savedViewSpecSchema = z
  .object({
    entity: identifierSchema,
    specPath: z.string().optional(),
    modelImport: importGroupSchema,
    filtersType: identifierSchema,
    initialFiltersName: identifierSchema,
    resource: z.enum([
      'customers',
      'employees',
      'contracts',
      'contract_templates',
    ]),
    managePermission: z.string().optional(),
    fields: z.array(fieldSchema).min(1),
  })
  .superRefine((spec, ctx) => {
    spec.fields.forEach((field, index) => {
      if (field.kind === 'enumArray' && !field.allowedValuesConst) {
        ctx.addIssue({
          code: 'custom',
          message: 'enumArray cần khai báo allowedValuesConst',
          path: ['fields', index, 'allowedValuesConst'],
        });
      }
      if (field.kind === 'union' && !field.allowedValues?.length) {
        ctx.addIssue({
          code: 'custom',
          message: 'union cần khai báo allowedValues',
          path: ['fields', index, 'allowedValues'],
        });
      }
    });
  });

export type SavedViewSpec = z.input<typeof savedViewSpecSchema>;
export type ResolvedSavedViewSpec = z.output<typeof savedViewSpecSchema>;
export type SavedViewField = z.infer<typeof fieldSchema>;
