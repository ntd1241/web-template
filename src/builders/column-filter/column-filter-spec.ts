import { z } from 'zod';
import {
  identifierSchema,
  optionSchema,
  optionsSourceSchema,
} from '../shared/schema-primitives';

const baseFieldSchema = z.object({
  name: identifierSchema,
  className: z.string().optional(),
});

const searchFieldSchema = baseFieldSchema.extend({
  type: z.literal('search'),
  placeholder: z.string().optional(),
  ariaLabel: z.string().optional(),
  debounceMs: z.number().int().min(0).optional(),
});

const selectSearchFieldSchema = baseFieldSchema.extend({
  type: z.literal('selectSearch'),
  placeholder: z.string().optional(),
  searchPlaceholder: z.string().optional(),
  loadingMessage: z.string().optional(),
  emptyMessage: z.string().optional(),
  ariaLabel: z.string().optional(),
  optionsSource: optionsSourceSchema.default('prop'),
  options: z.array(optionSchema).min(1).optional(),
});

const multiSelectFieldSchema = baseFieldSchema.extend({
  type: z.literal('multiSelect'),
  placeholder: z.string().optional(),
  searchPlaceholder: z.string().optional(),
  maxChips: z.number().int().min(0).optional(),
  optionsSource: optionsSourceSchema.default('prop'),
  options: z.array(optionSchema).min(1).optional(),
});

const numberRangeFieldSchema = baseFieldSchema.extend({
  type: z.literal('numberRange'),
  label: z.string().min(1),
  placeholder: z.string().optional(),
});

const dateRangeFieldSchema = baseFieldSchema.extend({
  type: z.literal('dateRange'),
  label: z.string().min(1),
  placeholder: z.string().optional(),
});

export const columnFilterFieldSchema = z.discriminatedUnion('type', [
  searchFieldSchema,
  selectSearchFieldSchema,
  multiSelectFieldSchema,
  numberRangeFieldSchema,
  dateRangeFieldSchema,
]);

export const columnFilterSpecSchema = z
  .object({
    componentName: identifierSchema,
    specPath: z.string().optional(),
    fields: z.array(columnFilterFieldSchema).min(1),
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

      if (
        (field.type === 'selectSearch' || field.type === 'multiSelect') &&
        field.optionsSource === 'static' &&
        !field.options
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'options bắt buộc khi optionsSource là static',
          path: ['fields', index, 'options'],
        });
      }

      if (
        (field.type === 'selectSearch' || field.type === 'multiSelect') &&
        field.optionsSource === 'prop' &&
        field.options
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'không truyền options tĩnh khi optionsSource là prop',
          path: ['fields', index, 'options'],
        });
      }

      if (field.type !== 'selectSearch' && field.type !== 'multiSelect') {
        return;
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
    });
  });

export type ColumnFilterField = z.infer<typeof columnFilterFieldSchema>;
export type ColumnFilterSpec = z.input<typeof columnFilterSpecSchema>;
export type ResolvedColumnFilterSpec = z.output<
  typeof columnFilterSpecSchema
>;
