import {
  EDITOR_TABLE_FIELD_CONTROL,
  FIELD_ALIGNMENT_CLASS,
} from '../shared/field-control-registry';
import {
  editorTableSpecSchema,
  type EditorTableColumnSpec,
  type EditorTableSpec,
  type NormalizedEditorTableSpec,
} from './editor-table-spec';

function banner(specPath?: string): string {
  const source = specPath ? ` from \`${specPath}\`` : '';
  return `/**
 * Scaffolded by editor-table-builder${source}. Run \`npm run gen:editor-table\` — do NOT hand-write this file.
 * You own this file now — fill computed cell stubs and wire it into the page/card layout. To change
 * columns or viewport behavior, edit the spec and re-gen to a scratch path, then reconcile your edits.
 */`;
}

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function pascalCase(value: string): string {
  return value
    .replace(/(^|[^a-zA-Z0-9]+)([a-zA-Z0-9])/g, (_, __, char: string) =>
      char.toUpperCase(),
    )
    .replace(/[^a-zA-Z0-9]/g, '');
}

function indent(block: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return block
    .split('\n')
    .map((line) => (line.length > 0 ? pad + line : line))
    .join('\n');
}

function widthClass(column: { widthClass?: string }, fallback: string): string {
  return column.widthClass ?? fallback;
}

function scrollAreaClass(spec: NormalizedEditorTableSpec): string {
  const custom = spec.viewport.className;
  if (custom) return custom;

  if (spec.viewport.mode === 'remaining') {
    return spec.toolbar
      ? 'min-h-[360px] min-h-0 flex-1'
      : 'h-full min-h-[360px] min-h-0';
  }
  if (spec.viewport.mode === 'natural') return '';

  const height = spec.viewport.height ?? 'lg';
  const fixedHeights: Record<typeof height, string> = {
    sm: 'h-[clamp(320px,42dvh,480px)]',
    md: 'h-[clamp(400px,52dvh,600px)]',
    lg: 'h-[clamp(480px,62dvh,760px)]',
  };
  return fixedHeights[height];
}

function fieldError(column: Extract<EditorTableColumnSpec, { name: string }>) {
  return `errors?.${column.name}`;
}

function fieldName(
  spec: NormalizedEditorTableSpec,
  columnName: string,
): string {
  return `${spec.arrayName}.\${index}.${columnName}`;
}

function ariaLabel(
  column: Extract<EditorTableColumnSpec, { name: string; header: string }>,
): string {
  return column.ariaLabel ?? column.header;
}

function numberAttrs(
  column: Extract<EditorTableColumnSpec, { kind: 'number' }>,
): string {
  const attrs: string[] = [];
  if (column.min !== undefined) attrs.push(`min={${column.min}}`);
  if (column.max !== undefined) attrs.push(`max={${column.max}}`);
  if (column.step !== undefined) attrs.push(`step={${column.step}}`);
  return attrs.length
    ? `\n${attrs.map((attr) => `        ${attr}`).join('\n')}`
    : '';
}

function inputVariant(
  column: Extract<EditorTableColumnSpec, { kind: 'text' | 'number' | 'date' }>,
) {
  return EDITOR_TABLE_FIELD_CONTROL[column.kind].inputVariant;
}

function bulkEditableColumns(spec: NormalizedEditorTableSpec) {
  return spec.columns.filter(
    (
      column,
    ): column is Extract<
      EditorTableColumnSpec,
      { kind: 'text' | 'number' | 'date' }
    > => {
      return (
        (column.kind === 'text' ||
          column.kind === 'number' ||
          column.kind === 'date') &&
        column.bulkEdit === true
      );
    },
  );
}

function bulkFieldUnion(columns: ReturnType<typeof bulkEditableColumns>) {
  return columns.map((column) => quote(column.name)).join(' | ');
}

function emitBulkFieldOptions(columns: ReturnType<typeof bulkEditableColumns>) {
  return columns
    .map(
      (column) =>
        `  { name: ${quote(column.name)}, label: ${quote(column.header)}, kind: ${quote(column.kind)} },`,
    )
    .join('\n');
}

