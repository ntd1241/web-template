import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import detailSpec from './__fixtures__/customer-detail-layout.fixture';
import { buildDetailModule } from './detail-builder';

describe('detail-builder golden fixture', () => {
  it('reproduces the generated customer detail layout wrapper', async () => {
    const goldenPath = resolve(
      process.cwd(),
      'src/builders/detail/__fixtures__/customer-detail-layout.generated.tsx',
    );
    const golden = readFileSync(goldenPath, 'utf8').replace(/\r\n/g, '\n');
    const config = await prettier.resolveConfig(goldenPath);
    const formatted = await prettier.format(buildDetailModule(detailSpec), {
      ...config,
      parser: 'typescript',
    });

    expect(formatted.replace(/\r\n/g, '\n')).toBe(golden);
  });
});
