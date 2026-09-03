import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import spec from '../../project/employees/model/employee-saved-view.spec';
import { buildSavedViewModule } from './saved-view-builder';

describe('saved-view-builder golden fixture', () => {
  it('reproduces the employee saved-view adapter', async () => {
    const generatedPath = resolve(
      process.cwd(),
      'src/project/employees/model/employee-saved-view.ts',
    );
    const generated = readFileSync(generatedPath, 'utf8');
    const config = await prettier.resolveConfig(generatedPath);
    const formatted = await prettier.format(buildSavedViewModule(spec), {
      ...config,
      parser: 'typescript',
    });

    expect(formatted).toBe(generated);
  });
});
