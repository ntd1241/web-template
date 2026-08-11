import {
  accountMenuSpecSchema,
  type AccountMenuItemSpec,
  type AccountMenuSpec,
  type ResolvedAccountMenuSpec,
} from './account-menu-spec';

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function banner(specPath?: string): string {
  const source = specPath ? ` from \`${specPath}\`` : '';
  return `/**
 * Scaffolded by account-menu-builder${source}. Run \`npm run gen:account-menu\` — do NOT hand-write this file.
 * You own this file now — wire callback/state props to screen logic or override the presentation.
 * To change the menu structure, edit the spec and re-gen to a scratch path first.
 */`;
}

function iconName(item: AccountMenuItemSpec): string {
  return item.icon;
}

function allItems(spec: ResolvedAccountMenuSpec): AccountMenuItemSpec[] {
  return spec.groups.flatMap((group) => group.items);
}

function emitImports(spec: ResolvedAccountMenuSpec): string {
  const icons = allItems(spec)
    .map(iconName)
    .filter((icon, index, all) => all.indexOf(icon) === index)
    .sort();
  const items = allItems(spec);
  const hasLabel = spec.groups.some((group) => group.label);
  const hasBadge = items.some((item) => item.kind === 'item' && item.badge);
  const hasSwitch = items.some((item) => item.kind === 'switch');
  const hasSubmenu = items.some((item) => item.kind === 'submenu');
  const hasTooltip = items.some((item) => item.kind === 'item' && item.badge);
  const hasAsset = items.some(
    (item) =>
      item.kind === 'submenu' && item.options.some((option) => option.asset),
  );
  const lines = [
    `import { ${icons.join(', ')} } from 'lucide-react';`,
    "import { Badge } from '@/components/ui/badge';",
    'import {',
    '  DropdownMenuGroup,',
    '  DropdownMenuItem,',
    '  DropdownMenuLabel,',
    '  DropdownMenuRadioGroup,',
    '  DropdownMenuRadioItem,',
    '  DropdownMenuSeparator,',
    '  DropdownMenuSub,',
    '  DropdownMenuSubContent,',
    '  DropdownMenuSubTrigger,',
    "} from '@/components/ui/dropdown-menu';",
  ];
  if (hasAsset) {
    lines.push("import { toAbsoluteUrl } from '@/lib/helpers';");
  }
  if (hasSwitch) {
    lines.push("import { Switch } from '@/components/ui/switch';");
  }
  if (hasTooltip) {
    lines.push(
      "import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';",
    );
  }
  if (!hasBadge) {
    lines.splice(
      lines.indexOf("import { Badge } from '@/components/ui/badge';"),
      1,
    );
  }
  if (!hasLabel) {
    lines.splice(lines.indexOf('  DropdownMenuLabel,'), 1);
  }
  if (!hasSubmenu) {
    for (const line of [
      '  DropdownMenuRadioGroup,',
      '  DropdownMenuRadioItem,',
      '  DropdownMenuSub,',
      '  DropdownMenuSubContent,',
      '  DropdownMenuSubTrigger,',
    ]) {
      lines.splice(lines.indexOf(line), 1);
    }
  }
  return lines.join('\n');
}

function emitProps(componentName: string): string {
  return `export interface ${componentName}Props {
  onItemSelect?: (key: string) => void;
  switchValues?: Record<string, boolean>;
  onSwitchChange?: (key: string, checked: boolean) => void;
  submenuValues?: Record<string, string>;
  onSubmenuChange?: (key: string, value: string) => void;
}`;
}

function emitSubmenuOptions(
  item: Extract<AccountMenuItemSpec, { kind: 'submenu' }>,
): string {
  const variableName = `${item.key}Options`;
  const options = item.options
    .map((option) => {
      const asset = option.asset
        ? `, asset: toAbsoluteUrl(${quote(option.asset)})`
        : '';
      const assetAlt = option.assetAlt
        ? `, assetAlt: ${quote(option.assetAlt)}`
        : '';
      return `  { value: ${quote(option.value)}, label: ${quote(option.label)}${asset}${assetAlt} },`;
    })
    .join('\n');
  const defaultValue = item.defaultValue ?? item.options[0].value;
  const selectedName = `${item.key}SelectedOption`;

  return `  const ${variableName} = [
${options}
  ] as const;
  const ${selectedName} = ${variableName}.find(
    (option) =>
      option.value === (submenuValues?.[${quote(item.key)}] ?? ${quote(defaultValue)}),
  ) ?? ${variableName}[0];`;
}

