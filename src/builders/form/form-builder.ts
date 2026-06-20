import { BUILDER_INPUT_VARIANTS } from '../shared/field-control-registry';
import { FORM_KIND_REGISTRY, FORM_WIDTH_SPAN } from './field-kinds';
import { formSpecSchema, type FormFieldSpec, type FormSpec } from './form-spec';

/**
 * Pure form-builder generator. `buildFormModule(spec)` validates the spec and
 * returns the source of a `*-form.generated.tsx`: a reusable `<Entity>Form`,
 * parent-owned `use<Entity>Form()` hook, mapper stub, and thin
 * `<Entity>FormDialog` wrapper. Fields sit on a responsive 12-col grid (width
 * presets normal/large/full; stacks on mobile).
 *
 * Scaffold-and-own: after generation you own the file. Wire submit + edit reset
 * behavior in the parent. To change fields/layout, edit the spec and re-gen.
 */

function banner(specPath?: string): string {
  const source = specPath ? ` from \`${specPath}\`` : '';
  return `/**
 * Scaffolded by form-builder${source}. Run \`npm run gen:form\` — do NOT hand-write this file.
 * You own this file now — wire submit + edit reset behavior in the parent. To change fields,
 * widths or layout, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated options consts — that's how review detects a bypassed builder.
 */`;
}

