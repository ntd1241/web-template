import {
  savedViewSpecSchema,
  type ResolvedSavedViewSpec,
  type SavedViewField,
  type SavedViewSpec,
} from './saved-view-spec';

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function upperSnake(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
}

function banner(specPath?: string): string {
  const marker = specPath ? ` from \`${specPath}\`` : '';
  return [
    '/**',
    ` * Scaffolded by saved-view-builder${marker}. Run npm run gen:saved-view — do NOT hand-write this file.`,
    ' * This adapter owns persistence normalization for one list resource; page state and query behavior stay in the feature hook.',
    ' */',
  ].join('\n');
}

function importLine(spec: ResolvedSavedViewSpec): string {
  const { values, types, specifier } = spec.modelImport;
  const named = [...values, ...types.map((name) => `type ${name}`)];
  return `import { ${named.join(', ')} } from ${quote(specifier)};`;
}

function fieldNormalizer(
  field: SavedViewField,
  filtersType: string,
  initialFiltersName: string,
): string[] {
  const raw = `rawFilters.${field.name}`;
  if (field.kind === 'string') {
    return [
      `      ${field.name}: typeof ${raw} === 'string' ? ${raw} : ${initialFiltersName}.${field.name},`,
    ];
  }
  if (field.kind === 'stringArray') {
    return [`      ${field.name}: stringArray(${raw}),`];
  }
  if (field.kind === 'optionalNumber') {
    return [
      `      ${field.name}: typeof ${raw} === 'number' && Number.isFinite(${raw}) ? ${raw} : undefined,`,
    ];
  }
  if (field.kind === 'enumArray') {
    const allowed = field.allowedValuesConst;
    if (!allowed)
      throw new Error(`enumArray field ${field.name} needs allowedValuesConst`);
    return [
      `      ${field.name}: stringArray(${raw}).filter((item): item is ${filtersType}['${field.name}'][number] => ${allowed}.includes(item as ${filtersType}['${field.name}'][number])),`,
    ];
  }

  const allowedValues = field.allowedValues ?? [];
  const values = allowedValues.map(quote).join(', ');
  return [
    `      ${field.name}: typeof ${raw} === 'string' && [${values}].includes(${raw}) ? ${raw} as ${filtersType}['${field.name}'] : ${initialFiltersName}.${field.name},`,
  ];
}

function buildFilterBlock(spec: ResolvedSavedViewSpec): string[] {
  return [
    '    filters: {',
    `      ...${spec.initialFiltersName},`,
    ...spec.fields.flatMap((field) =>
      fieldNormalizer(field, spec.filtersType, spec.initialFiltersName),
    ),
    '    },',
  ];
}

export function buildSavedViewModule(input: SavedViewSpec): string {
  const spec = savedViewSpecSchema.parse(input);
  const entity = spec.entity;
  const configType = `${entity}SavedViewConfig`;
  const viewType = `${entity}SavedView`;
  const entityPrefix = upperSnake(entity);
  const resourceConst = `${entityPrefix}_SAVED_VIEW_RESOURCE`;
  const permissionConst = `${entityPrefix}_SAVED_VIEW_MANAGE_PERMISSION`;
  const normalizeName = `normalize${entity}SavedViewConfig`;
  const equalsName = `${entity.charAt(0).toLowerCase()}${entity.slice(1)}SavedViewConfigEquals`;

  return [
    banner(spec.specPath),
    "import type { ColumnOrderState, VisibilityState } from '@tanstack/react-table';",
    "import type { SavedViewConfig, TenantSavedView } from '@/project/saved-views/model/saved-view';",
    importLine(spec),
    '',
    `export const ${resourceConst} = ${quote(spec.resource)} as const;`,
    ...(spec.managePermission
      ? [`export const ${permissionConst} = ${quote(spec.managePermission)};`]
      : []),
    '',
    `export type ${viewType} = TenantSavedView<${spec.filtersType}>;`,
    `export type ${configType} = SavedViewConfig<${spec.filtersType}>;`,
    '',
    'function isRecord(value: unknown): value is Record<string, unknown> {',
    "  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);",
    '}',
    '',
    'function stringArray(value: unknown): string[] {',
    "  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];",
    '}',
    '',
    'function booleanRecord(value: unknown): VisibilityState {',
    '  if (!isRecord(value)) return {};',
    "  return Object.fromEntries(Object.entries(value).filter(([, item]) => typeof item === 'boolean'));",
    '}',
    '',
    `export function ${normalizeName}(value: unknown): ${configType} {`,
    '  const source = isRecord(value) ? value : {};',
    '  const rawFilters = isRecord(source.filters) ? source.filters : {};',
    '',
    '  return {',
    '    version: 1,',
    "    keyword: typeof source.keyword === 'string' ? source.keyword : '',",
    ...buildFilterBlock(spec),
    '    columnVisibility: booleanRecord(source.columnVisibility),',
    '    columnOrder: stringArray(source.columnOrder) as ColumnOrderState,',
    '  };',
    '}',
    '',
    `export function ${equalsName}(left: ${configType}, right: ${configType}): boolean {`,
    '  return JSON.stringify(left) === JSON.stringify(right);',
    '}',
    '',
  ].join('\n');
}

export { banner };
