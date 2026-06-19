import { resolve } from 'node:path';
import prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import { buildFormModule } from './form-builder';
import { formSpecSchema, type FormSpec } from './form-spec';

/**
 * Repo-wide guard for form dialogs (sibling of the table builder's check): every
 * committed `*-form-dialog.generated.tsx` must be a REAL builder output. We can't
 * byte-match the whole file (owners fill the submit stub), but the provenance
 * banner and the generated option consts are builder-owned and must match
 * `buildFormModule(spec)`. A hand-written look-alike diverges and fails.
 */
const generatedFiles = import.meta.glob('/src/**/*-form-dialog.generated.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const specModules = import.meta.glob('/src/**/*.form.fixture.ts', {
  eager: true,
}) as Record<string, { default: FormSpec }>;

const SPEC_PATH_RE = /Scaffolded by form-builder from `([^`]+)`/;
const OPTIONS_RE =
  /const \w+Options(: MultiSelectOption\[\])? = \[[\s\S]*?\n\];/g;

async function format(source: string, filePath: string): Promise<string> {
  const config = await prettier.resolveConfig(filePath);
  return prettier.format(source, { ...config, parser: 'typescript' });
}

describe('generated form-dialog files are real builder output', () => {
  const entries = Object.entries(generatedFiles);

  it('finds at least one generated form dialog', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)(
    '%s matches its spec (banner + options)',
    async (key, raw) => {
      const filePath = resolve(process.cwd(), key.replace(/^\//, ''));

      const specMatch = raw.match(SPEC_PATH_RE);
      expect(
        specMatch,
        `${key}: missing "Scaffolded by form-builder from \`<spec>\`" banner — hand-written?`,
      ).toBeTruthy();

      const specModule = specModules[`/${specMatch![1]}`];
      expect(
        specModule,
        `${key}: spec /${specMatch![1]} (from banner) not found — file not traceable to a spec`,
      ).toBeTruthy();

      const spec = formSpecSchema.parse(specModule.default);
      const fileFormatted = await format(raw, filePath);
      const regenFormatted = await format(buildFormModule(spec), filePath);

      const banner = regenFormatted.slice(0, regenFormatted.indexOf('*/') + 2);
      expect(
        fileFormatted,
        `${key}: banner differs from builder output — re-gen, don't hand-edit the banner`,
      ).toContain(banner);

      for (const match of regenFormatted.matchAll(OPTIONS_RE)) {
        expect(
          fileFormatted,
          `${key}: an options const differs from builder output — change the spec + re-gen`,
        ).toContain(match[0]);
      }
    },
  );
});