function str(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function span(field: FormFieldSpec): string {
  return FORM_WIDTH_SPAN[
    field.width ?? (field.kind === 'switch' ? 'full' : 'normal')
  ];
}

function attr(name: string, value?: string): string {
  return value ? ` ${name}="${value}"` : '';
}

const OPTION_KINDS = new Set(['select', 'combobox', 'multiselect']);

type OptionFieldSpec = Extract<
  FormFieldSpec,
  { kind: 'select' | 'combobox' | 'multiselect' }
>;

function isOptionField(field: FormFieldSpec): field is OptionFieldSpec {
  return OPTION_KINDS.has(field.kind);
}

function isStaticOptionField(
  field: FormFieldSpec,
): field is OptionFieldSpec & { options: { value: string; label: string }[] } {
  return isOptionField(field) && field.optionsFrom !== 'prop';
}

function propOptionFields(fields: FormFieldSpec[]): OptionFieldSpec[] {
  return fields.filter(
    (field): field is OptionFieldSpec =>
      isOptionField(field) && field.optionsFrom === 'prop',
  );
}

function lowerFirst(value: string): string {
  return `${value.charAt(0).toLowerCase()}${value.slice(1)}`;
}

function deriveInlineComponentName(
  spec: FormSpec,
  dialogComponent: string,
): string {
  if (!spec.componentName) return `${spec.entity}Form`;
  const stripped = dialogComponent.replace(/(?:Form)?Dialog$/, '');
  return `${stripped || spec.entity}Form`;
}

/** Hoisted `const <name>Options = [...]` for select/combobox/multiselect. */
function emitOptionConsts(fields: FormFieldSpec[]): string {
  return fields
    .filter(isStaticOptionField)
    .map((f) => {
      const isMulti = f.kind === 'multiselect';
      const rows = f.options
        .map((o) =>
          isMulti
            ? `  { value: ${str(o.value)}, label: ${str(o.label)}, searchableText: ${str(o.label)} },`
            : `  { value: ${str(o.value)}, label: ${str(o.label)} },`,
        )
        .join('\n');
      const annotation = isMulti ? ': MultiSelectOption[]' : '';
      return `const ${f.name}Options${annotation} = [\n${rows}\n];`;
    })
    .join('\n\n');
}

function emitDefaultValues(spec: FormSpec): string {
  const rows = spec.fields
    .map((f) => `  ${f.name}: ${FORM_KIND_REGISTRY[f.kind].defaultLiteral},`)
    .join('\n');
  return `export const ${lowerFirst(spec.entity)}DefaultValues: ${spec.valuesType} = {\n${rows}\n};`;
}

function labelJsx(field: FormFieldSpec): string {
  const mark = field.required
    ? '<span className="text-destructive"> *</span>'
    : '';
  return `${field.label}${mark}`;
}

/** The control element(s) for a field (everything between label and message). */
function controlJsx(field: FormFieldSpec): string {
  const ph = attr('placeholder', field.placeholder);

  switch (field.kind) {
    case 'text': {
      const type =
        field.inputType && field.inputType !== 'text'
          ? ` type="${field.inputType}"`
          : '';
      return `<FormControl>\n  <Input${type}${ph} variant="${BUILDER_INPUT_VARIANTS.form}" {...field} />\n</FormControl>`;
    }
    case 'number':
      return `<FormControl>\n  <Input type="number"${ph} variant="${BUILDER_INPUT_VARIANTS.form}" {...field} />\n</FormControl>`;
    case 'date':
      return `<FormControl>\n  <DatePickerInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} calendarLabel="Chọn ${field.label.toLowerCase()}" variant="${BUILDER_INPUT_VARIANTS.form}" />\n</FormControl>`;
    case 'textarea':
      return `<FormControl>\n  <Textarea rows={${field.rows ?? 3}}${ph} {...field} />\n</FormControl>`;
    case 'select':
      return `<Select value={field.value} onValueChange={field.onChange}>
  <FormControl>
    <SelectTrigger>
      <SelectValue${ph} />
    </SelectTrigger>
  </FormControl>
  <SelectContent>
    {${field.name}Options.map((opt) => (
      <SelectItem key={opt.value} value={opt.value}>
        {opt.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>`;
    case 'combobox':
      return `<FormControl>\n  <Combobox value={field.value} onChange={field.onChange} options={${field.name}Options}${ph} />\n</FormControl>`;
    case 'multiselect': {
      const sp = attr('searchPlaceholder', field.searchPlaceholder);
      const em = attr('emptyMessage', field.emptyMessage);
      return `<FormControl>\n  <MultiSelect value={field.value} onChange={field.onChange} options={${field.name}Options}${ph}${sp}${em} />\n</FormControl>`;
    }
    case 'switch':
      return `<FormControl>\n  <Switch checked={field.value} onCheckedChange={field.onChange} />\n</FormControl>`;
  }
}

function emitField(field: FormFieldSpec): string {
  const item =
    field.kind === 'switch'
      ? `<FormItem className="${span(field)} flex-row items-center gap-2.5">
  ${controlJsx(field)}
  <FormLabel className="font-normal text-foreground">${field.label}</FormLabel>
</FormItem>`
      : `<FormItem className="${span(field)}">
  <FormLabel>${labelJsx(field)}</FormLabel>
  ${controlJsx(field)}
  <FormMessage />
</FormItem>`;

  return `<FormField
  control={form.control}
  name="${field.name}"
  render={({ field }) => (
    ${item}
  )}
/>`;
}

function emitImports(spec: FormSpec): string {
  const kinds = new Set(spec.fields.map((f) => f.kind));
  const propFields = propOptionFields(spec.fields);
  const needMessage = spec.fields.some((f) => f.kind !== 'switch');

  const formParts = [
    'Form',
    'FormControl',
    'FormField',
    'FormItem',
    'FormLabel',
  ];
  if (needMessage) formParts.push('FormMessage');
  formParts.sort();

  const lines = [
    "import { zodResolver } from '@hookform/resolvers/zod';",
    "import { useForm } from 'react-hook-form';",
    "import type { UseFormProps, UseFormReturn } from 'react-hook-form';",
    "import { Button } from '@/components/ui/button';",
    "import {\n  Dialog,\n  DialogContent,\n  DialogDescription,\n  DialogFooter,\n  DialogHeader,\n  DialogTitle,\n} from '@/components/ui/dialog';",
    `import {\n${formParts.map((p) => `  ${p},`).join('\n')}\n} from '@/components/ui/form';`,
    "import { Separator } from '@/components/ui/separator';",
  ];

  if (kinds.has('text') || kinds.has('number'))
    lines.push("import { Input } from '@/components/ui/input';");
  if (kinds.has('date'))
    lines.push(
      "import { DatePickerInput } from '@/components/ui/inputs/date-picker-input';",
    );
  if (kinds.has('textarea'))
    lines.push("import { Textarea } from '@/components/ui/textarea';");
  if (kinds.has('select'))
    lines.push(
      "import {\n  Select,\n  SelectContent,\n  SelectItem,\n  SelectTrigger,\n  SelectValue,\n} from '@/components/ui/select';",
    );
  if (kinds.has('combobox')) {
    const needsComboboxType = propFields.some(
      (field) => field.kind === 'combobox',
    );
    lines.push("import { Combobox } from '@/components/ui/combobox';");
    if (needsComboboxType) {
      lines.push(
        "import type { ComboboxOption } from '@/components/ui/combobox';",
      );
    }
  }
  if (kinds.has('multiselect')) {
    lines.push("import { MultiSelect } from '@/components/ui/multi-select';");
    lines.push(
      "import type { MultiSelectOption } from '@/components/ui/multi-select';",
    );
  }
  if (kinds.has('switch'))
    lines.push("import { Switch } from '@/components/ui/switch';");

  lines.push(
    `import {\n  ${spec.schemaName},\n  type ${spec.valuesType},\n} from ${str(spec.schemaImport)};`,
  );
  return lines.join('\n');
}

function emitPropOptionRows(fields: OptionFieldSpec[]): string {
  return fields
    .map((field) => {
      const optionType = FORM_KIND_REGISTRY[field.kind].optionType;
      return `  ${field.name}Options: ${optionType}[];`;
    })
    .join('\n');
}

function emitPropOptionParams(fields: OptionFieldSpec[]): string {
  return fields.map((field) => `  ${field.name}Options,`).join('\n');
}

function emitForwardedPropOptions(fields: OptionFieldSpec[]): string {
  return fields
    .map((field) => `${field.name}Options={${field.name}Options}`)
    .join(' ');
}

export function buildFormModule(input: FormSpec): string {
  const spec = formSpecSchema.parse(input);
  const dialogComponent = spec.componentName ?? `${spec.entity}FormDialog`;
  const formComponent = deriveInlineComponentName(spec, dialogComponent);
  const defaultValuesName = `${lowerFirst(spec.entity)}DefaultValues`;
  const hookName = `use${spec.entity}Form`;
  const mapperName = `map${spec.entity}ToFormValues`;
  const sourceTypeName = `${spec.entity}FormSource`;
  const propFields = propOptionFields(spec.fields);

  const fields = spec.fields.map(emitField).join('\n\n');
  const options = emitOptionConsts(spec.fields);
  const description = spec.description
    ? `\n            <DialogDescription>${spec.description}</DialogDescription>`
    : '';
  const propOptionRows = emitPropOptionRows(propFields);
  const propOptionParams = emitPropOptionParams(propFields);
  const forwardedPropOptions = emitForwardedPropOptions(propFields);
  const formPropsExtra = propOptionRows ? `\n${propOptionRows}` : '';
  const dialogPropsExtra = propOptionRows ? `\n${propOptionRows}` : '';
  const formParamsExtra = propOptionParams ? `\n${propOptionParams}` : '';
  const dialogParamsExtra = propOptionParams ? `\n${propOptionParams}` : '';
  const forwardPropsAttr = forwardedPropOptions
    ? ` ${forwardedPropOptions}`
    : '';

  const body = `// TODO(scaffold): replace with the real entity type used for edit-mode mapping.
type ${sourceTypeName} = unknown;

export function ${hookName}(
  options?: Omit<UseFormProps<${spec.valuesType}>, 'resolver'>,
) {
  return useForm<${spec.valuesType}>({
    resolver: zodResolver(${spec.schemaName}),
    defaultValues: ${defaultValuesName},
    ...options,
  });
}

export function ${mapperName}(entity: ${sourceTypeName}): ${spec.valuesType} {
  // TODO(scaffold): map entity → form values for edit mode.
  void entity;
  return ${defaultValuesName};
}

interface ${formComponent}Props {
  form: UseFormReturn<${spec.valuesType}>;
  onSubmit: (values: ${spec.valuesType}) => void;
  id?: string;${formPropsExtra}
}

export function ${formComponent}({
  form,
  onSubmit,
  id = '${lowerFirst(spec.entity)}-form',${formParamsExtra}
}: ${formComponent}Props) {
  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
${fields
  .split('\n')
  .map((line) => (line.length > 0 ? `          ${line}` : line))
  .join('\n')}
        </div>
      </form>
    </Form>
  );
}

interface ${dialogComponent}Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<${spec.valuesType}>;
  onSubmit: (values: ${spec.valuesType}) => void;
  title?: string;${dialogPropsExtra}
}

export function ${dialogComponent}({
  open,
  onOpenChange,
  form,
  onSubmit,
  title,${dialogParamsExtra}
}: ${dialogComponent}Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
          <DialogTitle>{title ?? ${str(spec.title)}}</DialogTitle>${description}
        </DialogHeader>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <${formComponent}
            form={form}
            onSubmit={onSubmit}
            id="${lowerFirst(spec.entity)}-form"${forwardPropsAttr}
          />
        </div>

        <Separator />

        <DialogFooter className="shrink-0 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button type="submit" variant="primary" form="${lowerFirst(spec.entity)}-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}`;

  const preamble = options ? `${options}\n\n` : '';
  return `${banner(spec.specPath)}\n${emitImports(spec)}\n\n${preamble}${emitDefaultValues(spec)}\n\n${body}\n`;
}
