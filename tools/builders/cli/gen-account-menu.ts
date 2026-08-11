/**
 * CLI: scaffold account-menu content from an account-menu spec.
 *
 *   npm run gen:account-menu -- <spec.ts> <out.tsx>
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import prettier from 'prettier';
import { buildAccountMenuModule } from '../../../src/builders/account-menu/account-menu-builder';
import { accountMenuSpecSchema } from '../../../src/builders/account-menu/account-menu-spec';

async function main(): Promise<void> {
  const [specArg, outArg] = process.argv.slice(2);
  if (!specArg || !outArg) {
    console.error('Usage: npm run gen:account-menu -- <spec.ts> <out.tsx>');
    process.exit(1);
  }

  const specPath = resolve(specArg);
  const outPath = resolve(outArg);
  const mod = await import(pathToFileURL(specPath).href);
  const spec = accountMenuSpecSchema.parse(mod.default ?? mod.spec);
  const raw = buildAccountMenuModule({
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
  console.log(`✓ account-menu-builder wrote ${outArg}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