function editableCell(
  spec: NormalizedEditorTableSpec,
  column: Extract<EditorTableColumnSpec, { kind: 'text' | 'number' | 'date' }>,
): string {
  if (column.kind === 'number') {
    return `<TableCell className="px-2 py-2">
  <Controller
    control={form.control}
    name={\`${fieldName(spec, column.name)}\`}
    render={({ field: inputField }) => (
      <Input
        aria-label={\`${ariaLabel(column)} dòng \${index + 1}\`}
        aria-invalid={!!${fieldError(column)}}
        className="${FIELD_ALIGNMENT_CLASS.right}"${numberAttrs(column)}
        type="number"
        value={inputField.value}
        variant="${inputVariant(column)}"
        onBlur={inputField.onBlur}
        onChange={(event) =>
          inputField.onChange(
            Number.isNaN(event.target.valueAsNumber)
              ? 0
              : event.target.valueAsNumber,
          )
        }
      />
    )}
  />
  {${fieldError(column)} && (
    <div className="mt-1 text-right text-xs text-destructive">
      {${fieldError(column)}?.message}
    </div>
  )}
</TableCell>`;
  }

  if (column.kind === 'date') {
    return `<TableCell className="px-2 py-2">
  <Controller
    control={form.control}
    name={\`${fieldName(spec, column.name)}\`}
    render={({ field: inputField }) => (
      <DatePickerInput
        aria-label={\`${ariaLabel(column)} dòng \${index + 1}\`}
        aria-invalid={!!${fieldError(column)}}
        calendarLabel={\`Chọn ${ariaLabel(column).toLowerCase()} dòng \${index + 1}\`}
        value={inputField.value}
        valueMode="iso-date"
        variant="${inputVariant(column)}"
        onBlur={inputField.onBlur}
        onChange={inputField.onChange}
      />
    )}
  />
  {${fieldError(column)} && (
    <div className="mt-1 text-xs text-destructive">
      {${fieldError(column)}?.message}
    </div>
  )}
</TableCell>`;
  }

  const type = column.inputType ?? 'text';
  const typeAttr = type === 'text' ? '' : `\n        type="${type}"`;

  return `<TableCell className="px-2 py-2">
  <Controller
    control={form.control}
    name={\`${fieldName(spec, column.name)}\`}
    render={({ field: inputField }) => (
      <Input
        {...inputField}
        aria-label={\`${ariaLabel(column)} dòng \${index + 1}\`}
        aria-invalid={!!${fieldError(column)}}${typeAttr}
        variant="${inputVariant(column)}"
      />
    )}
  />
  {${fieldError(column)} && (
    <div className="mt-1 text-xs text-destructive">
      {${fieldError(column)}?.message}
    </div>
  )}
</TableCell>`;
}

function computedCell(
  column: Extract<EditorTableColumnSpec, { kind: 'computedCurrency' }>,
) {
  const varName = column.id;
  return `<TableCell className="px-4 py-2 text-right tabular-nums">
  {/* TODO(scaffold): calculate ${varName} from row. */}
  {formatCurrencyVND(${varName})}
</TableCell>`;
}

function emitHeaderBulkInput(
  column: Extract<EditorTableColumnSpec, { kind: 'text' | 'number' | 'date' }>,
) {
  if (column.kind === 'date') {
    return `<DatePickerInput
    aria-label={\`Áp dụng ${ariaLabel(column).toLowerCase()} cho dòng đã chọn\`}
    calendarLabel={\`Chọn ${ariaLabel(column).toLowerCase()} cho dòng đã chọn\`}
    disabled={selectedIndexes.length === 0}
    value={headerBulkValues.${column.name}}
    valueMode="iso-date"
    variant="sm"
    onChange={(value) => handleHeaderBulkChange(${quote(column.name)}, value)}
  />`;
  }

  const type =
    column.kind === 'number' ? 'number' : (column.inputType ?? 'text');
  const typeAttr = type === 'text' ? '' : `\n    type="${type}"`;
  const className =
    column.kind === 'number'
      ? `\n    className="${FIELD_ALIGNMENT_CLASS.right}"`
      : '';
  return `<Input
    aria-label={\`Áp dụng ${ariaLabel(column).toLowerCase()} cho dòng đã chọn\`}
    disabled={selectedIndexes.length === 0}${className}${typeAttr}
    value={headerBulkValues.${column.name}}
    variant="sm"
    onChange={(event) =>
      handleHeaderBulkChange(${quote(column.name)}, event.target.value)
    }
  />`;
}

