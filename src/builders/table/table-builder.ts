import {
  tableSpecSchema,
  type ColumnSpec,
  type TableSpec,
} from './column-spec';
import { COLUMN_KIND_REGISTRY } from './field-kinds';

/**
 * Pure table-builder generator. `buildColumnsModule(spec)` validates the spec
 * and returns the source of a `*.columns.generated.tsx` file: a
 * `use<Entity>Columns()` hook assembled in one `useMemo` on top of the
 * `@/components/ui/data-grid-columns` column-factory.
 *
 * Scaffold-and-own: the builder is a one-shot scaffolder. After generation the
 * file is owned and edited freely; the builder never merges back into it. Cells
 * that need JSX/handlers (`actions`/`custom`) are emitted as inline stubs the
 * owner fills in place.
 *
 * String-only and synchronous so it is trivially unit-testable. The CLI under
 * `tools/` runs prettier on the result before writing it to disk.
 */

function banner(specPath?: string): string {
  const source = specPath ? ` from \`${specPath}\`` : '';
  return `/**
 * Scaffolded by table-builder${source}. Run \`npm run gen:table\` — do NOT hand-write this file.
 * You own this file now — fill the \`cell: () => null\` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */`;
}

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/** Object key: bare when a valid identifier, quoted otherwise (e.g. `kiem-ke`). */
function objectKey(key: string): string {
  return /^[a-zA-Z_$][\w$]*$/.test(key) ? key : quote(key);
}

function accessor(field: string): string {
  return `(row) => row.${field}`;
}

/** Indent every line of `block` by `spaces`, leaving blank lines untouched. */
function indent(block: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return block
    .split('\n')
    .map((line) => (line.length > 0 ? pad + line : line))
    .join('\n');
}

/** Emit a `{ key: value, ... }` argument object from prebuilt property lines. */
function emitObject(propLines: string[]): string {
  return `{\n${propLines.map((line) => `  ${line}`).join('\n')}\n}`;
}

/** Common meta props shared by most column kinds, in a stable order. */
function commonMetaLines(
  col: ColumnSpec & {
    headerClassName?: string;
    cellClassName?: string;
    size?: number;
    visibility?: boolean;
    enableSorting?: boolean;
  },
): string[] {
  const lines: string[] = [];
  if (col.headerClassName)
    lines.push(`headerClassName: ${quote(col.headerClassName)},`);
  if (col.cellClassName)
    lines.push(`cellClassName: ${quote(col.cellClassName)},`);
  if (col.size !== undefined) lines.push(`size: ${col.size},`);
  if (col.visibility !== undefined)
    lines.push(`visibility: ${col.visibility},`);
  if (col.enableSorting !== undefined)
    lines.push(`enableSorting: ${col.enableSorting},`);
  return lines;
}

