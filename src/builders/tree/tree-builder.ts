import {
  treeSpecSchema,
  type TreeActionSpec,
  type TreeSpec,
} from './tree-spec';

const DEFAULT_ICONS: Record<TreeActionSpec['kind'], string> = {
  add: 'Plus',
  edit: 'Pencil',
  delete: 'Trash2',
  custom: 'Sparkles',
};

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

function banner(specPath?: string): string {
  const source = specPath ? ` from \`${specPath}\`` : '';
  return `/**
 * Scaffolded by tree-builder${source}. Run \`npm run gen:tree\` — do NOT hand-write this file.
 * You own this file now — wire the callback props to screen logic or override the presentation.
 * To change the node shape or action list, edit the spec and re-gen to a scratch path first.
 */`;
}

function callbackName(action: TreeActionSpec): string {
  return action.callback ?? `on${pascalCase(action.key)}`;
}

function iconName(action: TreeActionSpec): string {
  return action.icon ?? DEFAULT_ICONS[action.kind];
}

function scopeOf(action: TreeActionSpec): 'node' | 'all' | 'both' {
  return action.scope ?? (action.kind === 'add' ? 'both' : 'node');
}

function isOptional(action: TreeActionSpec): boolean {
  return action.optional ?? action.kind !== 'add';
}

function actionLabel(action: TreeActionSpec, target: 'node' | 'all'): string {
  if (target === 'all') return action.allLabel ?? action.label;
  return action.nodeLabel ?? action.label;
}

function actionClass(action: TreeActionSpec): string {
  if (action.kind === 'delete') return 'text-destructive';
  if (action.kind === 'edit') return 'text-primary';
  return 'text-muted-foreground';
}

function actionProps(spec: TreeSpec, componentName: string): string {
  const lines = [
    `export interface ${componentName}Props {`,
    `  nodes: ${spec.entity}[];`,
    '  selectedId: string | null;',
    '  countByNode: Map<string, number>;',
    '  onSelect: (id: string) => void;',
  ];

  for (const action of spec.actions) {
    const optional = isOptional(action) ? '?' : '';
    const callback = callbackName(action);
    const signature =
      action.kind === 'add'
        ? '(parentId: string | null) => void'
        : `(node: ${spec.entity}) => void`;
    lines.push(`  ${callback}${optional}: ${signature};`);
  }

  lines.push('}');
  return lines.join('\n');
}

function emitImports(spec: TreeSpec): string {
  const icons = [
    'ChevronRight',
    'Folder',
    ...spec.actions.map((action) => iconName(action)),
  ].filter((icon, index, all) => all.indexOf(icon) === index);
  const lines = [
    "import { useState } from 'react';",
    `import { ${icons.join(', ')} } from 'lucide-react';`,
    "import { cn } from '@/lib/utils';",
    "import { Badge } from '@/components/ui/badge';",
  ];
  if (spec.actions.length > 0) {
    lines.push("import { Button } from '@/components/ui/button';");
  }
  lines.push("import { ScrollArea } from '@/components/ui/scroll-area';");
  if (spec.actions.length > 0) {
    lines.push(
      "import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';",
    );
  }
  lines.push(`import type { ${spec.entity} } from ${quote(spec.modelImport)};`);
  return lines.join('\n');
}

