import {
  filterSpecSchema,
  type FilterField,
  type FilterSpec,
  type ResolvedFilterSpec,
} from './filter-spec';

function quote(value: string): string {
  return "'" + value.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function banner(specPath?: string): string {
  const marker = specPath
    ? ' from ' + String.fromCharCode(96) + specPath + String.fromCharCode(96)
    : '';
  return [
    '/**',
    ' * Scaffolded by filter-builder' +
      marker +
      '. Run npm run gen:filter — do NOT hand-write this file.',
    ' * You own this file now — keep domain state, renderers, and API mapping outside the builder.',
    ' */',
  ].join('\n');
}

function capitalize(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function fieldOptionTypeName(field: FilterField) {
  return capitalize(field.name) + 'FilterOption';
}

function staticOptionsName(
  spec: ResolvedFilterSpec,
  field: Extract<ResolvedFilterSpec['fields'][number], { type: 'select' }>,
) {
  return `${spec.componentName}${capitalize(field.name)}Options`;
}

function emitStaticOptions(
  spec: ResolvedFilterSpec,
  field: Extract<ResolvedFilterSpec['fields'][number], { type: 'select' }>,
) {
  if (field.optionsSource !== 'static') return '';
  return [
    `const ${staticOptionsName(spec, field)}: FilterToolbarOption[] = [`,
    ...(field.options ?? []).map(
      (option) =>
        `  { value: ${quote(option.value)}, label: ${quote(option.label)} },`,
    ),
    '];',
  ].join('\n');
}

function emitProps(spec: ResolvedFilterSpec): string[] {
  const lines = [`export interface ${spec.componentName}Props {`];
  for (const field of spec.fields) {
    lines.push(`  ${field.name}: string;`);
    lines.push(`  on${capitalize(field.name)}Change: (value: string) => void;`);
    if (field.type === 'select') {
      const optionType = fieldOptionTypeName(field);
      lines.push(
        `  ${field.name}Options${field.optionsSource === 'prop' ? '' : '?'}: readonly ${optionType}[];`,
      );
      lines.push(
        `  ${field.name}RenderOption?: (option: ${optionType}) => ReactNode;`,
      );
      lines.push(
        `  ${field.name}RenderValue?: (option: ${optionType} | undefined) => ReactNode;`,
      );
    }
  }
  lines.push('  disabled?: boolean;', '  className?: string;', '}');
  return lines;
}

function emitField(
  spec: ResolvedFilterSpec,
  field: ResolvedFilterSpec['fields'][number],
): string[] {
  if (field.type === 'search') {
    return [
      '      {',
      "        kind: 'search',",
      `        value: ${field.name},`,
      `        onValueChange: on${capitalize(field.name)}Change,`,
      `        placeholder: ${field.placeholder ? quote(field.placeholder) : 'undefined'},`,
      `        className: ${field.className ? quote(field.className) : 'undefined'},`,
      `        debounceMs: ${field.debounceMs ?? 300},`,
      '        disabled,',
      '      },',
    ];
  }

  return [
    '      {',
    "        kind: 'select',",
    `        value: ${field.name},`,
    `        onValueChange: on${capitalize(field.name)}Change,`,
    `        options: ${field.name}Options ?? ${field.optionsSource === 'static' ? staticOptionsName(spec, field) : '[]'},`,
    `        label: ${field.label ? quote(field.label) : 'undefined'},`,
    `        placeholder: ${field.placeholder ? quote(field.placeholder) : 'undefined'},`,
    `        ariaLabel: ${field.ariaLabel ? quote(field.ariaLabel) : 'undefined'},`,
    `        className: ${field.className ? quote(field.className) : 'undefined'},`,
    '        disabled,',
    `        renderOption: ${field.name}RenderOption,`,
    `        renderValue: ${field.name}RenderValue,`,
    '      },',
  ];
}

export function buildFilterModule(input: FilterSpec): string {
  const spec = filterSpecSchema.parse(input);
  const staticOptions = spec.fields
    .filter(
      (field): field is Extract<typeof field, { type: 'select' }> =>
        field.type === 'select',
    )
    .map((field) => emitStaticOptions(spec, field))
    .filter(Boolean);
  const optionAliases = spec.fields
    .filter(
      (field): field is Extract<typeof field, { type: 'select' }> =>
        field.type === 'select',
    )
    .map(
      (field) =>
        `export type ${fieldOptionTypeName(field)} = FilterToolbarOption;`,
    );

  return [
    banner(spec.specPath),
    "import type { ReactNode } from 'react';",
    "import { FilterToolbar, type FilterToolbarOption } from '@/components/ui/filter-toolbar';",
    '',
    ...optionAliases,
    optionAliases.length ? '' : null,
    ...staticOptions.flatMap((block) => [block, '']),
    ...emitProps(spec),
    '',
    `export function ${spec.componentName}({`,
    ...spec.fields.flatMap((field) => [
      `  ${field.name},`,
      `  on${capitalize(field.name)}Change,`,
      ...(field.type === 'select'
        ? [
            `  ${field.name}Options,`,
            `  ${field.name}RenderOption,`,
            `  ${field.name}RenderValue,`,
          ]
        : []),
    ]),
    '  disabled = false,',
    '  className,',
    `}: ${spec.componentName}Props) {`,
    '  return (',
    '    <FilterToolbar',
    '      className={className}',
    '      fields={[',
    ...spec.fields.flatMap((field) => emitField(spec, field)),
    '      ]}',
    '    />',
    '  );',
    '}',
    '',
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
}

export { banner, emitStaticOptions };