function emitHeaderCell(
  spec: NormalizedEditorTableSpec,
  column: EditorTableColumnSpec,
  isAction = false,
): string {
  if (isAction) {
    return `<TableHead className="sticky top-0 right-0 z-30 bg-muted ${widthClass(column, 'w-28')} text-right shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.45)]">${column.header}</TableHead>`;
  }
  const alignRight =
    column.kind === 'number' || column.kind === 'computedCurrency'
      ? ' text-right'
      : '';
  const hasHeaderBulkInput =
    spec.multiEdit.enabled &&
    spec.multiEdit.headerInputs &&
    (column.kind === 'text' ||
      column.kind === 'number' ||
      column.kind === 'date') &&
    column.bulkEdit === true;
  const headerContent = hasHeaderBulkInput
    ? `<div className="flex flex-col gap-1.5">
  <span>${column.header}</span>
  ${emitHeaderBulkInput(column)}
</div>`
    : column.header;
  return `<TableHead className="sticky top-0 z-20 bg-muted ${widthClass(column, 'w-36')}${alignRight}">${headerContent}</TableHead>`;
}

function emitHeaders(spec: NormalizedEditorTableSpec): string {
  const cells = spec.columns.map((column) => emitHeaderCell(spec, column));
  if (spec.multiEdit.enabled) {
    cells.unshift(`<TableHead className="sticky top-0 z-20 bg-muted w-12">
  <Checkbox
    aria-label="Chọn tất cả dòng"
    checked={
      fields.length > 0 &&
      (selectedRowIds.length === fields.length ||
        (selectedRowIds.length > 0 && 'indeterminate'))
    }
    disabled={fields.length === 0}
    size="sm"
    onCheckedChange={(checked) => handleSelectAllRows(!!checked)}
  />
</TableHead>`);
  }
  if (spec.actions.enabled) {
    cells.push(
      emitHeaderCell(
        spec,
        {
          kind: 'index',
          header: spec.actions.header ?? '',
          widthClass: spec.actions.widthClass,
        },
        true,
      ),
    );
  }
  return cells.join('\n');
}

function emitRowPrelude(spec: NormalizedEditorTableSpec): string {
  const computed = spec.columns.filter(
    (
      column,
    ): column is Extract<EditorTableColumnSpec, { kind: 'computedCurrency' }> =>
      column.kind === 'computedCurrency',
  );
  if (computed.length === 0) return '';

  return computed
    .map(
      (column) =>
        `void row;\nconst ${column.id} = 0;\n// TODO(scaffold): replace ${column.id} with the real computed value for this row.`,
    )
    .join('\n');
}

