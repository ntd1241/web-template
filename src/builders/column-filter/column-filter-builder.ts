import {
  columnFilterSpecSchema,
  type ColumnFilterField,
  type ColumnFilterSpec,
  type ResolvedColumnFilterSpec,
} from './column-filter-spec';

function quote(value: string): string {
  return "'" + value.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function pascalCase(value: string): string {
  return value
    .replace(/(^|[^a-zA-Z0-9]+)([a-zA-Z0-9])/g, (_, __, char: string) =>
      char.toUpperCase(),
    )
    .replace(/[^a-zA-Z0-9]/g, '');
}

function banner(specPath?: string): string {
  const marker = specPath ? ` from \`${specPath}\`` : '';
  return `/**
 * Scaffolded by column-filter-builder${marker}. Run \`npm run gen:column-filter\` — do NOT hand-write this file.
 * You own this file now — wire the generated filters into the table and keep domain mapping outside the builder.
 */`;
}

function componentName(spec: ResolvedColumnFilterSpec, field: ColumnFilterField) {
  return `${spec.componentName}${pascalCase(field.name)}ColumnFilter`;
}

function optionsType(field: Extract<ColumnFilterField, { type: 'selectSearch' | 'multiSelect' }>) {
  return field.type === 'selectSearch'
    ? 'SearchSelectOption'
    : 'MultiSelectOption';
}

function optionsName(spec: ResolvedColumnFilterSpec, field: ColumnFilterField) {
  return `${spec.componentName}${pascalCase(field.name)}Options`;
}

function emitStaticOptions(
  spec: ResolvedColumnFilterSpec,
  field: Extract<ColumnFilterField, { type: 'selectSearch' | 'multiSelect' }>,
) {
  if (field.optionsSource !== 'static') return '';

  return [
    `const ${optionsName(spec, field)}: ${optionsType(field)}[] = [`,
    ...(field.options ?? []).map(
      (option) =>
        `  { value: ${quote(option.value)}, label: ${quote(option.label)} },`,
    ),
    '];',
  ].join('\n');
}

function emitProps(field: ColumnFilterField): string[] {
  const lines = [`export interface ${pascalCase(field.name)}ColumnFilterProps {`];

  if (field.type === 'search') {
    lines.push('  value: string;', '  onChange: (value: string) => void;');
  } else if (field.type === 'selectSearch') {
    lines.push(
      '  value: string;',
      '  onChange: (value: string) => void;',
      `  options${field.optionsSource === 'prop' ? '' : '?'}: ${optionsType(field)}[];`,
      '  loading?: boolean;',
      "  triggerContent?: SelectSearchProps['triggerContent'];",
      "  renderOption?: SelectSearchProps['renderOption'];",
    );
  } else if (field.type === 'multiSelect') {
    lines.push(
      '  value: string[];',
      '  onChange: (value: string[]) => void;',
      `  options${field.optionsSource === 'prop' ? '' : '?'}: ${optionsType(field)}[];`,
    );
  } else if (field.type === 'numberRange') {
    lines.push(
      '  value: NumberRangeValue;',
      '  onChange: (value: NumberRangeValue) => void;',
    );
  } else {
    lines.push(
      '  value: DateRangeValue;',
      '  onChange: (value: DateRangeValue) => void;',
    );
  }

  lines.push('  disabled?: boolean;', '  className?: string;', '}');
  return lines;
}

function emitComponent(
  spec: ResolvedColumnFilterSpec,
  field: ColumnFilterField,
): string[] {
  const fnName = componentName(spec, field);
  const propsName = `${pascalCase(field.name)}ColumnFilterProps`;
  const fieldClassName = field.className ?? '';
  const classNameExpression = fieldClassName
    ? `cn(${quote(fieldClassName)}, className)`
    : 'className';
  const lines = [
    `export function ${fnName}({`,
    '  value,',
    '  onChange,',
  ];

  if (field.type === 'selectSearch') {
    lines.push(
      `  options${field.optionsSource === 'static' ? ` = ${optionsName(spec, field)}` : ''},`,
      '  loading = false,',
      '  triggerContent,',
      '  renderOption,',
    );
  } else if (field.type === 'multiSelect') {
    lines.push(
      `  options${field.optionsSource === 'static' ? ` = ${optionsName(spec, field)}` : ''},`,
    );
  }

  lines.push('  disabled = false,', '  className,', `}: ${propsName}) {`, '  return (');

  if (field.type === 'search') {
    lines.push(
      '    <SearchInput',
      '      value={value}',
      '      onSearch={onChange}',
      `      debounceMs={${field.debounceMs ?? 300}}`,
      `      placeholder={${field.placeholder ? quote(field.placeholder) : "''"}}`,
      `      aria-label={${field.ariaLabel ? quote(field.ariaLabel) : 'undefined'}}`,
      '      variant="sm"',
      `      className={${classNameExpression}}`,
      '      disabled={disabled}',
      '    />',
    );
  } else if (field.type === 'selectSearch') {
    const resolvedOptions =
      field.optionsSource === 'static' ? optionsName(spec, field) : 'options';
    lines.push(
      '    <SelectSearch',
      '      value={value}',
      '      onChange={onChange}',
      `      options={${resolvedOptions}}`,
      `      placeholder={${field.placeholder ? quote(field.placeholder) : "''"}}`,
      `      searchPlaceholder={${field.searchPlaceholder ? quote(field.searchPlaceholder) : "'Tìm...'"}}`,
      ...(field.loadingMessage
        ? [`      loadingMessage={${quote(field.loadingMessage)}}`]
        : []),
      ...(field.emptyMessage
        ? [`      emptyMessage={${quote(field.emptyMessage)}}`]
        : []),
      `      ariaLabel={${field.ariaLabel ? quote(field.ariaLabel) : 'undefined'}}`,
      '      loading={loading}',
      '      disabled={disabled}',
      '      triggerContent={triggerContent}',
      '      renderOption={renderOption}',
      `      className={${classNameExpression}}`,
      '    />',
    );
  } else if (field.type === 'multiSelect') {
    const resolvedOptions =
      field.optionsSource === 'static' ? optionsName(spec, field) : 'options';
    lines.push(
      '    <MultiSelect',
      '      value={value}',
      '      onChange={onChange}',
      `      options={${resolvedOptions}}`,
      `      placeholder={${field.placeholder ? quote(field.placeholder) : "''"}}`,
      `      searchPlaceholder={${field.searchPlaceholder ? quote(field.searchPlaceholder) : "'Tìm...'"}}`,
      `      maxChips={${field.maxChips ?? 2}}`,
      '      disabled={disabled}',
      `      className={${classNameExpression}}`,
      '    />',
    );
  } else if (field.type === 'numberRange') {
    lines.push(
      `    <div className={${classNameExpression}}>`,
      '      <NumberRangeFilter',
      '        value={value}',
      '        onChange={onChange}',
      `        label={${quote(field.label)}}`,
      `        placeholder={${field.placeholder ? quote(field.placeholder) : "'Mọi giá trị'"}}`,
      '        disabled={disabled}',
      '      />',
      '    </div>',
    );
  } else {
    lines.push(
      `    <div className={${classNameExpression}}>`,
      '      <DateRangeFilter',
      '        value={value}',
      '        onChange={onChange}',
      `        label={${quote(field.label)}}`,
      `        placeholder={${field.placeholder ? quote(field.placeholder) : "'Mọi ngày'"}}`,
      '        disabled={disabled}',
      '      />',
      '    </div>',
    );
  }

  lines.push('  );', '}', '');
  return lines;
}

function emitImports(spec: ResolvedColumnFilterSpec): string[] {
  const imports = new Set(spec.fields.map((field) => field.type));
  const lines = ["import { cn } from '@/lib/utils';"];

  if (imports.has('search')) {
    lines.push("import { SearchInput } from '@/components/ui/inputs/search-input';");
  }
  if (imports.has('selectSearch')) {
    lines.push(
      "import { SelectSearch, type SearchSelectOption, type SelectSearchProps } from '@/components/ui/select-search';",
    );
  }
  if (imports.has('multiSelect')) {
    lines.push(
      "import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';",
    );
  }
  if (imports.has('numberRange')) {
    lines.push(
      "import { NumberRangeFilter, type NumberRangeValue } from '@/components/ui/filters/range-filter';",
    );
  }
  if (imports.has('dateRange')) {
    lines.push(
      "import { DateRangeFilter, type DateRangeValue } from '@/components/ui/filters/range-filter';",
    );
  }

  return lines;
}

export function buildColumnFilterModule(input: ColumnFilterSpec): string {
  const spec = columnFilterSpecSchema.parse(input);
  const staticOptions = spec.fields
    .filter(
      (field): field is Extract<ColumnFilterField, { type: 'selectSearch' | 'multiSelect' }> =>
        field.type === 'selectSearch' || field.type === 'multiSelect',
    )
    .map((field) => emitStaticOptions(spec, field))
    .filter(Boolean);

  return [
    banner(spec.specPath),
    ...emitImports(spec),
    '',
    ...staticOptions.flatMap((block) => [block, '']),
    ...spec.fields.flatMap((field) => [
      ...emitProps(field),
      '',
    ]),
    ...spec.fields.flatMap((field) => emitComponent(spec, field)),
  ]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

export { banner, componentName, emitStaticOptions };
