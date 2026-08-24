import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import spec from './__fixtures__/showcase.filter.fixture';
import { buildFilterModule } from './filter-builder';

describe('filter-builder golden fixture', () => {
  it('reproduces the committed generated toolbar', async () => {
    const generatedPath = resolve(
      process.cwd(),
      'src/builders/filter/__fixtures__/showcase.filter.generated.tsx',
    );
    const generated = readFileSync(generatedPath, 'utf8');
    const config = await prettier.resolveConfig(generatedPath);
    const formatted = await prettier.format(buildFilterModule(spec), {
      ...config,
      parser: 'typescript',
    });

    expect(formatted).toBe(generated);
  });
});
