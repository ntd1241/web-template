import {
  layoutSpecSchema,
  type LayoutSpec,
  type ResolvedLayoutSpec,
} from './layout-spec';

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function banner(specPath?: string): string {
  const source = specPath ? ` from \`${specPath}\`` : '';
  return `/**
 * Scaffolded by layout-builder${source}. Run \`npm run gen:layout\` — do NOT hand-write this file.
 * You own this file now — provide navigation/content slots and override the layout config as needed.
 * To change the defaults, edit the spec and re-gen to a scratch path first.
 */`;
}

function emitDefaults(spec: ResolvedLayoutSpec): string {
  const defaults = spec.defaults;
  return `export const ${spec.componentName}Defaults = {
  navigationSize: ${quote(defaults.navigationSize)},
  navigationMinSize: ${quote(defaults.navigationMinSize)},
  navigationMaxSize: ${quote(defaults.navigationMaxSize)},
  navigationHeight: ${quote(defaults.navigationHeight)},
  contentHeight: ${quote(defaults.contentHeight)},
  navigationResizable: ${defaults.navigationResizable},
} as const;`;
}

function emitProps(componentName: string): string {
  return `export interface ${componentName}Props {
  navigation: ReactNode;
  content: ReactNode;
  navigationSize?: LayoutAreaSize;
  navigationMinSize?: LayoutAreaSize;
  navigationMaxSize?: LayoutAreaSize;
  navigationHeight?: LayoutAreaHeight;
  contentHeight?: LayoutAreaHeight;
  navigationResizable?: boolean;
  className?: string;
}`;
}

function emitComponent(spec: ResolvedLayoutSpec): string {
  const { componentName } = spec;
  return `export function ${componentName}({
  navigation,
  content,
  navigationSize = ${componentName}Defaults.navigationSize,
  navigationMinSize = ${componentName}Defaults.navigationMinSize,
  navigationMaxSize = ${componentName}Defaults.navigationMaxSize,
  navigationHeight = ${componentName}Defaults.navigationHeight,
  contentHeight = ${componentName}Defaults.contentHeight,
  navigationResizable = ${componentName}Defaults.navigationResizable,
  className,
}: ${componentName}Props) {
  return (
    <ContentLayout
      navigation={navigation}
      content={content}
      navigationSize={navigationSize}
      navigationMinSize={navigationMinSize}
      navigationMaxSize={navigationMaxSize}
      navigationHeight={navigationHeight}
      contentHeight={contentHeight}
      navigationResizable={navigationResizable}
      className={className}
    />
  );
}`;
}

export function buildLayoutModule(input: LayoutSpec): string {
  const spec = layoutSpecSchema.parse(input);
  const body = [
    banner(spec.specPath),
    "import type { ReactNode } from 'react';",
    "import { ContentLayout } from '@/components/layouts/content-layout';",
    "import type { LayoutAreaHeight, LayoutAreaSize } from '@/builders/layout/layout-area-size-options';",
    '',
    emitDefaults(spec),
    '',
    emitProps(spec.componentName),
    '',
    emitComponent(spec),
    '',
  ].join('\n');

  return body;
}
