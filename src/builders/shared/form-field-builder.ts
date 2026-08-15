import {
  FORM_FIELD_CONTROL,
  type FormFieldControlKind,
} from './field-control-registry';

export type FormFieldBinding =
  'spread' | 'select' | 'valueOnChange' | 'checked';

export interface FormFieldControlOptions {
  kind: FormFieldControlKind;
  /** `form` keeps the generated FormControl wrapper; `cell` emits the input only. */
  surface?: 'form' | 'cell';
  binding?: FormFieldBinding;
  fieldExpression?: string;
  valueExpression?: string;
  onChangeExpression?: string;
  onChangeHandlerExpression?: string;
  onBlurExpression?: string;
  variant?: string;
  placeholder?: string;
  inputType?: string;
  rows?: number;
  optionsExpression?: string;
  selectLabel?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loadOptionsExpression?: string;
  selectedOptionExpression?: string;
  minSearchLength?: number;
  debounceMs?: number;
  calendarLabel?: string;
  calendarLabelExpression?: string;
  format?: 'plain' | 'currency' | 'percent' | 'display' | 'iso';
  ariaLabelExpression?: string;
  ariaInvalidExpression?: string;
  disabledExpression?: string;
  className?: string;
  numberAttributes?: string;
  accept?: string;
  maxSizeMb?: number;
  onFileChangeExpression?: string;
  label?: string;
  fallbackText?: string;
}

function attribute(name: string, value?: string): string {
  return value ? ` ${name}="${value.replace(/"/g, '&quot;')}"` : '';
}

function expressionAttribute(name: string, expression?: string): string {
  return expression ? ` ${name}={${expression}}` : '';
}

function controlOpen(options: FormFieldControlOptions): string {
  return options.surface === 'form' ? '<FormControl>\n  ' : '';
}

function controlClose(options: FormFieldControlOptions): string {
  return options.surface === 'form' ? '\n</FormControl>' : '';
}

function fieldExpression(options: FormFieldControlOptions): string {
  return options.fieldExpression ?? 'field';
}

function controlledValue(options: FormFieldControlOptions): string {
  return options.valueExpression ?? `${fieldExpression(options)}.value`;
}

function controlledChange(options: FormFieldControlOptions): string {
  return options.onChangeExpression ?? `${fieldExpression(options)}.onChange`;
}

function controlledBlur(options: FormFieldControlOptions): string {
  return options.onBlurExpression ?? `${fieldExpression(options)}.onBlur`;
}

function inputAttributes(options: FormFieldControlOptions): string {
  const attrs = [
    expressionAttribute('aria-label', options.ariaLabelExpression),
    expressionAttribute('aria-invalid', options.ariaInvalidExpression),
    expressionAttribute('disabled', options.disabledExpression),
    attribute('className', options.className),
  ];

  if (options.numberAttributes) attrs.push(options.numberAttributes);

  return attrs.join('');
}

function dateValueMode(options: FormFieldControlOptions): 'date' | 'iso-date' {
  if (options.format === 'display') return 'date';
  if (options.format === 'iso') return 'iso-date';
  return options.surface === 'cell' ? 'iso-date' : 'date';
}

function numberFormatSuffix(
  format?: FormFieldControlOptions['format'],
): string {
  if (format === 'currency') return ' suffix=" ₫"';
  if (format === 'percent') return ' suffix=" %"';
  return '';
}

/**
 * Shared codegen for form controls. Higher-level builders provide the binding
 * expressions and surface-specific attributes; this function owns the
 * control-to-UI mapping and keeps the emitted JSX consistent.
 */
