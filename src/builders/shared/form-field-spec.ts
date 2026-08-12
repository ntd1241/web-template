import { z } from 'zod';
import { optionSchema, optionsSourceSchema } from './schema-primitives';

/**
 * Shared, control-level schemas. Higher-level builders extend these objects
 * with their own metadata (label/width for forms, header/column sizing for
 * editor tables) instead of redefining control options.
 */

export const textFieldControlSchema = z.object({
  kind: z.literal('text'),
  inputType: z.enum(['text', 'email', 'tel', 'password', 'url']).optional(),
});

export const numberFieldControlSchema = z.object({
  kind: z.literal('number'),
  /** Semantic display/input format; the renderer maps this to the runtime control. */
  format: z.enum(['plain', 'currency', 'percent']).optional(),
});

export const dateFieldControlSchema = z.object({
  kind: z.literal('date'),
  /** Semantic date format; the renderer maps this to DatePickerInput's value mode. */
  format: z.enum(['display', 'iso']).optional(),
});

export const textareaFieldControlSchema = z.object({
  kind: z.literal('textarea'),
  rows: z.number().int().positive().optional(),
});

export const selectFieldControlSchema = z.object({
  kind: z.literal('select'),
  options: z.array(optionSchema).optional(),
  optionsFrom: optionsSourceSchema.optional(),
});

export const comboboxFieldControlSchema = z.object({
  kind: z.literal('combobox'),
  options: z.array(optionSchema).optional(),
  optionsFrom: optionsSourceSchema.optional(),
  searchPlaceholder: z.string().optional(),
});

export const multiselectFieldControlSchema = z.object({
  kind: z.literal('multiselect'),
  options: z.array(optionSchema).optional(),
  optionsFrom: optionsSourceSchema.optional(),
  searchPlaceholder: z.string().optional(),
  emptyMessage: z.string().optional(),
});

export const switchFieldControlSchema = z.object({
  kind: z.literal('switch'),
});

export const formFieldControlSchemas = {
  text: textFieldControlSchema,
  number: numberFieldControlSchema,
  date: dateFieldControlSchema,
  textarea: textareaFieldControlSchema,
  select: selectFieldControlSchema,
  combobox: comboboxFieldControlSchema,
  multiselect: multiselectFieldControlSchema,
  switch: switchFieldControlSchema,
} as const;

export const formFieldControlSchema = z.discriminatedUnion('kind', [
  textFieldControlSchema,
  numberFieldControlSchema,
  dateFieldControlSchema,
  textareaFieldControlSchema,
  selectFieldControlSchema,
  comboboxFieldControlSchema,
  multiselectFieldControlSchema,
  switchFieldControlSchema,
]);

export type SharedTextFieldControl = z.infer<typeof textFieldControlSchema>;
export type SharedNumberFieldControl = z.infer<typeof numberFieldControlSchema>;
export type SharedDateFieldControl = z.infer<typeof dateFieldControlSchema>;
export type SharedTextareaFieldControl = z.infer<
  typeof textareaFieldControlSchema
>;
export type SharedSelectFieldControl = z.infer<typeof selectFieldControlSchema>;
export type SharedComboboxFieldControl = z.infer<
  typeof comboboxFieldControlSchema
>;
export type SharedMultiselectFieldControl = z.infer<
  typeof multiselectFieldControlSchema
>;
export type SharedSwitchFieldControl = z.infer<typeof switchFieldControlSchema>;
export type FormFieldControlSpec = z.infer<typeof formFieldControlSchema>;
