import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import detailDialogSpec from './__fixtures__/customer-detail-dialog.fixture';
import { buildDetailDialogModule } from './detail-dialog-builder';

describe('detail-dialog-builder golden fixture', () => {
  it('reproduces the generated customer detail dialog wrapper', async () => {
    const goldenPath = resolve(
      process.cwd(),
      'src/builders/detail-dialog/__fixtures__/customer-detail-dialog.generated.tsx',
    );
    const golden = readFileSync(goldenPath, 'utf8').replace(/\r\n/g, '\n');
    const config = await prettier.resolveConfig(goldenPath);
    const formatted = await prettier.format(
      buildDetailDialogModule(detailDialogSpec),
      {
        ...config,
        parser: 'typescript',
      },
    );

    expect(formatted.replace(/\r\n/g, '\n')).toBe(golden);
  });
});
