import { z } from 'zod';
import {
  identifierSchema,
  optionSchema,
  optionsSourceSchema,
} from '../shared/schema-primitives';

const baseFieldSchema = z.object({
  name: identifierSchema,
  className: z.string().optional(),
  disabled: z.boolean().optional(),
});

const searchFieldSchema = baseFieldSchema.extend({
  type: z.literal('search'),
  placeholder: z.string().optional(),
  debounceMs: z.number().int().min(0).optional(),
});

const selectFieldSchema = baseFieldSchema.extend({
  type: z.literal('select'),
  label: z.string().optional(),
  placeholder: z.string().optional(),
  ariaLabel: z.string().optional(),
  optionsSource: optionsSourceSchema.default('static'),
  options: z.array(optionSchema).min(1).optional(),
});

export const filterFieldSchema = z.discriminatedUnion('type', [
  searchFieldSchema,
  selectFieldSchema,
]);

export const filterSpecSchema = z
  .object({
    componentName: identifierSchema,
    specPath: z.string().optional(),
    fields: z.array(filterFieldSchema).min(1),
  })
  .superRefine((spec, ctx) => {
    const names = new Set<string>();

    spec.fields.forEach((field, index) => {
      if (names.has(field.name)) {
        ctx.addIssue({
          code: 'custom',
          message: 'field name bị trùng: ' + field.name,
          path: ['fields', index, 'name'],
        });
      }
      names.add(field.name);

      if (field.type === 'select') {
        if (field.optionsSource === 'static' && !field.options) {
          ctx.addIssue({
            code: 'custom',
            message: 'options bắt buộc khi optionsSource là static',
            path: ['fields', index, 'options'],
          });
        }

        if (field.optionsSource === 'prop' && field.options) {
          ctx.addIssue({
            code: 'custom',
            message: 'không truyền options tĩnh khi optionsSource là prop',
            path: ['fields', index, 'options'],
          });
        }

        const values = new Set<string>();
        field.options?.forEach((option, optionIndex) => {
          if (values.has(option.value)) {
            ctx.addIssue({
              code: 'custom',
              message: 'option value bị trùng: ' + option.value,
              path: ['fields', index, 'options', optionIndex, 'value'],
            });
          }
          values.add(option.value);
        });
      }
    });
  });

export type FilterField = z.infer<typeof filterFieldSchema>;
export type FilterSpec = z.input<typeof filterSpecSchema>;
export type ResolvedFilterSpec = z.output<typeof filterSpecSchema>;