function emitBulkEditSetup(spec: NormalizedEditorTableSpec) {
  const columns = bulkEditableColumns(spec);
  if (!hasMultiEdit(spec)) return '';

  const defaultField = columns[0].name;
  const headerDefaults = columns
    .map((column) => `    ${column.name}: '',`)
    .join('\n');
  const cases = columns
    .map((column) => {
      const value =
        column.kind === 'number'
          ? `Number.isNaN(Number(rawValue)) ? 0 : Number(rawValue)`
          : 'rawValue';
      return `    case ${quote(column.name)}:
      return ${value};`;
    })
    .join('\n');

  return `
  type BulkFieldName = ${bulkFieldUnion(columns)};
  const bulkFields = [
${emitBulkFieldOptions(columns)}
  ] as const;
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [bulkField, setBulkField] = useState<BulkFieldName>(${quote(defaultField)});
  const [bulkValue, setBulkValue] = useState('');
  const [headerBulkValues, setHeaderBulkValues] = useState<Record<BulkFieldName, string>>({
${headerDefaults}
  });
  const selectedIndexes = useMemo(
    () =>
      fields
        .map((field, index) =>
          selectedRowIds.includes(field.fieldId) ? index : null,
        )
        .filter((index): index is number => index !== null),
    [fields, selectedRowIds],
  );
  const activeBulkField = bulkFields.find((field) => field.name === bulkField);

  const coerceBulkValue = (fieldName: BulkFieldName, rawValue: string) => {
    switch (fieldName) {
${cases}
    }
  };

  const applyBulkValue = (fieldName: BulkFieldName, rawValue: string) => {
    const value = coerceBulkValue(fieldName, rawValue);
    selectedIndexes.forEach((index) => {
      form.setValue(
        \`${spec.arrayName}.\${index}.\${fieldName}\` as never,
        value as never,
        { shouldDirty: true, shouldValidate: true },
      );
    });
  };

  const handleSelectAllRows = (checked: boolean) => {
    setSelectedRowIds(checked ? fields.map((field) => field.fieldId) : []);
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    setSelectedRowIds((current) =>
      checked ? [...current, rowId] : current.filter((id) => id !== rowId),
    );
  };

  const handleBulkApply = () => {
    if (selectedIndexes.length === 0) return;
    applyBulkValue(bulkField, bulkValue);
  };

  const handleHeaderBulkChange = (fieldName: BulkFieldName, value: string) => {
    setHeaderBulkValues((current) => ({ ...current, [fieldName]: value }));
    if (selectedIndexes.length === 0) return;
    applyBulkValue(fieldName, value);
  };
`;
}

function emitBulkActionBar() {
  return `      {selectedIndexes.length > 0 && (
        <div
          role="toolbar"
          aria-label="Thao tác hàng loạt"
          className="fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2 shadow-lg"
        >
          <span className="px-1 text-sm font-medium text-foreground">
            Đã chọn {selectedIndexes.length} dòng
          </span>
          <div className="h-5 w-px bg-border" />
          <Select
            value={bulkField}
            onValueChange={(value) => {
              setBulkField(value as BulkFieldName);
              setBulkValue('');
            }}
          >
            <SelectTrigger size="sm" className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bulkFields.map((field) => (
                <SelectItem key={field.name} value={field.name}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeBulkField?.kind === 'date' ? (
            <DatePickerInput
              aria-label="Giá trị áp dụng hàng loạt"
              calendarLabel="Chọn giá trị áp dụng hàng loạt"
              value={bulkValue}
              valueMode="iso-date"
              variant="sm"
              onChange={setBulkValue}
            />
          ) : (
            <Input
              aria-label="Giá trị áp dụng hàng loạt"
              className={activeBulkField?.kind === 'number' ? 'w-36 text-right tabular-nums' : 'w-48'}
              type={activeBulkField?.kind === 'number' ? 'number' : 'text'}
              value={bulkValue}
              variant="sm"
              onChange={(event) => setBulkValue(event.target.value)}
            />
          )}
          <Button type="button" variant="primary" size="sm" onClick={handleBulkApply}>
            Áp dụng
          </Button>
          <div className="h-5 w-px bg-border" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRowIds([])}
          >
            Bỏ chọn
          </Button>
        </div>
      )}`;
}

function emitCells(spec: NormalizedEditorTableSpec): string {
  const cells = spec.columns.map((column) => {
    if (column.kind === 'index') {
      return `<TableCell className="px-4 py-2 text-muted-foreground">
  {index + 1}
</TableCell>`;
    }
    if (column.kind === 'computedCurrency') return computedCell(column);
    return editableCell(spec, column);
  });

  if (spec.multiEdit.enabled) {
    cells.unshift(`<TableCell className="px-4 py-2">
  <Checkbox
    aria-label={\`Chọn dòng \${index + 1}\`}
    checked={selectedRowIds.includes(field.fieldId)}
    size="sm"
    onCheckedChange={(checked) => handleSelectRow(field.fieldId, !!checked)}
  />
</TableCell>`);
  }

  if (spec.actions.enabled) {
    cells.push(`<TableCell className="sticky right-0 z-10 bg-card px-3 py-2 shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.35)]">
  <div className="flex justify-end gap-1">
    <Button
      aria-label={\`Nhân đôi dòng \${index + 1}\`}
      title="Nhân đôi"
      type="button"
      variant="ghost"
      mode="icon"
      size="sm"
      onClick={() => handleDuplicateRow(index)}
    >
      <Copy />
    </Button>
    <Button
      aria-label={\`Thêm dòng dưới dòng \${index + 1}\`}
      title="Thêm dòng dưới"
      type="button"
      variant="ghost"
      mode="icon"
      size="sm"
      onClick={() => handleAddRowBelow(index)}
    >
      <Plus />
    </Button>
    <Button
      aria-label={\`Xóa dòng \${index + 1}\`}
      title="Xóa"
      type="button"
      variant="destructive"
      appearance="ghost"
      mode="icon"
      size="sm"
      onClick={() => remove(index)}
    >
      <Trash2 />
    </Button>
  </div>
</TableCell>`);
  }

  return cells.join('\n');
}

