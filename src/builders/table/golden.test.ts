import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import employeeSpec from './__fixtures__/employee.table.fixture';
import { buildColumnsModule } from './table-builder';

/**
 * End-to-end golden test: the committed `employee.columns.generated.tsx` must be
 * byte-reproducible from its spec via `buildColumnsModule` + prettier. Any builder
 * drift fails here. The committed golden also serves as the readable, tsc-checked
 * reference for what good output looks like. Regenerate with:
 *   npm run gen:table -- src/builders/table/__fixtures__/employee.table.fixture.ts \
 *     src/builders/table/__fixtures__/employee.columns.generated.tsx
 */
describe('table-builder golden fixture', () => {
  it('reproduces the committed employee.columns.generated.tsx', async () => {
    const goldenPath = resolve(
      process.cwd(),
      'src/builders/table/__fixtures__/employee.columns.generated.tsx',
    );
    const golden = readFileSync(goldenPath, 'utf8').replace(/\r\n/g, '\n');

    const raw = buildColumnsModule(employeeSpec);
    const config = await prettier.resolveConfig(goldenPath);
    const formatted = await prettier.format(raw, {
      ...config,
      parser: 'typescript',
    });

    expect(formatted.replace(/\r\n/g, '\n')).toBe(golden);
  });
});
