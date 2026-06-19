/**
 * CLI: scaffold a `*.columns.generated.tsx` from a table spec.
 *
 *   npm run gen:table -- <spec.ts> <out.tsx>
 *
 * Reads a spec module (default export = TableSpec), runs the pure generator,
 * formats with the repo's prettier config, and writes the file. Scaffold-and-own:
 * the output is yours to edit afterwards — re-running overwrites, so point it at a
 * scratch path when refreshing a file you've already customized.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import prettier from 'prettier';
import { tableSpecSchema } from '../../../src/builders/table/column-spec';
import { buildColumnsModule } from '../../../src/builders/table/table-builder';

async function main(): Promise<void> {
  const [specArg, outArg] = process.argv.slice(2);
  if (!specArg || !outArg) {
    console.error('Usage: npm run gen:table -- <spec.ts> <out.tsx>');
    process.exit(1);
  }

  const specPath = resolve(specArg);
  const outPath = resolve(outArg);

  const mod = await import(pathToFileURL(specPath).href);
  const spec = tableSpecSchema.parse(mod.default ?? mod.spec);

  const raw = buildColumnsModule({
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
  console.log(`✓ table-builder wrote ${outArg}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
