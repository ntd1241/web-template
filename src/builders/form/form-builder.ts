import { BUILDER_INPUT_VARIANTS } from '../shared/field-control-registry';
import { buildFormFieldControl } from '../shared/form-field-builder';
import { FORM_KIND_REGISTRY, FORM_WIDTH_SPAN } from './field-kinds';
import { formSpecSchema, type FormFieldSpec, type FormSpec } from './form-spec';

/**
 * Pure form-builder generator. `buildFormModule(spec)` validates the spec and
 * returns the source of a `*-form.generated.tsx`: a reusable `<Entity>Form`,
 * parent-owned `use<Entity>Form()` hook, mapper stub, and
 * `<Entity>FormDialog` wrapper. Generated dialogs require an explicit create/edit
 * mode and protect edit forms from accidental close. Fields sit on a responsive
 * 12-col grid (width presets normal/large/full; stacks on mobile).
 *
 * Scaffold-and-own: after generation you own the file. Wire submit + edit reset
 * behavior in the parent. To change fields/layout, edit the spec and re-gen.
 */

function banner(specPath?: string): string {
  const source = specPath ? ` from \`${specPath}\`` : '';
  return `/**
 * Scaffolded by form-builder${source}. Run \`npm run gen:form\` — do NOT hand-write this file.
 * You own this file now — keep create and edit dialog state separate in the parent. Create forms
 * keep their draft when closed; edit forms reset after the selected entity is assigned on the next
 * open. Never clear the selected entity or reset the form while an edit dialog is closing. To change
 * fields, widths or layout, edit the spec and re-gen to a scratch path, then reconcile your edits.
 * Do not hand-edit this banner or the generated options consts — that's how review detects a
 * bypassed builder.
 */`;
}

