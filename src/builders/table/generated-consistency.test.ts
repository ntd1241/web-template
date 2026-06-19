import { resolve } from 'node:path';
import prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import { type TableSpec, tableSpecSchema } from './column-spec';
import { buildColumnsModule } from './table-builder';

/**
 * Repo-wide guard: every committed `*.columns.generated.tsx` must be a REAL
 * builder output, not a hand-written look-alike. We can't byte-match the whole
 * file (scaffold-and-own lets owners fill cell stubs + add imports), but the
 * **provenance banner** and **badge config** are builder-owned and must match
 * what `buildColumnsModule(spec)` produces. A hand-written / paraphrased file
 * (e.g. an agent that skipped `npm run gen:table`) diverges here and fails.
 *
 * The spec is found via the banner's `Scaffolded by table-builder from \`...\``.
 */
const generatedFiles = import.meta.glob('/src/**/*.columns.generated.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const specModules = import.meta.glob('/src/**/*.table.fixture.ts', {
  eager: true,
}) as Record<string, { default: TableSpec }>;

const SPEC_PATH_RE = /Scaffolded by table-builder from `([^`]+)`/;
const BADGE_CONFIG_RE =
  /const \w+BadgeConfig: StatusBadgeConfig<[^>]*> = \{[\s\S]*?\n\};/g;

async function format(source: string, filePath: string): Promise<string> {
  const config = await prettier.resolveConfig(filePath);
  return prettier.format(source, { ...config, parser: 'typescript' });
}

describe('generated table-column files are real builder output', () => {
  const entries = Object.entries(generatedFiles);

  it('finds at least one generated file', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)('%s matches its spec (banner + badge config)', async (
    key,
    raw,
  ) => {
    const filePath = resolve(process.cwd(), key.replace(/^\//, ''));

    const specMatch = raw.match(SPEC_PATH_RE);
    expect(
      specMatch,
      `${key}: missing "Scaffolded by table-builder from \`<spec>\`" banner — hand-written?`,
    ).toBeTruthy();

    const specKey = `/${specMatch![1]}`;
    const specModule = specModules[specKey];
    expect(
      specModule,
      `${key}: spec ${specKey} (from banner) not found — file is not traceable to a spec`,
    ).toBeTruthy();

    const spec = tableSpecSchema.parse(specModule.default);
    const fileFormatted = await format(raw, filePath);
    const regenFormatted = await format(buildColumnsModule(spec), filePath);

    // Banner block must be byte-identical (no hand-edits / extra lines).
    const banner = regenFormatted.slice(0, regenFormatted.indexOf('*/') + 2);
    expect(
      fileFormatted,
      `${key}: banner differs from builder output — re-gen, don't hand-edit the banner`,
    ).toContain(banner);

    // Each badge config const must be byte-identical to builder output.
    for (const match of regenFormatted.matchAll(BADGE_CONFIG_RE)) {
      expect(
        fileFormatted,
        `${key}: a badge config differs from builder output — change the spec + re-gen`,
      ).toContain(match[0]);
    }
  });
});
