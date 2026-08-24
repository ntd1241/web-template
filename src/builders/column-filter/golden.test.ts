import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import spec from './__fixtures__/showcase.column-filter.fixture';
import { buildColumnFilterModule } from './column-filter-builder';

describe('column-filter-builder golden fixture', () => {
  it('reproduces the committed generated column filters', async () => {
    const generatedPath = resolve(
      process.cwd(),
      'src/builders/column-filter/__fixtures__/showcase.column-filter.generated.tsx',
    );
    const generated = readFileSync(generatedPath, 'utf8');
    const config = await prettier.resolveConfig(generatedPath);
    const formatted = await prettier.format(buildColumnFilterModule(spec), {
      ...config,
      parser: 'typescript',
    });

    expect(formatted).toBe(generated);
  });
});
