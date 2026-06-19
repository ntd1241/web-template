import type { FormFieldKind } from './form-spec';

/**
 * Form-side field-kind registry: each kind → the `src/components/ui` input it
 * uses, its react-hook-form binding style, a sensible `defaultValues` literal,
 * and whether it carries an `options` list (hoisted to a const).
 *
 * Sibling of the table builder's column-kind registry — same idea (one place
 * names what each kind maps to), specialized for inputs.
 */
export type BindingStyle =
  | 'spread' // <Input {...field} />
  | 'select' // <Select value onValueChange> wrapper
  | 'valueOnChange' // value={field.value} onChange={field.onChange}
  | 'checked'; // checked={field.value} onCheckedChange={field.onChange}

export interface FormKindMeta {
  binding: BindingStyle;
  /** Default literal for `defaultValues`. */
  defaultLiteral: string;
  /** Whether the kind renders an `options` array (hoisted to a const). */
  hasOptions: boolean;
}

export const FORM_KIND_REGISTRY: Record<FormFieldKind, FormKindMeta> = {
  text: { binding: 'spread', defaultLiteral: "''", hasOptions: false },
  number: { binding: 'spread', defaultLiteral: '0', hasOptions: false },
  textarea: { binding: 'spread', defaultLiteral: "''", hasOptions: false },
  select: { binding: 'select', defaultLiteral: "''", hasOptions: true },
  combobox: {
    binding: 'valueOnChange',
    defaultLiteral: "''",
    hasOptions: true,
  },
  multiselect: {
    binding: 'valueOnChange',
    defaultLiteral: '[]',
    hasOptions: true,
  },
  switch: { binding: 'checked', defaultLiteral: 'false', hasOptions: false },
};

/** Width preset → desktop column span on the 12-col grid (mobile stacks). */
export const FORM_WIDTH_SPAN: Record<'normal' | 'large' | 'full', string> = {
  normal: 'md:col-span-6',
  large: 'md:col-span-8',
  full: 'md:col-span-12',
};
