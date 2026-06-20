/**
 * CLI: scaffold a `*-form.generated.tsx` from a form spec.
 *
 *   npm run gen:form -- <spec.ts> <out.tsx>
 *
 * Reads a spec module (default export = FormSpec), runs the pure generator,
 * formats with the repo's prettier config, and writes the file. Scaffold-and-own:
 * the output is yours afterwards — re-running overwrites, so point it at a scratch
 * path when refreshing a file you've customized.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import prettier from 'prettier';
import { buildFormModule } from '../../../src/builders/form/form-builder';
import { formSpecSchema } from '../../../src/builders/form/form-spec';

async function main(): Promise<void> {
  const [specArg, outArg] = process.argv.slice(2);
  if (!specArg || !outArg) {
    console.error('Usage: npm run gen:form -- <spec.ts> <out.tsx>');
    process.exit(1);
  }

  const specPath = resolve(specArg);
  const outPath = resolve(outArg);

  const mod = await import(pathToFileURL(specPath).href);
  const spec = formSpecSchema.parse(mod.default ?? mod.spec);

  const raw = buildFormModule({ ...spec, specPath: spec.specPath ?? specArg });
  const prettierConfig = await prettier.resolveConfig(outPath);
  const formatted = await prettier.format(raw, {
    ...prettierConfig,
    parser: 'typescript',
  });

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, formatted);
  console.log(`✓ form-builder wrote ${outArg}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
