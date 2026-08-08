import {
  tooltipSpecSchema,
  type ResolvedTooltipSpec,
  type TooltipSpec,
} from './tooltip-spec';

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function banner(specPath?: string): string {
  const source = specPath ? ` from \`${specPath}\`` : '';
  return `/**
 * Scaffolded by tooltip-builder${source}. Run \`npm run gen:tooltip\` — do NOT hand-write this file.
 * You own this file now — compose the generated tooltip with a chart and wire screen-specific data.
 * To change the preset or provider behavior, edit the spec and re-gen to a scratch path first.
 */`;
}

function emitImports(spec: ResolvedTooltipSpec): string {
  const lines = [
    "import { cn } from '@/lib/utils';",
    'import { ChartTooltip, ChartTooltipContent',
  ];

  if (spec.includeProvider) {
    lines.unshift("import type { ReactNode } from 'react';");
  }

  if (spec.includeProvider) {
    lines[2] += ', ChartTooltipStyleProvider';
  }

  lines[2] += " } from '@/components/ui/chart';";

  if (spec.includeProvider) {
    lines.push(
      "import type { ChartTooltipStyle } from '@/components/ui/chart';",
    );
  }

  return lines.join('\n');
}

export function buildTooltipModule(input: TooltipSpec): string {
  const spec = tooltipSpecSchema.parse(input);
  const providerProps = spec.includeProvider
    ? `\n  style?: ChartTooltipStyle;`
    : '';
  const provider = spec.includeProvider
    ? `

export function ${spec.componentName}Provider({
  style = ${quote(spec.defaultStyle)},
  children,
}: {
  children: ReactNode;${providerProps}
}) {
  return (
    <ChartTooltipStyleProvider style={style}>
      {children}
    </ChartTooltipStyleProvider>
  );
}`
    : '';

  return [
    banner(spec.specPath),
    emitImports(spec),
    '',
    `export interface ${spec.componentName}Props {`,
    '  hideLabel?: boolean;',
    '  hideIndicator?: boolean;',
    '  className?: string;',
    '}',
    '',
    `export function ${spec.componentName}({`,
    `  hideLabel = ${spec.hideLabel},`,
    `  hideIndicator = ${spec.hideIndicator},`,
    '  className,',
    `}: ${spec.componentName}Props) {`,
    '  return (',
    `    <ChartTooltip content={<ChartTooltipContent hideLabel={hideLabel} hideIndicator={hideIndicator} className={cn(${spec.className ? quote(spec.className) : 'undefined'}, className)} />} />`,
    '  );',
    '}',
    provider,
    '',
  ].join('\n');
}

export { emitImports };