function hasEditableColumn(spec: NormalizedEditorTableSpec): boolean {
  return spec.columns.some(
    (column) =>
      column.kind === 'text' ||
      column.kind === 'number' ||
      column.kind === 'date',
  );
}

function hasComputedColumn(spec: NormalizedEditorTableSpec): boolean {
  return spec.columns.some((column) => column.kind === 'computedCurrency');
}

function hasInputColumn(spec: NormalizedEditorTableSpec): boolean {
  return spec.columns.some(
    (column) => column.kind === 'text' || column.kind === 'number',
  );
}

function hasDateColumn(spec: NormalizedEditorTableSpec): boolean {
  return spec.columns.some((column) => column.kind === 'date');
}

function hasMultiEdit(spec: NormalizedEditorTableSpec): boolean {
  return spec.multiEdit.enabled && bulkEditableColumns(spec).length > 0;
}

/**
 * Import only what the emitted cells actually use — `noUnusedLocals` makes any
 * unused import a build error, so the icons, RHF `Controller`, `Input` and
 * `formatCurrencyVND` are gated on the column kinds / actions present.
 */
function emitImports(spec: NormalizedEditorTableSpec): string {
  const editable = hasEditableColumn(spec);
  const computed = hasComputedColumn(spec);
  const input = hasInputColumn(spec);
  const date = hasDateColumn(spec);
  const multiEdit = hasMultiEdit(spec);
  const icons = spec.actions.enabled ? 'Copy, Plus, Trash2' : 'Plus';
  const rhfValues = editable ? 'Controller, useFieldArray' : 'useFieldArray';

  const lines = [
    ...(multiEdit ? ["import { useMemo, useState } from 'react';"] : []),
    `import { ${icons} } from 'lucide-react';`,
    `import { ${rhfValues} } from 'react-hook-form';`,
    "import type { UseFormReturn } from 'react-hook-form';",
    "import { Button } from '@/components/ui/button';",
  ];
  if (multiEdit)
    lines.push("import { Checkbox } from '@/components/ui/checkbox';");
  if (input || multiEdit)
    lines.push("import { Input } from '@/components/ui/input';");
  if (date || multiEdit)
    lines.push(
      "import { DatePickerInput } from '@/components/ui/inputs/date-picker-input';",
    );
  if (multiEdit)
    lines.push(
      "import {\n  Select,\n  SelectContent,\n  SelectItem,\n  SelectTrigger,\n  SelectValue,\n} from '@/components/ui/select';",
    );
  lines.push(
    "import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';",
  );
  lines.push(
    "import {\n  TableBody,\n  TableCell,\n  TableHead,\n  TableHeader,\n  TableRow,\n} from '@/components/ui/table';",
  );
  if (computed) lines.push("import { formatCurrencyVND } from '@/lib/format';");
  lines.push(`import type { ${spec.entity} } from ${quote(spec.modelImport)};`);
  lines.push(
    `import type { ${spec.valuesType} } from ${quote(spec.valuesImport)};`,
  );
  return lines.join('\n');
}