function emitActionButton(
  action: TreeActionSpec,
  target: 'node' | 'all',
  indent: number,
  idField: string,
  callbackPrefix = '',
): string {
  const pad = ' '.repeat(indent);
  const innerPad = ' '.repeat(indent + 2);
  const callback = `${callbackPrefix}${callbackName(action)}`;
  const label = actionLabel(action, target);
  const onClick =
    action.kind === 'add'
      ? `${callback}(${target === 'all' ? 'null' : `node.${idField}`})`
      : `${callback}(node)`;
  const button = [
    `${innerPad}<Button`,
    `${innerPad}  type="button"`,
    `${innerPad}  variant="ghost"`,
    `${innerPad}  size="icon"`,
    `${innerPad}  aria-label={${quote(label)}}`,
    `${innerPad}  className="size-6 ${actionClass(action)}"`,
    `${innerPad}  onClick={() => ${onClick}}`,
    `${innerPad}>`,
    `${innerPad}  <${iconName(action)} className="size-3.5 !opacity-100" />`,
    `${innerPad}</Button>`,
  ].join('\n');
  const tooltip = [
    `${pad}<Tooltip>`,
    `${innerPad}<TooltipTrigger asChild>`,
    button,
    `${innerPad}</TooltipTrigger>`,
    `${innerPad}<TooltipContent variant="light">{${quote(label)}}</TooltipContent>`,
    `${pad}</Tooltip>`,
  ].join('\n');

  if (!isOptional(action)) return tooltip;
  return [`${pad}{${callback} && (`, tooltip, `${pad})}`].join('\n');
}

function emitActionContainer(
  actions: TreeActionSpec[],
  target: 'node' | 'all',
  indent: number,
  idField: string,
  callbackPrefix = '',
): string {
  if (actions.length === 0) return '';
  const pad = ' '.repeat(indent);
  const buttons = actions
    .map((action) =>
      emitActionButton(action, target, indent + 2, idField, callbackPrefix),
    )
    .join('\n');
  return [
    `${pad}<div className="absolute end-3 top-1/2 flex -translate-y-1/2 items-center gap-0.5 opacity-0 group-hover:opacity-100">`,
    buttons,
    `${pad}</div>`,
  ].join('\n');
}

function emitPanel(
  spec: TreeSpec,
  panelName: string,
  componentName: string,
): string {
  if (!spec.includeAllRow) {
    return `export function ${panelName}({ className, ...treeProps }: ${componentName}Props & { className?: string }) {
  return (
    <ScrollArea className={cn('min-h-0 flex-1 px-2 pt-2 pb-3', className)}>
      <${componentName} {...treeProps} />
    </ScrollArea>
  );
}`;
  }

  const panelProps = `${panelName}Props`;
  const allActions = spec.actions.filter((action) => {
    const scope = scopeOf(action);
    return scope === 'all' || scope === 'both';
  });
  const allButtons = emitActionContainer(
    allActions,
    'all',
    10,
    spec.idField,
    'treeProps.',
  );
  const allActionBlock = allButtons ? `\n${allButtons}` : '';

  return `export interface ${panelProps} extends ${componentName}Props {
  className?: string;
  allCount?: number;
  isAllSelected?: boolean;
  onSelectAll?: () => void;
}

export function ${panelName}({
  className,
  allCount,
  isAllSelected = false,
  onSelectAll,
  ...treeProps
}: ${panelProps}) {
  return (
    <ScrollArea className={cn('min-h-0 flex-1 px-2 pt-2 pb-3', className)}>
      {onSelectAll && allCount !== undefined && (
        <div className="group relative mb-1 flex w-full items-center rounded-admin-control hover:bg-admin-surface-alt">
          <button
            type="button"
            aria-pressed={isAllSelected}
            className={cn(
              'flex w-full items-center rounded-admin-control px-3 py-1.5 text-start text-sm',
              isAllSelected ? 'font-medium text-primary' : 'text-foreground',
            )}
            onClick={onSelectAll}
          >
            <span>{${quote(spec.allLabel)}}</span>
          </button>
          <Badge
            size="sm"
            shape="circle"
            variant={isAllSelected ? 'primary' : 'secondary'}
            appearance={isAllSelected ? 'default' : 'light'}
            className="absolute end-3 top-1/2 -translate-y-1/2 group-hover:hidden"
          >
            {allCount}
          </Badge>${allActionBlock}
        </div>
      )}
      <${componentName} {...treeProps} />
    </ScrollArea>
  );
}`;
}

