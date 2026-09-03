/**
 * CLI: scaffold a typed tenant saved-view adapter from a saved-view spec.
 *
 *   npm run gen:saved-view -- <spec.ts> <out.ts>
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import prettier from 'prettier';
import { buildSavedViewModule } from '../../../src/builders/saved-view/saved-view-builder';
import { savedViewSpecSchema } from '../../../src/builders/saved-view/saved-view-spec';

async function main(): Promise<void> {
  const [specArg, outArg] = process.argv.slice(2);
  if (!specArg || !outArg) {
    console.error('Usage: npm run gen:saved-view -- <spec.ts> <out.ts>');
    process.exit(1);
  }

  const specPath = resolve(specArg);
  const outPath = resolve(outArg);
  const mod = await import(pathToFileURL(specPath).href);
  const spec = savedViewSpecSchema.parse(mod.default ?? mod.spec);
  const raw = buildSavedViewModule({
    ...spec,
    specPath: spec.specPath ?? specArg,
  });
  const prettierConfig = await prettier.resolveConfig(outPath);
  const formatted = await prettier.format(raw, {
    ...prettierConfig,
    parser: 'typescript',
  });

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, formatted);
  console.log(`✓ saved-view-builder wrote ${outArg}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
