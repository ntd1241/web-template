import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import supplierSpec from './__fixtures__/supplier.form.fixture';
import { buildFormModule } from './form-builder';

/**
 * End-to-end golden: the committed `supplier-form.generated.tsx` must be
 * byte-reproducible from its spec via `buildFormModule` + prettier. Regenerate:
 *   npm run gen:form -- src/builders/form/__fixtures__/supplier.form.fixture.ts \
 *     src/builders/form/__fixtures__/supplier-form.generated.tsx
 */
describe('form-builder golden fixture', () => {
  it('reproduces the committed supplier-form.generated.tsx', async () => {
    const goldenPath = resolve(
      process.cwd(),
      'src/builders/form/__fixtures__/supplier-form.generated.tsx',
    );
    const golden = readFileSync(goldenPath, 'utf8').replace(/\r\n/g, '\n');

    const raw = buildFormModule(supplierSpec);
    const config = await prettier.resolveConfig(goldenPath);
    const formatted = await prettier.format(raw, {
      ...config,
      parser: 'typescript',
    });

    expect(formatted.replace(/\r\n/g, '\n')).toBe(golden);
  });
});
