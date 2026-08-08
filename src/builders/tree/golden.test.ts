import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import treeSpec from '../../examples/material/groups/tree/material-group.tree.fixture';
import { buildTreeModule } from './tree-builder';

describe('tree-builder golden fixture', () => {
  it('reproduces the generated material group tree', async () => {
    const goldenPath = resolve(
      process.cwd(),
      'src/examples/material/groups/components/material-group-tree.generated.tsx',
    );
    const golden = readFileSync(goldenPath, 'utf8').replace(/\r\n/g, '\n');
    const config = await prettier.resolveConfig(goldenPath);
    const formatted = await prettier.format(buildTreeModule(treeSpec), {
      ...config,
      parser: 'typescript',
    });

    expect(formatted.replace(/\r\n/g, '\n')).toBe(golden);
  });
});
