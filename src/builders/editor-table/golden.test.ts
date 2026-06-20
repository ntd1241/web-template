import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import orderItemSpec from './__fixtures__/order-item.editor-table.fixture';
import { buildEditorTableModule } from './editor-table-builder';

describe('editor-table-builder golden fixture', () => {
  it('reproduces the committed order-items editor table', async () => {
    const goldenPath = resolve(
      process.cwd(),
      'src/builders/editor-table/__fixtures__/order-items-editor-table.generated.tsx',
    );
    const golden = readFileSync(goldenPath, 'utf8').replace(/\r\n/g, '\n');

    const raw = buildEditorTableModule(orderItemSpec);
    const config = await prettier.resolveConfig(goldenPath);
    const formatted = await prettier.format(raw, {
      ...config,
      parser: 'typescript',
    });

    expect(formatted.replace(/\r\n/g, '\n')).toBe(golden);
  });
});