function emitTree(spec: TreeSpec, componentName: string): string {
  const nodeActions = spec.actions.filter((action) => {
    const scope = scopeOf(action);
    return scope === 'node' || scope === 'both';
  });
  const callbackNames = spec.actions.map((action) => callbackName(action));
  const destructured = [
    'nodes',
    'selectedId',
    'countByNode',
    'onSelect',
    ...callbackNames,
  ];
  const itemDestructured = [
    'node',
    'selectedId',
    'countByNode',
    'onSelect',
    ...callbackNames,
  ];
  const forwarded = callbackNames.map((name) => `          ${name}={${name}}`);
  const itemForwarded = callbackNames.map(
    (name) => `          ${name}={${name}}`,
  );
  const nodeActionBlock = emitActionContainer(
    nodeActions,
    'node',
    10,
    spec.idField,
  );
  const nodeActionsBlock = nodeActionBlock ? `\n${nodeActionBlock}` : '';

  return `export function ${componentName}({
${destructured.map((name) => `  ${name},`).join('\n')}
}: ${componentName}Props) {
  return (
    <ul className="flex flex-col gap-0.5">
      {nodes.map((node) => (
        <${componentName}Item
          key={node.${spec.idField}}
          node={node}
          selectedId={selectedId}
          countByNode={countByNode}
          onSelect={onSelect}
${forwarded.join('\n')}
        />
      ))}
    </ul>
  );
}

type ${componentName}ItemProps = Omit<${componentName}Props, 'nodes'> & {
  node: ${spec.entity};
};

function ${componentName}Item({
${itemDestructured.map((name) => `  ${name},`).join('\n')}
}: ${componentName}ItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.${spec.childrenField}.length > 0;
  const isSelected = node.${spec.idField} === selectedId;
  const nodeCount = countByNode.get(node.${spec.idField}) ?? 0;

  return (
    <li>
      <div
        className={cn(
          'group relative flex items-center gap-1 rounded-admin-control py-1.5 pr-3 text-sm hover:bg-admin-surface-alt',
          isSelected && 'bg-admin-surface-alt',
        )}
        style={{ paddingLeft: \`\${node.${spec.depthField} * 16 + 4}px\` }}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
            className="flex size-5 shrink-0 items-center justify-center text-muted-foreground"
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            <ChevronRight
              className={cn(
                'size-4 transition-transform',
                isExpanded && 'rotate-90',
              )}
            />
          </button>
        ) : (
          <span className="size-5 shrink-0" />
        )}

        <button
          type="button"
          aria-pressed={isSelected}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2 text-start',
            isSelected && 'font-medium text-primary',
          )}
          onClick={() => onSelect(node.${spec.idField})}
        >
          <Folder
            className={cn(
              'size-4 shrink-0 text-admin-blue-dark',
              isSelected && 'text-primary',
            )}
          />
          <span className="truncate">{node.${spec.labelField}}</span>
        </button>

        <Badge
          size="sm"
          shape="circle"
          variant={isSelected ? 'primary' : 'secondary'}
          appearance={isSelected ? 'default' : 'light'}
          className="ms-auto shrink-0 group-hover:hidden"
        >
          {nodeCount}
        </Badge>${nodeActionsBlock}
      </div>

      {hasChildren && isExpanded && (
        <${componentName}
          nodes={node.${spec.childrenField}}
          selectedId={selectedId}
          countByNode={countByNode}
          onSelect={onSelect}
${itemForwarded.join('\n')}
        />
      )}
    </li>
  );
}`;
}

export function buildTreeModule(input: TreeSpec): string {
  const spec = treeSpecSchema.parse(input);
  const panelName = spec.panelComponentName ?? `${spec.componentName}Panel`;
  const body = [
    banner(spec.specPath),
    emitImports(spec),
    '',
    actionProps(spec, spec.componentName),
    '',
    emitPanel(spec, panelName, spec.componentName),
    '',
    emitTree(spec, spec.componentName),
    '',
  ].join('\n');
  return body;
}

export { actionProps };