export function buildEditorTableModule(input: EditorTableSpec): string {
  const spec = editorTableSpecSchema.parse(input);
  const componentName =
    spec.componentName ?? `${pascalCase(spec.entity)}EditorTable`;
  const createRowProp = spec.createRowProp ?? 'createRow';
  const multiEdit = hasMultiEdit(spec);
  const columnCount =
    spec.columns.length + (spec.actions.enabled ? 1 : 0) + (multiEdit ? 1 : 0);
  const rowPrelude = emitRowPrelude(spec);
  const bulkEditSetup = emitBulkEditSetup(spec);
  const scrollClass = scrollAreaClass(spec);
  const scrollAreaOpen = scrollClass
    ? `<ScrollArea className="${scrollClass}">`
    : '<ScrollArea>';

  // Gate row-action plumbing on `actions.enabled` and the per-row `errors`
  // binding on having an editable column — `noUnusedLocals` rejects either if
  // emitted but unused.
  const fieldArrayBindings = spec.actions.enabled
    ? 'fields, append, insert, remove'
    : 'fields, append';
  const actionHandlers = spec.actions.enabled
    ? `
  const handleAddRowBelow = (index: number) => {
    insert(index + 1, ${createRowProp}());
  };

  const handleDuplicateRow = (index: number) => {
    const currentRow = form.getValues(\`${spec.arrayName}.\${index}\`);
    insert(index + 1, { ...currentRow, id: crypto.randomUUID() });
  };
`
    : '';
  const errorsLine = hasEditableColumn(spec)
    ? `\n              const errors = form.formState.errors.${spec.arrayName}?.[index];`
    : '';

  // Optional self-contained toolbar (title + row count + add button) driven by
  // the component's own `fields` / `handleAddRow`, so a consumer never needs a
  // second `useFieldArray` to add rows.
  const toolbar = spec.toolbar;
  const toolbarOpen = toolbar
    ? `    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground">${toolbar.title}</h2>
          <div className="text-xs text-muted-foreground">{fields.length} dòng</div>
        </div>
        <Button type="button" variant="primary" onClick={handleAddRow}>
          <Plus />
          ${toolbar.addLabel}
        </Button>
      </div>
`
    : '';
  const toolbarClose = toolbar ? `    </div>\n` : '';
  const bulkActionBar =
    multiEdit && spec.multiEdit.actionBar ? `\n${emitBulkActionBar()}` : '';
  const returnOpen = bulkActionBar
    ? `    <>\n${toolbarOpen}      ${scrollAreaOpen}`
    : `${toolbarOpen}    ${scrollAreaOpen}`;
  const returnClose = bulkActionBar
    ? `${toolbarClose}${bulkActionBar}
    </>`
    : toolbarClose;

  const body = `interface ${componentName}Props {
  form: UseFormReturn<${spec.valuesType}>;
  ${createRowProp}: () => ${spec.entity};
}

export function ${componentName}({
  form,
  ${createRowProp},
}: ${componentName}Props) {
  const { ${fieldArrayBindings} } = useFieldArray({
    control: form.control,
    name: '${spec.arrayName}',
    keyName: 'fieldId',
  });
  const watchedRows = form.watch('${spec.arrayName}') ?? [];

  const handleAddRow = () => {
    append(${createRowProp}());
  };
${actionHandlers}${bulkEditSetup}
  return (
${returnOpen}
      <table className="${spec.tableMinWidthClass} w-full caption-bottom text-foreground text-sm">
        <TableHeader>
          <TableRow>
${indent(emitHeaders(spec), 12)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.length === 0 ? (
            <TableRow>
              <TableCell colSpan={${columnCount}} className="h-28 text-center">
                <div className="flex flex-col items-center gap-3">
                  <span className="text-muted-foreground">Chưa có dữ liệu</span>
                  <Button type="button" variant="outline" onClick={handleAddRow}>
                    <Plus />
                    Thêm dòng
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            fields.map((field, index) => {
              const row = watchedRows[index] as ${spec.entity} | undefined;${errorsLine}
${rowPrelude ? indent(rowPrelude, 14) : '              void row;'}

              return (
                <TableRow key={field.fieldId}>
${indent(emitCells(spec), 18)}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
${returnClose}
  );
}`;

  return `${banner(spec.specPath)}\n${emitImports(spec)}\n\n${body}\n`;
}