export function buildFormFieldControl(
  options: FormFieldControlOptions,
): string {
  const meta = FORM_FIELD_CONTROL[options.kind];
  const binding = options.binding ?? meta.binding;
  const variant = attribute('variant', options.variant);
  const placeholder = attribute('placeholder', options.placeholder);
  const field = fieldExpression(options);
  const value = controlledValue(options);
  const change = controlledChange(options);
  const blur = controlledBlur(options);
  const attrs = inputAttributes(options);

  switch (options.kind) {
    case 'text':
    case 'number': {
      const isFormattedNumber =
        options.kind === 'number' &&
        options.format !== undefined &&
        options.format !== 'plain';
      const type = options.kind === 'number' ? 'number' : options.inputType;
      const typeAttr = type && type !== 'text' ? ` type="${type}"` : '';
      const controlled =
        binding !== 'spread' ||
        options.valueExpression !== undefined ||
        options.onChangeExpression !== undefined;
      const onChange =
        options.kind === 'number'
          ? `${change}(\n            Number.isNaN(event.target.valueAsNumber)\n              ? 0\n              : event.target.valueAsNumber,\n          )`
          : `${change}(event)`;
      const changeAttribute = options.onChangeHandlerExpression
        ? ` onChange={${options.onChangeHandlerExpression}}`
        : `\n        onChange={(event) =>\n          ${onChange}\n        }`;
      const input = isFormattedNumber
        ? `<NumericInput${attrs}${numberFormatSuffix(options.format)}${placeholder} value={${value}}${variant}\n        onBlur={${blur}}\n        onValueChange={${change}}\n      />`
        : controlled
          ? `<Input${attrs}${typeAttr}${placeholder} value={${value}}${variant}\n        onBlur={${blur}}${changeAttribute}\n      />`
          : options.surface === 'cell'
            ? `<Input {...${field}}${attrs}${typeAttr}${variant} />`
            : `<Input${typeAttr}${placeholder}${variant} {...${field}} />`;

      return `${controlOpen(options)}${input}${controlClose(options)}`;
    }
    case 'image': {
      const accept = attribute('accept', options.accept);
      const maxSizeMb = options.maxSizeMb
        ? ` maxSizeMb={${options.maxSizeMb}}`
        : '';
      const onFileChange = options.onFileChangeExpression
        ? ` onFileChange={${options.onFileChangeExpression}}`
        : '';
      const label = attribute('label', options.label);
      const fallbackText = attribute('fallbackText', options.fallbackText);
      const input = `<ImageUploadField value={${value}} onValueChange={${change}}${onFileChange}${accept}${maxSizeMb}${label}${fallbackText} />`;
      return `${controlOpen(options)}${input}${controlClose(options)}`;
    }
    case 'date': {
      const calendarLabel = options.calendarLabelExpression
        ? ` calendarLabel={${options.calendarLabelExpression}}`
        : options.calendarLabel
          ? attribute('calendarLabel', options.calendarLabel)
          : '';
      const valueMode = ` valueMode="${dateValueMode(options)}"`;
      const input =
        options.surface === 'form'
          ? `<DatePickerInput value={${value}} onChange={${change}} onBlur={${blur}}${calendarLabel}${valueMode}${variant} />`
          : `<DatePickerInput${attrs}${calendarLabel} value={${value}}${valueMode}${variant}\n        onBlur={${blur}}\n        onChange={${options.onChangeHandlerExpression ?? change}}\n      />`;
      return `${controlOpen(options)}${input}${controlClose(options)}`;
    }
    case 'textarea': {
      const input = `<Textarea rows={${options.rows ?? 3}}${placeholder} {...${field}} />`;
      return `${controlOpen(options)}${input}${controlClose(options)}`;
    }
    case 'select': {
      const optionsExpression = options.optionsExpression ?? 'options';
      const selectLabel = attribute('label', options.selectLabel);
      return `<Select value={${value}} onValueChange={${change}}>
  <FormControl>
    <SelectTrigger>
      <SelectValue${placeholder}${selectLabel} />
    </SelectTrigger>
  </FormControl>
  <SelectContent>
    {${optionsExpression}.map((opt) => (
      <SelectItem key={opt.value} value={opt.value}>
        {opt.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>`;
    }
    case 'combobox':
    case 'searchSelect': {
      const optionsExpression = options.optionsExpression ?? 'options';
      const searchPlaceholder = attribute(
        'searchPlaceholder',
        options.searchPlaceholder,
      );
      const emptyMessage = attribute('emptyMessage', options.emptyMessage);
      return `${controlOpen(options)}<SelectSearch value={${value}} onChange={${change}} options={${optionsExpression}}${placeholder}${searchPlaceholder}${emptyMessage} />${controlClose(options)}`;
    }
    case 'apiSearchSelect': {
      const searchPlaceholder = attribute(
        'searchPlaceholder',
        options.searchPlaceholder,
      );
      const emptyMessage = attribute('emptyMessage', options.emptyMessage);
      const loadOptions = expressionAttribute(
        'loadOptions',
        options.loadOptionsExpression,
      );
      const selectedOption = expressionAttribute(
        'selectedOption',
        options.selectedOptionExpression,
      );
      const minSearchLength =
        options.minSearchLength === undefined
          ? ''
          : ` minSearchLength={${options.minSearchLength}}`;
      const debounceMs =
        options.debounceMs === undefined
          ? ''
          : ` debounceMs={${options.debounceMs}}`;

      return `${controlOpen(options)}<ApiSelectSearch value={${value}} onChange={${change}}${loadOptions}${selectedOption}${placeholder}${searchPlaceholder}${emptyMessage}${minSearchLength}${debounceMs} />${controlClose(options)}`;
    }
    case 'customerSelect':
      return `${controlOpen(options)}<CustomerSelect value={${value}} onChange={${change}}${placeholder} />${controlClose(options)}`;
    case 'multiselect': {
      const optionsExpression = options.optionsExpression ?? 'options';
      const searchPlaceholder = attribute(
        'searchPlaceholder',
        options.searchPlaceholder,
      );
      const emptyMessage = attribute('emptyMessage', options.emptyMessage);
      return `${controlOpen(options)}<MultiSelect value={${value}} onChange={${change}} options={${optionsExpression}}${placeholder}${searchPlaceholder}${emptyMessage} />${controlClose(options)}`;
    }
    case 'switch':
      return `${controlOpen(options)}<Switch checked={${value}} onCheckedChange={${change}} />${controlClose(options)}`;
  }
}
