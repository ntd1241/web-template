export const BUILDER_INPUT_VARIANTS = {
  form: 'md',
  table: 'sm',
} as const;

export const FIELD_ALIGNMENT_CLASS = {
  left: '',
  right: 'text-right tabular-nums',
} as const;

export const FORM_FIELD_CONTROL = {
  text: {
    binding: 'spread',
    defaultLiteral: "''",
    hasOptions: false,
    importName: 'Input',
  },
  number: {
    binding: 'spread',
    defaultLiteral: '0',
    hasOptions: false,
    importName: 'Input',
    align: 'right',
  },
  date: {
    binding: 'valueOnChange',
    defaultLiteral: 'undefined',
    hasOptions: false,
    importName: 'DatePickerInput',
  },
  textarea: {
    binding: 'spread',
    defaultLiteral: "''",
    hasOptions: false,
    importName: 'Textarea',
  },
  select: {
    binding: 'select',
    defaultLiteral: "''",
    hasOptions: true,
    optionType: '{ value: string; label: string }',
    importName: 'Select',
  },
  combobox: {
    binding: 'valueOnChange',
    defaultLiteral: "''",
    hasOptions: true,
    optionType: 'ComboboxOption',
    importName: 'Combobox',
  },
  multiselect: {
    binding: 'valueOnChange',
    defaultLiteral: '[]',
    hasOptions: true,
    optionType: 'MultiSelectOption',
    importName: 'MultiSelect',
  },
  switch: {
    binding: 'checked',
    defaultLiteral: 'false',
    hasOptions: false,
    importName: 'Switch',
  },
} as const;

export const EDITOR_TABLE_FIELD_CONTROL = {
  text: {
    importName: 'Input',
    inputVariant: BUILDER_INPUT_VARIANTS.table,
    align: 'left',
  },
  number: {
    importName: 'Input',
    inputVariant: BUILDER_INPUT_VARIANTS.table,
    align: 'right',
  },
  date: {
    importName: 'Input',
    inputVariant: BUILDER_INPUT_VARIANTS.table,
    align: 'left',
  },
} as const;
