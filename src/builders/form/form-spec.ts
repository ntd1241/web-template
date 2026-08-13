import { z } from 'zod';
import {
  comboboxFieldControlSchema,
  dateFieldControlSchema,
  imageFieldControlSchema,
  multiselectFieldControlSchema,
  numberFieldControlSchema,
  selectFieldControlSchema,
  switchFieldControlSchema,
  textareaFieldControlSchema,
  textFieldControlSchema,
} from '../shared/form-field-spec';
import { identifierSchema } from '../shared/schema-primitives';

/**
 * Spec schema for the form/dialog builder. A `FormSpec` is the **projection** of
 * an entity's create/edit schema into a responsive form. The builder emits both a
 * reusable inline `<Entity>Form` and a thin `<Entity>FormDialog` wrapper
 * (react-hook-form + zodResolver + `src/components/ui` inputs) on a 12-col grid.
 *
 * Layout: each field has a width preset (`normal` = half row, `large` = 2/3,
 * `full` = whole row); on mobile every field stacks full-width.
 */

const fieldName = identifierSchema;

/** Width presets → column span on the desktop 12-col grid. */
export const FORM_WIDTHS = ['normal', 'large', 'full'] as const;
const width = z.enum(FORM_WIDTHS).optional();

const base = {
  name: fieldName,
  label: z.string().min(1),
  width,
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
};

const textField = textFieldControlSchema.extend(base);

const imageField = imageFieldControlSchema.extend(base);

const numberField = numberFieldControlSchema.extend(base);

const dateField = dateFieldControlSchema.extend(base);

const textareaField = textareaFieldControlSchema.extend(base);

const selectField = selectFieldControlSchema.extend(base);

const comboboxField = comboboxFieldControlSchema.extend(base);

const multiselectField = multiselectFieldControlSchema.extend(base);

const switchField = switchFieldControlSchema.extend(base);

export const formFieldSchema = z.discriminatedUnion('kind', [
  textField,
  imageField,
  numberField,
  dateField,
  textareaField,
  selectField,
  comboboxField,
  multiselectField,
  switchField,
]);

export const formSpecSchema = z
  .object({
    /** Entity name, e.g. `Supplier` → component `SupplierFormDialog`. */
    entity: identifierSchema,
    /** Import specifier for the schema module. */
    schemaImport: z.string().min(1),
    /** Exported zod schema name used as the resolver. */
    schemaName: identifierSchema,
    /** Exported inferred values type name. */
    valuesType: identifierSchema,
    /** Dialog title + optional description (Vietnamese). */
    title: z.string().min(1),
    description: z.string().optional(),
    /** Component name; defaults to `<Entity>FormDialog`. */
    componentName: identifierSchema.optional(),
    /** Spec path recorded in the provenance banner. */
    specPath: z.string().optional(),
    fields: z.array(formFieldSchema).min(1, 'cần ít nhất một trường'),
  })
  .superRefine((spec, ctx) => {
    spec.fields.forEach((field, index) => {
      if (
        (field.kind === 'select' ||
          field.kind === 'combobox' ||
          field.kind === 'multiselect') &&
        field.optionsFrom !== 'prop' &&
        (!field.options || field.options.length < 1)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Trường dùng options tĩnh cần khai báo ít nhất một lựa chọn',
          path: ['fields', index, 'options'],
        });
      }
    });
  });

export type FormFieldSpec = z.infer<typeof formFieldSchema>;
export type FormSpec = z.infer<typeof formSpecSchema>;
export type FormFieldKind = FormFieldSpec['kind'];
