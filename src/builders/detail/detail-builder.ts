import {
  detailSpecSchema,
  type DetailSpec,
  type DetailTabSpec,
  type ResolvedDetailSpec,
} from './detail-spec';

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function banner(specPath?: string): string {
  const source = specPath ? ` from \`${specPath}\`` : '';
  return `/**
 * Scaffolded by detail-builder${source}. Run \`npm run gen:detail\` — do NOT hand-write this file.
 * You own this file now — wire profile, information, actions, and tab content to screen logic.
 * To change the tab structure, edit the spec and re-gen to a scratch path first.
 */`;
}

function contentProp(tab: DetailTabSpec): string {
  return tab.contentProp ?? `${tab.value}Content`;
}

function badgeProp(tab: DetailTabSpec): string | undefined {
  return tab.badgeProp;
}

function emitIconImports(spec: ResolvedDetailSpec): string {
  const icons = spec.tabs
    .map((tab) => tab.icon)
    .filter((icon): icon is string => Boolean(icon))
    .filter((icon, index, all) => all.indexOf(icon) === index)
    .sort();

  return icons.length > 0
    ? `import { ${icons.join(', ')} } from 'lucide-react';`
    : '';
}

function emitProps(spec: ResolvedDetailSpec): string {
  return [
    `export interface ${spec.componentName}Props {`,
    '  profile: ReactNode;',
    '  information: ReactNode;',
    ...spec.tabs.map((tab) => `  ${contentProp(tab)}: ReactNode;`),
    ...spec.tabs
      .filter((tab) => badgeProp(tab))
      .map((tab) => `  ${badgeProp(tab)}?: ReactNode;`),
    '  className?: string;',
    '}',
  ].join('\n');
}

function emitTabDefinitions(spec: ResolvedDetailSpec): string {
  const entries = spec.tabs
    .map((tab) => {
      const icon = tab.icon ? `, icon: ${tab.icon}` : '';
      const badge = tab.badgeProp ? `, badge: ${tab.badgeProp}` : '';
      return `    { value: ${quote(tab.value)}, label: ${quote(tab.label)}${icon}, content: ${contentProp(tab)}${badge} },`;
    })
    .join('\n');

  return `  const tabs: EntityDetailTab[] = [
${entries}
  ];`;
}

function emitComponent(spec: ResolvedDetailSpec): string {
  const destructured = [
    'profile',
    'information',
    ...spec.tabs.map((tab) => contentProp(tab)),
    ...spec.tabs
      .filter((tab) => badgeProp(tab))
      .map((tab) => badgeProp(tab) as string),
    'className',
  ];
  const defaultValue = spec.defaultTab ?? spec.tabs[0].value;

  return `export function ${spec.componentName}({
${destructured.map((name) => `  ${name},`).join('\n')}
}: ${spec.componentName}Props) {
${emitTabDefinitions(spec)}

  return (
    <EntityDetailLayout
      profile={profile}
      information={information}
      tabs={<EntityDetailTabs tabs={tabs} defaultValue=${quote(defaultValue)} />}
      className={className}
    />
  );
}`;
}

export function buildDetailModule(input: DetailSpec): string {
  const spec = detailSpecSchema.parse(input);
  const body = [
    banner(spec.specPath),
    "import type { ReactNode } from 'react';",
    emitIconImports(spec),
    "import {\n  EntityDetailLayout,\n  EntityDetailTabs,\n  type EntityDetailTab,\n} from '@/components/layouts/entity-detail-layout';",
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
