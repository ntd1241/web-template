import {
  detailDialogSpecSchema,
  type DetailDialogSpec,
  type DetailDialogTabSpec,
  type ResolvedDetailDialogSpec,
} from './detail-dialog-spec';

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function banner(specPath?: string): string {
  const source = specPath ? ` from \`${specPath}\`` : '';
  return `/**
 * Scaffolded by detail-dialog-builder${source}. Run \`npm run gen:detail-dialog\` — do NOT hand-write this file.
 * You own this file now — wire local data and tab content to screen logic.
 * To change the tab structure, edit the spec and re-gen to a scratch path first.
 */`;
}

function contentProp(tab: DetailDialogTabSpec): string {
  return tab.contentProp ?? `${tab.value}Content`;
}

function fieldProp(tab: DetailDialogTabSpec): string {
  return tab.fieldProp ?? `${tab.value}Fields`;
}

function slotProp(tab: DetailDialogTabSpec): string {
  return tab.contentMode === 'table' ? fieldProp(tab) : contentProp(tab);
}

function emitIconImports(spec: ResolvedDetailDialogSpec): string {
  const icons = spec.tabs
    .map((tab) => tab.icon)
    .filter((icon): icon is string => Boolean(icon))
    .filter((icon, index, all) => all.indexOf(icon) === index)
    .sort();

  return icons.length > 0
    ? `import { ${icons.join(', ')} } from 'lucide-react';`
    : '';
}

function emitProps(spec: ResolvedDetailDialogSpec): string {
  return [
    `export interface ${spec.componentName}Props<TData> {`,
    '  open: boolean;',
    '  onOpenChange: (open: boolean) => void;',
    '  title: ReactNode;',
    '  data: TData | null;',
    '  isLoading?: boolean;',
    '  searchPlaceholder?: string;',
    ...spec.tabs.map((tab) =>
      tab.contentMode === 'table'
        ? `  ${fieldProp(tab)}: (context: EntityDetailDialogTabContext<TData>) => EntityDetailDialogField[];`
        : `  ${contentProp(tab)}: (context: EntityDetailDialogTabContext<TData>) => ReactNode;`,
    ),
    ...spec.tabs
      .filter((tab) => tab.searchTextProp)
      .map((tab) => `  ${tab.searchTextProp}?: (data: TData) => string;`),
    ...spec.tabs
      .filter((tab) => tab.searchMatchCountProp)
      .map(
        (tab) =>
          `  ${tab.searchMatchCountProp}?: (context: EntityDetailDialogTabContext<TData>) => number;`,
      ),
    '  className?: string;',
    '}',
  ].join('\n');
}

function emitTabDefinitions(spec: ResolvedDetailDialogSpec): string {
  const entries = spec.tabs
    .map((tab) => {
      const icon = tab.icon ? `, icon: ${tab.icon}` : '';
      const searchText = tab.searchTextProp
        ? `, searchText: ${tab.searchTextProp}`
        : '';
      const searchMatchCount = tab.searchMatchCountProp
        ? `, getMatchCount: ${tab.searchMatchCountProp}`
        : tab.contentMode === 'table'
          ? `, getMatchCount: (context) => countMatchingEntityDetailDialogFields(${fieldProp(tab)}(context), context.matches)`
          : '';
      const content =
        tab.contentMode === 'table'
          ? `content: (context) => (\n        <EntityDetailDialogTable\n          fields={${fieldProp(tab)}(context)}\n          matches={context.matches}\n        />\n      )`
          : `content: ${contentProp(tab)}`;
      return `    { value: ${quote(tab.value)}, label: ${quote(tab.label)}${icon}${searchText}${searchMatchCount}, ${content} },`;
    })
    .join('\n');

  return [
    '  const tabs: EntityDetailDialogTab<TData>[] = [',
    entries,
    '  ];',
  ].join('\n');
}

function emitComponent(spec: ResolvedDetailDialogSpec): string {
  const destructured = [
    'open',
    'onOpenChange',
    'title',
    'data',
    'isLoading',
    'searchPlaceholder',
    ...spec.tabs.map((tab) => slotProp(tab)),
    ...spec.tabs
      .filter((tab) => tab.searchTextProp)
      .map((tab) => tab.searchTextProp as string),
    ...spec.tabs
      .filter((tab) => tab.searchMatchCountProp)
      .map((tab) => tab.searchMatchCountProp as string),
    'className',
  ];
  const defaultTab = spec.defaultTab ?? spec.tabs[0].value;

  return [
    `export function ${spec.componentName}<TData>({`,
    ...destructured.map((name) => `  ${name},`),
    `}: ${spec.componentName}Props<TData>) {`,
    emitTabDefinitions(spec),
    '',
    '  return (',
    '    <EntityDetailDialog<TData>',
    '      open={open}',
    '      onOpenChange={onOpenChange}',
    '      title={title}',
    '      data={data}',
    '      isLoading={isLoading}',
    '      tabs={tabs}',
    `      defaultTab=${quote(defaultTab)}`,
    '      searchPlaceholder={searchPlaceholder}',
    '      className={className}',
    '    />',
    '  );',
    '}',
  ].join('\n');
}

export function buildDetailDialogModule(input: DetailDialogSpec): string {
  const spec = detailDialogSpecSchema.parse(input);
  const hasAutoTableMatchCount = spec.tabs.some(
    (tab) => tab.contentMode === 'table' && !tab.searchMatchCountProp,
  );
  const body = [
    banner(spec.specPath),
    "import type { ReactNode } from 'react';",
    emitIconImports(spec),
    `import {\n  EntityDetailDialog,\n  EntityDetailDialogTable,${hasAutoTableMatchCount ? '\n  countMatchingEntityDetailDialogFields,' : ''}\n  type EntityDetailDialogField,\n  type EntityDetailDialogTab,\n  type EntityDetailDialogTabContext,\n} from '@/components/layouts/entity-detail-dialog';`,
    '',
    emitProps(spec),
    '',
    emitComponent(spec),
    '',
  ]
    .filter(Boolean)
    .join('\n');

  return `${body}\n`;
}