function emitItem(item: AccountMenuItemSpec): string {
  const Icon = iconName(item);
  const itemKey = quote(item.key);
  const hasDescription = Boolean(item.description);
  const itemClassName = hasDescription ? 'items-start py-2' : undefined;
  const classNameProp = itemClassName
    ? ` className=${quote(itemClassName)}`
    : '';

  if (item.kind === 'switch') {
    return `        <DropdownMenuItem
          className="justify-between"
          onSelect={(event) => event.preventDefault()}
        >
          <span className="flex min-w-0 items-center gap-2">
            <${Icon} />
            <span className="truncate">${item.label}</span>
          </span>
          <Switch
            size="sm"
            checked={switchValues?.[${itemKey}] ?? ${item.defaultChecked}}
            onCheckedChange={(checked) =>
              onSwitchChange?.(${itemKey}, checked)
            }
          />
        </DropdownMenuItem>`;
  }

  if (item.kind === 'submenu') {
    const variableName = `${item.key}Options`;
    const selectedName = `${item.key}SelectedOption`;
    const value =
      item.valueMode === 'none'
        ? ''
        : item.valueMode === 'asset'
          ? `
          {${selectedName}.asset && (
            <img
              src={${selectedName}.asset}
              alt={${selectedName}.assetAlt ?? ${selectedName}.label}
              className="h-3.5 w-5 shrink-0 rounded-sm object-cover"
            />
          )}`
          : `
          <span className="shrink-0 text-xs text-muted-foreground">
            {${selectedName}.label}
          </span>`;
    const optionClassName = item.options.some((option) => option.asset)
      ? 'gap-2'
      : undefined;

    return `        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <${Icon} />
            <span className="min-w-0 flex-1 truncate">${item.label}</span>${value}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuRadioGroup
              value={submenuValues?.[${itemKey}] ?? ${variableName}[0].value}
              onValueChange={(value) => onSubmenuChange?.(${itemKey}, value)}
            >
${item.options
  .map((option) => {
    const asset = option.asset
      ? `
                <img
                  src={toAbsoluteUrl(${quote(option.asset)})}
                  alt=${quote(option.assetAlt ?? option.label)}
                  className="h-3.5 w-5 rounded-sm object-cover"
                />`
      : '';
    return `              <DropdownMenuRadioItem
                key=${quote(option.value)}
                value=${quote(option.value)}
                indicator="check"
                indicatorPosition="end"${optionClassName ? `\n                className=${quote(optionClassName)}` : ''}
              >${asset}
                ${option.label}
              </DropdownMenuRadioItem>`;
  })
  .join('\n')}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>`;
  }

  const content = hasDescription
    ? `<span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span>${item.label}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              ${item.description}
            </span>
          </span>`
    : `<span className="min-w-0 flex-1">${item.label}</span>`;
  const badge = item.badge
    ? `
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant=${quote(item.badge.variant)}
                size="xs"
                shape="circle"
                className="size-4 min-w-4 shrink-0 px-0 text-[0.625rem]"
              >
                ${item.badge.text}
              </Badge>
            </TooltipTrigger>
            <TooltipContent variant="${item.badge.variant === 'destructive' ? 'destructive' : 'light'}">
              ${item.badge.tooltip}
            </TooltipContent>
          </Tooltip>`
    : '';
  const variant = item.destructive ? ' variant="destructive"' : '';

  return `        <DropdownMenuItem${variant}${classNameProp} onSelect={() => onItemSelect?.(${itemKey})}>
          <${Icon}${hasDescription ? ' className="mt-0.5"' : ''} />
          ${content}${badge}
        </DropdownMenuItem>`;
}

function emitComponent(spec: ResolvedAccountMenuSpec): string {
  const submenuItems = allItems(spec).filter(
    (item): item is Extract<AccountMenuItemSpec, { kind: 'submenu' }> =>
      item.kind === 'submenu',
  );
  const optionDeclarations = submenuItems.map(emitSubmenuOptions).join('\n\n');
  const groups = spec.groups
    .map((group, index) => {
      const label = group.label
        ? `          <DropdownMenuLabel>${group.label}</DropdownMenuLabel>\n`
        : '';
      const items = group.items.map(emitItem).join('\n');
      const separator = index > 0 ? '      <DropdownMenuSeparator />\n' : '';
      return `${separator}      <DropdownMenuGroup>\n${label}${items}\n      </DropdownMenuGroup>`;
    })
    .join('\n');
  return `export function ${spec.componentName}({
  onItemSelect,
  switchValues,
  onSwitchChange,
  submenuValues,
  onSubmenuChange,
}: ${spec.componentName}Props) {
${optionDeclarations}

  return (
    <>
${groups}
    </>
  );
}`;
}

export function buildAccountMenuModule(input: AccountMenuSpec): string {
  const spec = accountMenuSpecSchema.parse(input);
  return [
    banner(spec.specPath),
    emitImports(spec),
    '',
    emitProps(spec.componentName),
    '',
    emitComponent(spec),
    '',
  ].join('\n');
}