/** Build the `col.<method>(...)` call source for a single column spec. */
function emitColumnCall(col: ColumnSpec): string {
  const method = COLUMN_KIND_REGISTRY[col.kind].factoryMethod;

  if (col.kind === 'select') {
    return 'col.select()';
  }

  if (col.kind === 'index') {
    const lines: string[] = [];
    if (col.id) lines.push(`id: ${quote(col.id)},`);
    if (col.header) lines.push(`header: ${quote(col.header)},`);
    lines.push(...commonMetaLines(col));
    return lines.length === 0
      ? 'col.index()'
      : `col.index(${emitObject(lines)})`;
  }

  if (col.kind === 'actions' || col.kind === 'custom') {
    const lines: string[] = [];
    if (col.id) lines.push(`id: ${quote(col.id)},`);
    if (col.header) lines.push(`header: ${quote(col.header)},`);
    lines.push(...commonMetaLines(col));
    // Inline stub the owner fills in place — keeps cell logic in this owned file.
    lines.push(
      '// TODO(scaffold): điền nội dung cell — vd: (row) => <Button .../>.',
    );
    lines.push('cell: () => null,');
    return `col.${method}(${emitObject(lines)})`;
  }

  // Accessor kinds: id, header, get, then kind-specific options, then meta.
  const lines: string[] = [
    `id: ${quote(col.id)},`,
    `header: ${quote(col.header)},`,
    `get: ${accessor(col.field)},`,
  ];

  if (col.kind === 'text' && col.tooltipOnTruncate !== undefined) {
    lines.push(`tooltipOnTruncate: ${col.tooltipOnTruncate},`);
  }
  if (col.kind === 'number') {
    const opts: string[] = [];
    if (col.minimumFractionDigits !== undefined)
      opts.push(`minimumFractionDigits: ${col.minimumFractionDigits}`);
    if (col.maximumFractionDigits !== undefined)
      opts.push(`maximumFractionDigits: ${col.maximumFractionDigits}`);
    if (opts.length > 0) lines.push(`options: { ${opts.join(', ')} },`);
  }
  if (col.kind === 'percent' && col.fractionDigits !== undefined) {
    lines.push(`fractionDigits: ${col.fractionDigits},`);
  }
  if (col.kind === 'date' && col.mode) {
    lines.push(`mode: ${quote(col.mode)},`);
  }
  if (col.kind === 'badge') {
    lines.push(`config: ${col.id}BadgeConfig,`);
  }

  lines.push(...commonMetaLines(col));
  return `col.${method}(${emitObject(lines)})`;
}

/** Emit the standalone `const <id>BadgeConfig` declarations for badge columns. */
function emitBadgeConfigs(columns: ColumnSpec[]): string {
  const blocks = columns
    .filter(
      (col): col is Extract<ColumnSpec, { kind: 'badge' }> =>
        col.kind === 'badge',
    )
    .map((col) => {
      const rows = Object.entries(col.config).map(([status, cfg]) => {
        const props: string[] = [`label: ${quote(cfg.label)}`];
        if (cfg.variant) props.push(`variant: ${quote(cfg.variant)}`);
        if (cfg.className) props.push(`className: ${quote(cfg.className)}`);
        if (cfg.dotClassName)
          props.push(`dotClassName: ${quote(cfg.dotClassName)}`);
        return `  ${objectKey(status)}: { ${props.join(', ')} },`;
      });
      return `const ${col.id}BadgeConfig: StatusBadgeConfig<string> = {\n${rows.join('\n')}\n};`;
    });
  return blocks.join('\n\n');
}

/** Build the import block, including only what the columns actually use. */
function emitImports(spec: TableSpec): string {
  const hasBadge = spec.columns.some((col) => col.kind === 'badge');

  const lines = ["import { useMemo } from 'react';"];
  lines.push("import type { ColumnDef } from '@tanstack/react-table';");
  lines.push(
    hasBadge
      ? "import {\n  createColumnHelpers,\n  type StatusBadgeConfig,\n} from '@/components/ui/data-grid-columns';"
      : "import { createColumnHelpers } from '@/components/ui/data-grid-columns';",
  );
  lines.push(`import type { ${spec.entity} } from ${quote(spec.modelImport)};`);
  return lines.join('\n');
}

export function buildColumnsModule(input: TableSpec): string {
  const spec = tableSpecSchema.parse(input);
  const hookName = spec.hookName ?? `use${spec.entity}Columns`;

  const calls = spec.columns
    .map((col) => indent(`${emitColumnCall(col)},`, 6))
    .join('\n');

  const memoBody = `const col = createColumnHelpers<${spec.entity}>();\n\nreturn [\n${calls}\n];`;
  const fn = `export function ${hookName}(): ColumnDef<${spec.entity}>[] {\n  return useMemo(() => {\n${indent(memoBody, 4)}\n  }, []);\n}`;

  const badgeConfigs = emitBadgeConfigs(spec.columns);
  const preamble = badgeConfigs ? `${badgeConfigs}\n\n` : '';

  return `${banner(spec.specPath)}\n${emitImports(spec)}\n\n${preamble}${fn}\n`;
}
