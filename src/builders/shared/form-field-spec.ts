import { z } from 'zod';
import {
  identifierSchema,
  optionSchema,
  optionsSourceSchema,
} from './schema-primitives';

/**
 * Shared, control-level schemas. Higher-level builders extend these objects
 * with their own metadata (label/width for forms, header/column sizing for
 * editor tables) instead of redefining control options.
 */

export const textFieldControlSchema = z.object({
  kind: z.literal('text'),
  inputType: z.enum(['text', 'email', 'tel', 'password', 'url']).optional(),
});

export const imageFieldControlSchema = z.object({
  kind: z.literal('image'),
  accept: z.string().optional(),
  maxSizeMb: z.number().positive().optional(),
  fallbackText: z.string().max(3).optional(),
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

export const searchSelectFieldControlSchema = z.object({
  kind: z.literal('searchSelect'),
  options: z.array(optionSchema).optional(),
  optionsFrom: optionsSourceSchema.optional(),
  searchPlaceholder: z.string().optional(),
  emptyMessage: z.string().optional(),
});

export const apiSearchSelectFieldControlSchema = z.object({
  kind: z.literal('apiSearchSelect'),
  searchPlaceholder: z.string().optional(),
  emptyMessage: z.string().optional(),
  minSearchLength: z.number().int().nonnegative().optional(),
  debounceMs: z.number().int().nonnegative().optional(),
});

export const customerSelectFieldControlSchema = z.object({
  kind: z.literal('customerSelect'),
});

export const inputSelectFieldControlSchema = z.object({
  kind: z.literal('inputSelect'),
  /** Secondary field bound to the trailing select. */
  selectName: identifierSchema,
  selectOptions: z.array(optionSchema).optional(),
  selectOptionsFrom: optionsSourceSchema.optional(),
  selectPlaceholder: z.string().optional(),
  selectDefaultValue: z.string().optional(),
  inputType: z.enum(['text', 'email', 'tel', 'url', 'number']).optional(),
});

export const multiselectFieldControlSchema = z.object({
  kind: z.literal('multiselect'),
  options: z.array(optionSchema).optional(),
  optionsFrom: optionsSourceSchema.optional(),
  searchPlaceholder: z.string().optional(),
  emptyMessage: z.string().optional(),
});

export const tagSelectFieldControlSchema = z.object({
  kind: z.literal('tagSelect'),
  moduleCodes: z.array(z.string().min(1)).optional(),
  allowCustomGroups: z.boolean().optional(),
  searchPlaceholder: z.string().optional(),
  emptyMessage: z.string().optional(),
});

export const switchFieldControlSchema = z.object({
  kind: z.literal('switch'),
});

export const formFieldControlSchemas = {
  text: textFieldControlSchema,
  image: imageFieldControlSchema,
  number: numberFieldControlSchema,
  date: dateFieldControlSchema,
  textarea: textareaFieldControlSchema,
  select: selectFieldControlSchema,
  combobox: comboboxFieldControlSchema,
  searchSelect: searchSelectFieldControlSchema,
  apiSearchSelect: apiSearchSelectFieldControlSchema,
  customerSelect: customerSelectFieldControlSchema,
  inputSelect: inputSelectFieldControlSchema,
  multiselect: multiselectFieldControlSchema,
  tagSelect: tagSelectFieldControlSchema,
  switch: switchFieldControlSchema,
} as const;

export const formFieldControlSchema = z.discriminatedUnion('kind', [
  textFieldControlSchema,
  imageFieldControlSchema,
  numberFieldControlSchema,
  dateFieldControlSchema,
  textareaFieldControlSchema,
  selectFieldControlSchema,
  comboboxFieldControlSchema,
  searchSelectFieldControlSchema,
  apiSearchSelectFieldControlSchema,
  customerSelectFieldControlSchema,
  inputSelectFieldControlSchema,
  multiselectFieldControlSchema,
  tagSelectFieldControlSchema,
  switchFieldControlSchema,
]);

export type SharedTextFieldControl = z.infer<typeof textFieldControlSchema>;
export type SharedImageFieldControl = z.infer<typeof imageFieldControlSchema>;
export type SharedNumberFieldControl = z.infer<typeof numberFieldControlSchema>;
export type SharedDateFieldControl = z.infer<typeof dateFieldControlSchema>;
export type SharedTextareaFieldControl = z.infer<
  typeof textareaFieldControlSchema
>;
export type SharedSelectFieldControl = z.infer<typeof selectFieldControlSchema>;
export type SharedComboboxFieldControl = z.infer<
  typeof comboboxFieldControlSchema
>;
export type SharedSearchSelectFieldControl = z.infer<
  typeof searchSelectFieldControlSchema
>;
export type SharedApiSearchSelectFieldControl = z.infer<
  typeof apiSearchSelectFieldControlSchema
>;
export type SharedCustomerSelectFieldControl = z.infer<
  typeof customerSelectFieldControlSchema
>;
export type SharedInputSelectFieldControl = z.infer<
  typeof inputSelectFieldControlSchema
>;
export type SharedMultiselectFieldControl = z.infer<
  typeof multiselectFieldControlSchema
>;
export type SharedTagSelectFieldControl = z.infer<
  typeof tagSelectFieldControlSchema
>;
export type SharedSwitchFieldControl = z.infer<typeof switchFieldControlSchema>;
export type FormFieldControlSpec = z.infer<typeof formFieldControlSchema>;
