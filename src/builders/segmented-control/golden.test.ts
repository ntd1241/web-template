import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import spec from './__fixtures__/showcase.segmented-control.fixture';
import { buildSegmentedControlModule } from './segmented-control-builder';

describe('segmented-control-builder golden fixture', () => {
  it('reproduces the committed generated control', async () => {
    const generatedPath = resolve(
      process.cwd(),
      'src/builders/segmented-control/__fixtures__/showcase.segmented-control.generated.tsx',
    );
    const generated = readFileSync(generatedPath, 'utf8');
    const config = await prettier.resolveConfig(generatedPath);
    const formatted = await prettier.format(buildSegmentedControlModule(spec), {
      ...config,
      parser: 'typescript',
    });

    expect(formatted).toBe(generated);
  });
});
