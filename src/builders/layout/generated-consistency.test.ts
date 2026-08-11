import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('layout-builder generated consistency', () => {
  it('keeps the generated wrapper marked as scaffold-and-own output', () => {
    const generated = readFileSync(
      resolve(
        process.cwd(),
        'src/examples/content-layouts/components/generated-two-column-content-layout.tsx',
      ),
      'utf8',
    );

    expect(generated).toContain('Scaffolded by layout-builder');
    expect(generated).toContain('navigationMinSize?: LayoutAreaSize;');
    expect(generated).toContain('contentHeight?: LayoutAreaHeight;');
    expect(generated).toContain('navigationResizable: false');
  });
});
