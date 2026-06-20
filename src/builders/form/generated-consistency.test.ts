import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import supplierSpec from './__fixtures__/supplier.form.fixture';
import { buildFormModule } from './form-builder';

describe('generated form files are real builder output', () => {
  it('keeps supplier-form.generated.tsx equal to a fresh build', async () => {
    const filePath = resolve(
      process.cwd(),
      'src/builders/form/__fixtures__/supplier-form.generated.tsx',
    );
    const committed = readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

    const config = await prettier.resolveConfig(filePath);
    const fresh = await prettier.format(buildFormModule(supplierSpec), {
      ...config,
      parser: 'typescript',
    });

    expect(fresh.replace(/\r\n/g, '\n')).toBe(committed);
  });
});
