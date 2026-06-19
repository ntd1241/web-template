import { z } from 'zod';

/**
 * Spec schema for the form/dialog builder. A `FormSpec` is the **projection** of
 * an entity's create/edit schema into a responsive dialog form. The builder turns
 * it into a `<Entity>FormDialog` component (react-hook-form + zodResolver + the
 * `src/components/ui` inputs), laid out on a responsive 12-col grid.
 *
 * Layout: each field has a width preset (`normal` = half row, `large` = 2/3,
 * `full` = whole row); on mobile every field stacks full-width.
 */

const IDENTIFIER = /^[a-zA-Z_$][\w$]*$/;
const fieldName = z
  .string()
  .regex(/^[a-zA-Z_$][\w$]*$/, 'name phải là một khóa hợp lệ của form values');

/** Width presets → column span on the desktop 12-col grid. */
export const FORM_WIDTHS = ['normal', 'large', 'full'] as const;
const width = z.enum(FORM_WIDTHS).optional();

const option = z.object({ value: z.string(), label: z.string().min(1) });

const base = {
  name: fieldName,
  label: z.string().min(1),
  width,
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
};

const textField = z.object({
  kind: z.literal('text'),
  inputType: z.enum(['text', 'email', 'tel', 'password', 'url']).optional(),
  ...base,
});

const numberField = z.object({ kind: z.literal('number'), ...base });

const textareaField = z.object({
  kind: z.literal('textarea'),
  rows: z.number().int().positive().optional(),
  ...base,
});

const selectField = z.object({
  kind: z.literal('select'),
  options: z.array(option).min(1),
  ...base,
});

const comboboxField = z.object({
  kind: z.literal('combobox'),
  options: z.array(option).min(1),
  searchPlaceholder: z.string().optional(),
  ...base,
});

const multiselectField = z.object({
  kind: z.literal('multiselect'),
  options: z.array(option).min(1),
  searchPlaceholder: z.string().optional(),
  emptyMessage: z.string().optional(),
  ...base,
});

const switchField = z.object({ kind: z.literal('switch'), ...base });

export const formFieldSchema = z.discriminatedUnion('kind', [
  textField,
  numberField,
  textareaField,
  selectField,
  comboboxField,
  multiselectField,
  switchField,
]);

export const formSpecSchema = z.object({
  /** Entity name, e.g. `Supplier` → component `SupplierFormDialog`. */
  entity: z.string().regex(IDENTIFIER, 'entity phải là tên kiểu hợp lệ'),
  /** Import specifier for the schema module. */
  schemaImport: z.string().min(1),
  /** Exported zod schema name used as the resolver. */
  schemaName: z.string().regex(IDENTIFIER),
  /** Exported inferred values type name. */
  valuesType: z.string().regex(IDENTIFIER),
  /** Dialog title + optional description (Vietnamese). */
  title: z.string().min(1),
  description: z.string().optional(),
  /** Component name; defaults to `<Entity>FormDialog`. */
  componentName: z.string().regex(IDENTIFIER).optional(),
  /** Spec path recorded in the provenance banner. */
  specPath: z.string().optional(),
  fields: z.array(formFieldSchema).min(1, 'cần ít nhất một trường'),
});

export type FormFieldSpec = z.infer<typeof formFieldSchema>;
export type FormSpec = z.infer<typeof formSpecSchema>;
export type FormFieldKind = FormFieldSpec['kind'];
