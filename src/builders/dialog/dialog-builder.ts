import {
  dialogSpecSchema,
  type DialogActionSpec,
  type DialogSpec,
} from './dialog-spec';

const WIDTH_CLASS: Record<NonNullable<DialogSpec['width']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function banner(specPath?: string): string {
  const marker = specPath ? ` from \`${specPath}\`` : '';
  return `/**
 * Scaffolded by dialog-builder${marker}. Run \`npm run gen:dialog\` — do NOT hand-write this file.
 * You own this file now — keep dialog state and content composition in the feature.
 * To change title, description, footer actions or dialog width, edit the spec and re-gen to a scratch path first.
 */`;
}

function cap(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function handlerName(action: DialogActionSpec): string {
  return `on${cap(action.name)}`;
}

function actionPropNames(actions: DialogActionSpec[]): string[] {
  return Array.from(
    new Set(
      actions.flatMap((action) =>
        [action.loadingProp, action.disabledProp].filter(
          (value): value is string => Boolean(value),
        ),
      ),
    ),
  );
}

function emitActionProps(action: DialogActionSpec): string {
  return `  ${handlerName(action)}: () => void;`;
}

function emitAction(action: DialogActionSpec): string {
  const props = [
    `type="${action.type}"`,
    `variant="${action.variant}"`,
    `onClick={${handlerName(action)}}`,
  ];
  if (action.loadingProp) props.push(`loading={${action.loadingProp}}`);
  if (action.loadingText)
    props.push(`loadingText=${quote(action.loadingText)}`);
  if (action.disabledProp) {
    const expression =
      action.disabledWhen === 'falsy'
        ? `!${action.disabledProp}`
        : action.disabledProp;
    props.push(`disabled={${expression}}`);
  }
  if (action.className) props.push(`className=${quote(action.className)}`);

  const icon = action.icon ? `\n          <${action.icon} />` : '';
  return [
    '        <Button',
    ...props.map((prop) => `          ${prop}`),
    '        >',
    icon ? icon : `          ${action.label}`,
    icon ? `          ${action.label}` : '',
    '        </Button>',
  ]
    .filter(Boolean)
    .join('\n');
}

function emitIconImports(actions: DialogActionSpec[]): string {
  const icons = Array.from(
    new Set(
      actions
        .map((action) => action.icon)
        .filter((icon): icon is string => Boolean(icon)),
    ),
  );
  return icons.length > 0
    ? `import { ${icons.join(', ')} } from 'lucide-react';`
    : '';
}

export function buildDialogModule(input: DialogSpec): string {
  const spec = dialogSpecSchema.parse(input);
  const actionPropNamesForSpec = actionPropNames(spec.actions);
  const description = spec.description
    ? `\n          <DialogDescription>${spec.description}</DialogDescription>`
    : '';
  const iconImports = emitIconImports(spec.actions);
  const actionProps = spec.actions.map(emitActionProps).join('\n');
  const stateProps = actionPropNamesForSpec
    .map((name) => `  ${name}?: boolean;`)
    .join('\n');
  const actions = spec.actions.map(emitAction).join('\n');
  const dialogImports = [
    '  Dialog,',
    '  DialogBody,',
    '  DialogContent,',
    ...(spec.description ? ['  DialogDescription,'] : []),
    '  DialogFooter,',
    '  DialogHeader,',
    '  DialogTitle,',
  ];

  return [
    banner(spec.specPath),
    "import { type ReactNode } from 'react';",
    iconImports,
    "import { Button } from '@/components/ui/button';",
    'import {',
    ...dialogImports,
    "} from '@/components/ui/dialog';",
    '',
    `export interface ${spec.componentName}Props {`,
    '  open: boolean;',
    '  onOpenChange: (open: boolean) => void;',
    '  children: ReactNode;',
    spec.titleProp ? `  ${spec.titleProp}: string;` : '',
    actionProps,
    stateProps,
    '}',
    '',
    `export function ${spec.componentName}({`,
    '  open,',
    '  onOpenChange,',
    '  children,',
    spec.titleProp ? `  ${spec.titleProp},` : '',
    ...spec.actions.map((action) => `  ${handlerName(action)},`),
    ...actionPropNamesForSpec.map((name) => `  ${name} = false,`),
    `}: ${spec.componentName}Props) {`,
    '  return (',
    '    <Dialog open={open} onOpenChange={onOpenChange}>',
    `      <DialogContent className="flex max-h-[90dvh] ${WIDTH_CLASS[spec.width]} flex-col gap-0 overflow-hidden p-0">`,
    '        <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 pe-14 text-start">',
    `          <DialogTitle>${spec.titleProp ? `{${spec.titleProp}}` : spec.title}</DialogTitle>${description}`,
    '        </DialogHeader>',
    '',
    '        <DialogBody className="min-h-0 flex-1 overflow-y-auto px-6 py-5">',
    '          {children}',
    '        </DialogBody>',
    '',
    '        <DialogFooter className="shrink-0 px-6 py-4">',
    actions,
    '        </DialogFooter>',
    '      </DialogContent>',
    '    </Dialog>',
    '  );',
    '}',
    '',
  ]
    .filter((line) => line !== '')
    .join('\n');
}

export { banner, emitAction, WIDTH_CLASS };
