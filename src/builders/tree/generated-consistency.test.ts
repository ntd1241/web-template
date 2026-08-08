import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('tree-builder generated consistency', () => {
  it('keeps the generated tree marked as scaffold-and-own output', () => {
    const generated = readFileSync(
      resolve(
        process.cwd(),
        'src/examples/material/groups/components/material-group-tree.generated.tsx',
      ),
      'utf8',
    );

    expect(generated).toContain('Scaffolded by tree-builder');
    expect(generated).toContain('onAdd: (parentId: string | null) => void;');
    expect(generated).toContain('onDelete?: (node: GroupTreeNode) => void;');
  });
});
