# Form Dialog Builder

Use the form builder for create/edit dialogs backed by react-hook-form and zod. The registry and command
source of truth is [`src/builders/README.md`](../../src/builders/README.md).

## Workflow

1. Reuse or create the feature's zod create/edit schema and inferred values type.
2. Create `<domain>/form/<entity>.form.fixture.ts` exporting a `FormSpec` from `@/builders/form`.
   Define `entity`, `schemaImport`, `schemaName`, `valuesType`, `title`, optional `description`, and
   `fields`.
3. Generate the dialog:

   ```bash
   npm run gen:form -- <spec.ts> <out.tsx>
   ```

4. Keep the provenance banner. Own the output and replace the `handleSubmit` scaffold with the feature
   mutation. Adjust defaults and page-specific copy when required.
5. Let the page own `open`, `onOpenChange`, selected entity, and create/edit mode.
6. Run focused dialog tests and `npm run build`.

## Field Kinds

| Kind | Project control | Binding |
| --- | --- | --- |
| `text` | `Input` | `{...field}` |
| `number` | `Input type="number"` | `{...field}`; prefer `z.coerce.number()` for numeric schemas |
| `textarea` | `Textarea` | `{...field}` |
| `select` | `Select` | `value` and `onValueChange` |
| `combobox` | `Combobox` | `value` and `onChange` |
| `multiselect` | `MultiSelect` | `value` and `onChange` |
| `switch` | `Switch` | `checked` and `onCheckedChange` |

Width presets use the responsive 12-column grid: `normal` is 6 columns, `large` is 8, and `full` is
12. Fields stack on mobile. Select-like options are generated as builder-owned constants.

## Create/Edit Wiring

- Opening create resets clean defaults.
- Opening edit maps the selected entity into form values and resets the form.
- A pending mutation cannot submit twice.
- Success invalidates affected queries, shows feedback, and then closes the dialog.
- Failure keeps the dialog and entered values open and shows normalized feedback.
- Closing clears stale selection at the page boundary.

The page may pass a submit callback or feature data according to the generated component contract. Do
not move server calls into a generic builder runtime.

## Ownership

- The schema owns validation; do not redeclare validation in the spec.
- The spec owns field structure, widths, required markers, and serializable option constants.
- Generated output is scaffold-and-own. Never regenerate over customized logic; use a scratch path.
- Read [`components/forms.md`](../components/forms.md) only when customizing a generated control.
