/**
 * CLI: scaffold an editor table component from an editor-table spec.
 *
 *   tsx tools/builders/cli/gen-editor-table.ts <spec.ts> <out.tsx>
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import prettier from 'prettier';
import { buildEditorTableModule } from '../../../src/builders/editor-table/editor-table-builder';
import { editorTableSpecSchema } from '../../../src/builders/editor-table/editor-table-spec';

async function main(): Promise<void> {
  const [specArg, outArg] = process.argv.slice(2);
  if (!specArg || !outArg) {
    console.error(
      'Usage: tsx tools/builders/cli/gen-editor-table.ts <spec.ts> <out.tsx>',
    );
    process.exit(1);
  }

  const specPath = resolve(specArg);
  const outPath = resolve(outArg);

  const mod = await import(pathToFileURL(specPath).href);
  const spec = editorTableSpecSchema.parse(mod.default ?? mod.spec);

  const raw = buildEditorTableModule({
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
  console.log(`✓ editor-table-builder wrote ${outArg}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
