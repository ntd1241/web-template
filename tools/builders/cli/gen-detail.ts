/**
 * CLI: scaffold an entity detail layout from a detail spec.
 *
 *   npm run gen:detail -- <spec.ts> <out.tsx>
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import prettier from 'prettier';
import { buildDetailModule } from '../../../src/builders/detail/detail-builder';
import { detailSpecSchema } from '../../../src/builders/detail/detail-spec';

async function main(): Promise<void> {
  const [specArg, outArg] = process.argv.slice(2);
  if (!specArg || !outArg) {
    console.error('Usage: npm run gen:detail -- <spec.ts> <out.tsx>');
    process.exit(1);
  }

  const specPath = resolve(specArg);
  const outPath = resolve(outArg);
  const mod = await import(pathToFileURL(specPath).href);
  const spec = detailSpecSchema.parse(mod.default ?? mod.spec);
  const raw = buildDetailModule({
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
  console.log(`✓ detail-builder wrote ${outArg}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
