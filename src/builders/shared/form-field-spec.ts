import { z } from 'zod';

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
});

export const dateFieldControlSchema = z.object({
  kind: z.literal('date'),
  /** Value contract consumed by DatePickerInput. */
  valueMode: z.enum(['date', 'iso-date']).optional(),
});

export const textareaFieldControlSchema = z.object({
  kind: z.literal('textarea'),
  rows: z.number().int().positive().optional(),
});

const option = z.object({ value: z.string(), label: z.string().min(1) });
const optionsFrom = z.enum(['static', 'prop']).optional();

export const selectFieldControlSchema = z.object({
  kind: z.literal('select'),
  options: z.array(option).optional(),
  optionsFrom,
});

export const comboboxFieldControlSchema = z.object({
  kind: z.literal('combobox'),
  options: z.array(option).optional(),
  optionsFrom,
  searchPlaceholder: z.string().optional(),
});

export const multiselectFieldControlSchema = z.object({
  kind: z.literal('multiselect'),
  options: z.array(option).optional(),
  optionsFrom,
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
