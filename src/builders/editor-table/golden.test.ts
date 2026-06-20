import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import leanRowSpec from './__fixtures__/lean-row.editor-table.fixture';
import orderItemSpec from './__fixtures__/order-item.editor-table.fixture';
import { buildEditorTableModule } from './editor-table-builder';
import type { EditorTableSpec } from './editor-table-spec';

async function reproduces(spec: EditorTableSpec, generatedPath: string) {
  const goldenPath = resolve(process.cwd(), generatedPath);
  const golden = readFileSync(goldenPath, 'utf8').replace(/\r\n/g, '\n');

  const raw = buildEditorTableModule(spec);
  const config = await prettier.resolveConfig(goldenPath);
  const formatted = await prettier.format(raw, {
    ...config,
    parser: 'typescript',
  });

  return { formatted: formatted.replace(/\r\n/g, '\n'), golden };
}

describe('editor-table-builder golden fixtures', () => {
  it('reproduces the committed order-items editor table', async () => {
    const { formatted, golden } = await reproduces(
      orderItemSpec,
      'src/builders/editor-table/__fixtures__/order-items-editor-table.generated.tsx',
    );
    expect(formatted).toBe(golden);
  });

  it('reproduces the lean (no currency, no actions) editor table', async () => {
    const { formatted, golden } = await reproduces(
      leanRowSpec,
      'src/builders/editor-table/__fixtures__/lean-row-editor-table.generated.tsx',
    );
    expect(formatted).toBe(golden);
  });
});
