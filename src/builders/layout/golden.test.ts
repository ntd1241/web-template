import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import layoutSpec from '../../examples/content-layouts/layout/content-layout.fixture';
import { buildLayoutModule } from './layout-builder';

describe('layout-builder golden fixture', () => {
  it('reproduces the generated content layout wrapper', async () => {
    const goldenPath = resolve(
      process.cwd(),
      'src/examples/content-layouts/components/generated-two-column-content-layout.tsx',
    );
    const golden = readFileSync(goldenPath, 'utf8').replace(/\r\n/g, '\n');
    const config = await prettier.resolveConfig(goldenPath);
    const formatted = await prettier.format(buildLayoutModule(layoutSpec), {
      ...config,
      parser: 'typescript',
    });

    expect(formatted.replace(/\r\n/g, '\n')).toBe(golden);
  });
});
