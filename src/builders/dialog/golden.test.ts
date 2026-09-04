import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import spec from './__fixtures__/showcase.dialog.fixture';
import { buildDialogModule } from './dialog-builder';

describe('dialog-builder golden fixture', () => {
  it('reproduces the committed generated dialog', async () => {
    const generatedPath = resolve(
      process.cwd(),
      'src/builders/dialog/__fixtures__/showcase.dialog.generated.tsx',
    );
    const generated = readFileSync(generatedPath, 'utf8');
    const config = await prettier.resolveConfig(generatedPath);
    const formatted = await prettier.format(buildDialogModule(spec), {
      ...config,
      parser: 'typescript',
    });

    expect(formatted).toBe(generated);
  });
});