function str(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function span(field: FormFieldSpec): string {
  return FORM_WIDTH_SPAN[field.width ?? 'full'];
}

const LOCAL_OPTION_KINDS = new Set([
  'select',
  'combobox',
  'searchSelect',
  'multiselect',
]);

type OptionFieldSpec = Extract<
  FormFieldSpec,
  { kind: 'select' | 'combobox' | 'searchSelect' | 'multiselect' }
>;

function isOptionField(field: FormFieldSpec): field is OptionFieldSpec {
  return LOCAL_OPTION_KINDS.has(field.kind);
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

type ApiSearchSelectFieldSpec = Extract<
  FormFieldSpec,
  { kind: 'apiSearchSelect' }
>;

function apiSearchSelectFields(
  fields: FormFieldSpec[],
): ApiSearchSelectFieldSpec[] {
  return fields.filter(
    (field): field is ApiSearchSelectFieldSpec =>
      field.kind === 'apiSearchSelect',
  );
}

type ImageFieldSpec = Extract<FormFieldSpec, { kind: 'image' }>;

function imageFields(fields: FormFieldSpec[]): ImageFieldSpec[] {
  return fields.filter(
    (field): field is ImageFieldSpec => field.kind === 'image',
  );
}

function imageFilePropName(fieldName: string): string {
  return `on${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}FileChange`;
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

/** Hoisted `const <name>Options = [...]` for local option fields. */
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
  const apiSearchSelect = field.kind === 'apiSearchSelect' ? field : undefined;

  return buildFormFieldControl({
    kind: field.kind,
    surface: 'form',
    variant: BUILDER_INPUT_VARIANTS.form,
    placeholder: field.placeholder,
    inputType: field.kind === 'text' ? field.inputType : undefined,
    format:
      field.kind === 'number' || field.kind === 'date'
        ? field.format
        : undefined,
    rows: field.kind === 'textarea' ? field.rows : undefined,
    optionsExpression: isOptionField(field)
      ? `${field.name}Options`
      : undefined,
    searchPlaceholder:
      field.kind === 'combobox' ||
      field.kind === 'searchSelect' ||
      field.kind === 'apiSearchSelect' ||
      field.kind === 'multiselect'
        ? field.searchPlaceholder
        : undefined,
    emptyMessage:
      field.kind === 'searchSelect' ||
      field.kind === 'apiSearchSelect' ||
      field.kind === 'multiselect'
        ? field.emptyMessage
        : undefined,
    loadOptionsExpression: apiSearchSelect
      ? `load${field.name.charAt(0).toUpperCase()}${field.name.slice(1)}Options`
      : undefined,
    selectedOptionExpression: apiSearchSelect
      ? `${field.name}SelectedOption`
      : undefined,
    minSearchLength: apiSearchSelect?.minSearchLength,
    debounceMs: apiSearchSelect?.debounceMs,
    calendarLabel:
      field.kind === 'date' ? `Chọn ${field.label.toLowerCase()}` : undefined,
    accept: field.kind === 'image' ? field.accept : undefined,
    maxSizeMb: field.kind === 'image' ? field.maxSizeMb : undefined,
    onFileChangeExpression:
      field.kind === 'image' ? imageFilePropName(field.name) : undefined,
    label: field.kind === 'image' ? field.label : undefined,
    fallbackText: field.kind === 'image' ? field.fallbackText : undefined,
  });
}

function emitField(field: FormFieldSpec): string {
  const item =
    field.kind === 'switch'
      ? `<FormItem className="${span(field)} flex-row items-center gap-2.5">
  ${controlJsx(field)}
  <FormLabel className="font-normal text-foreground">${field.label}</FormLabel>
</FormItem>`
      : field.kind === 'image'
        ? `<FormItem className="${span(field)}">
  ${controlJsx(field)}
  <FormMessage />
</FormItem>`
        : `<FormItem className="${span(field)}">
  <FormLabel>${labelJsx(field)}</FormLabel>
  ${controlJsx(field)}
  <FormMessage />
</FormItem>`;

  const formField = `<FormField
  control={form.control}
  name="${field.name}"
  render={({ field }) => (
    ${item}
  )}
/>`;

  if (!field.modes || field.modes.length === 2) return formField;

  return `{mode === ${str(field.modes[0])} && (
  ${formField}
)}`;
}

function emitImports(spec: FormSpec): string {
  const kinds = new Set(spec.fields.map((f) => f.kind));
  const hasFormattedNumber = spec.fields.some(
    (field) =>
      field.kind === 'number' && field.format && field.format !== 'plain',
  );
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

  const dialogParts = ['Dialog', 'DialogContent'];
  if (spec.description) dialogParts.push('DialogDescription');
  dialogParts.push('DialogFooter', 'DialogHeader', 'DialogTitle');

  const lines = [
    "import { useState, type KeyboardEvent } from 'react';",
    "import { zodResolver } from '@hookform/resolvers/zod';",
    "import { useForm } from 'react-hook-form';",
    "import type { UseFormProps, UseFormReturn } from 'react-hook-form';",
    "import { Button } from '@/components/ui/button';",
    "import { ConfirmDialog } from '@/components/ui/confirm-dialog';",
    "import { ShortcutTooltip } from '@/components/ui/shortcut-tooltip';",
    `import {\n${dialogParts.map((part) => `  ${part},`).join('\n')}\n} from '@/components/ui/dialog';`,
    `import {\n${formParts.map((p) => `  ${p},`).join('\n')}\n} from '@/components/ui/form';`,
    "import { Separator } from '@/components/ui/separator';",
  ];

  if (kinds.has('text') || (kinds.has('number') && !hasFormattedNumber))
    lines.push("import { Input } from '@/components/ui/input';");
  if (kinds.has('image'))
    lines.push(
      "import { ImageUploadField } from '@/components/ui/image-upload-field';",
    );
  if (hasFormattedNumber)
    lines.push(
      "import { NumericInput } from '@/components/ui/inputs/numeric-input';",
    );
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
  const hasLocalSearchSelect =
    kinds.has('combobox') || kinds.has('searchSelect');
  const hasApiSearchSelect = kinds.has('apiSearchSelect');
  if (hasLocalSearchSelect || hasApiSearchSelect) {
    const searchSelectImports = [
      hasLocalSearchSelect ? 'SelectSearch' : '',
      hasApiSearchSelect ? 'ApiSelectSearch' : '',
    ].filter(Boolean);
    lines.push(
      `import { ${searchSelectImports.join(', ')} } from '@/components/ui/select-search';`,
    );

    const searchSelectTypeImports = [
      propFields.some(
        (field) => field.kind === 'combobox' || field.kind === 'searchSelect',
      )
        ? 'SearchSelectOption'
        : '',
      hasApiSearchSelect ? 'ApiSelectSearchLoadOptions' : '',
      hasApiSearchSelect &&
      !propFields.some(
        (field) => field.kind === 'combobox' || field.kind === 'searchSelect',
      )
        ? 'SearchSelectOption'
        : '',
    ].filter(Boolean);
    if (searchSelectTypeImports.length > 0) {
      lines.push(
        `import type { ${searchSelectTypeImports.join(', ')} } from '@/components/ui/select-search';`,
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

function cap(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function emitApiSearchSelectPropRows(
  fields: ApiSearchSelectFieldSpec[],
): string {
  return fields
    .map(
      (field) =>
        `  load${cap(field.name)}Options: ApiSelectSearchLoadOptions;\n  ${field.name}SelectedOption?: SearchSelectOption;`,
    )
    .join('\n');
}

function emitApiSearchSelectPropParams(
  fields: ApiSearchSelectFieldSpec[],
): string {
  return fields
    .flatMap((field) => [
      `  load${cap(field.name)}Options,`,
      `  ${field.name}SelectedOption,`,
    ])
    .join('\n');
}

function emitForwardedApiSearchSelectProps(
  fields: ApiSearchSelectFieldSpec[],
): string {
  return fields
    .flatMap((field) => [
      `load${cap(field.name)}Options={load${cap(field.name)}Options}`,
      `${field.name}SelectedOption={${field.name}SelectedOption}`,
    ])
    .join(' ');
}

function emitPropOptionParams(fields: OptionFieldSpec[]): string {
  return fields.map((field) => `  ${field.name}Options,`).join('\n');
}

function emitForwardedPropOptions(fields: OptionFieldSpec[]): string {
  return fields
    .map((field) => `${field.name}Options={${field.name}Options}`)
    .join(' ');
}

function emitImagePropRows(fields: ImageFieldSpec[]): string {
  return fields
    .map(
      (field) =>
        `  ${imageFilePropName(field.name)}?: (file: File | null) => void;`,
    )
    .join('\n');
}

function emitImagePropParams(fields: ImageFieldSpec[]): string {
  return fields
    .map((field) => `  ${imageFilePropName(field.name)},`)
    .join('\n');
}

function emitForwardedImageProps(fields: ImageFieldSpec[]): string {
  return fields
    .map(
      (field) =>
        `${imageFilePropName(field.name)}={${imageFilePropName(field.name)}}`,
    )
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
  const apiFields = apiSearchSelectFields(spec.fields);
  const imageFieldSpecs = imageFields(spec.fields);
  const hasFieldModes = spec.fields.some(
    (field) => field.modes && field.modes.length < 2,
  );

  const fields = spec.fields.map(emitField).join('\n\n');
  const options = emitOptionConsts(spec.fields);
  const description = spec.description
    ? `\n            <DialogDescription>${spec.description}</DialogDescription>`
    : '';
  const propOptionRows = emitPropOptionRows(propFields);
  const apiSearchSelectPropRows = emitApiSearchSelectPropRows(apiFields);
  const propOptionParams = emitPropOptionParams(propFields);
  const apiSearchSelectPropParams = emitApiSearchSelectPropParams(apiFields);
  const forwardedPropOptions = emitForwardedPropOptions(propFields);
  const forwardedApiSearchSelectProps =
    emitForwardedApiSearchSelectProps(apiFields);
  const imagePropRows = emitImagePropRows(imageFieldSpecs);
  const imagePropParams = emitImagePropParams(imageFieldSpecs);
  const forwardedImageProps = emitForwardedImageProps(imageFieldSpecs);
  const propRows = [propOptionRows, apiSearchSelectPropRows, imagePropRows]
    .filter(Boolean)
    .join('\n');
  const propParams = [
    propOptionParams,
    apiSearchSelectPropParams,
    imagePropParams,
  ]
    .filter(Boolean)
    .join('\n');
  const forwardedProps = [
    forwardedPropOptions,
    forwardedApiSearchSelectProps,
    forwardedImageProps,
  ]
    .filter(Boolean)
    .join(' ');
  const formPropsExtra = propRows ? `\n${propRows}` : '';
  const dialogPropsExtra = propRows ? `\n${propRows}` : '';
  const formModeProp = hasFieldModes ? `\n  mode: 'create' | 'edit';` : '';
  const formModeParam = hasFieldModes ? '\n  mode,' : '';
  const formParamsExtra = `${formModeParam}${propParams ? `\n${propParams}` : ''}`;
  const dialogParamsExtra = propParams ? `\n${propParams}` : '';
  const forwardPropsAttr = forwardedProps ? ` ${forwardedProps}` : '';

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
  id?: string;${formModeProp}${formPropsExtra}
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
  mode: 'create' | 'edit';
  form: UseFormReturn<${spec.valuesType}>;
  onSubmit: (values: ${spec.valuesType}) => void;
  isSaving?: boolean;
  title?: string;${dialogPropsExtra}
}

export function ${dialogComponent}({
  open,
  onOpenChange,
  mode,
  form,
  onSubmit,
  isSaving = false,
  title,${dialogParamsExtra}
}: ${dialogComponent}Props) {
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isSaving || !(event.ctrlKey || event.metaKey)) return;

    const key = event.key.toLowerCase();
    if (key !== 's' && key !== 'enter') return;

    event.preventDefault();
    void form.handleSubmit(onSubmit)();
  };
  const requestClose = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }

    if (mode === 'edit') {
      setConfirmCloseOpen(true);
      return;
    }

    onOpenChange(false);
  };

  const confirmClose = () => {
    setConfirmCloseOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={requestClose}>
      <DialogContent
        className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0"
        onKeyDown={handleDialogKeyDown}
      >
        <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
          <DialogTitle>{title ?? ${str(spec.title)}}</DialogTitle>${description}
        </DialogHeader>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <${formComponent}
            form={form}
            onSubmit={onSubmit}
            id="${lowerFirst(spec.entity)}-form"${hasFieldModes ? ' mode={mode}' : ''}${forwardPropsAttr}
          />
        </div>

        <Separator />

        <DialogFooter className="shrink-0 px-6 py-4">
          <ShortcutTooltip label="Hủy" shortcut="Esc">
            <Button
              type="button"
              variant="outline"
              onClick={() => requestClose(false)}
              disabled={isSaving}
            >
              Hủy
            </Button>
          </ShortcutTooltip>
          <ShortcutTooltip label="Lưu" shortcut="Ctrl/Cmd + S">
            <Button
              type="submit"
              variant="primary"
              form="${lowerFirst(spec.entity)}-form"
              loading={isSaving}
              loadingText="Đang lưu..."
            >
              Lưu
            </Button>
          </ShortcutTooltip>
        </DialogFooter>
      </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmCloseOpen}
        onOpenChange={setConfirmCloseOpen}
        title="Đóng chỉnh sửa?"
        description="Bạn có thay đổi chưa lưu. Nếu đóng, các thay đổi hiện tại sẽ bị mất."
        confirmLabel="Đóng"
        confirmVariant="destructive"
        onConfirm={confirmClose}
      />
    </>
  );
}`;

  const preamble = options ? `${options}\n\n` : '';
  return `${banner(spec.specPath)}\n${emitImports(spec)}\n\n${preamble}${emitDefaultValues(spec)}\n\n${body}\n`;
}
