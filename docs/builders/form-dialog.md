# Form Builder

Use the form builder for reusable create/edit forms backed by react-hook-form and zod. The registry
and command source of truth is [`src/builders/README.md`](../../src/builders/README.md).

Control JSX is emitted through the shared lower-level form-field builder at
[`src/builders/shared/form-field-builder.ts`](../../src/builders/shared/form-field-builder.ts),
so new higher-level form surfaces should reuse that builder instead of mapping field kinds to UI
primitives again. The control-level Zod schemas live in
[`src/builders/shared/form-field-spec.ts`](../../src/builders/shared/form-field-spec.ts); this form
schema extends them with form-only metadata such as `label`, `width`, and `required`.

## Generated Exports

From one `FormSpec`, the builder emits one `*-form.generated.tsx` file with named exports:

- `<Entity>Form` — inline form core only. It receives `form`, `onSubmit`, optional `id`, and any
  prop-fed option arrays. It has no dialog chrome, padding, or buttons.
- `<Entity>FormDialog` — thin dialog wrapper. It receives `open`, `onOpenChange`, parent-owned
  `form`, `onSubmit`, optional `title`, and forwards prop-fed option arrays to `<Entity>Form`.
- `use<Entity>Form(options?)` — creates the RHF instance with `zodResolver(<schema>)` and generated
  defaults wired in. The page owns this instance.
- `<entity>DefaultValues` — exported default values derived from the field kind registry.
- `map<Entity>ToFormValues(entity)` — edit-mode mapper scaffold. Replace the generated
  `unknown` source alias with the real entity type and fill the TODO body.

The dialog header does not render a description by default. Add `description` to the `FormSpec`
only when the dialog needs supporting guidance; otherwise the builder omits both the description
element and its unused import.

Static select-like options are emitted as module constants only when `optionsFrom` is omitted or
`'static'`.

## Workflow

1. Reuse or create the feature's zod create/edit schema and inferred values type.
2. Create `<domain>/form/<entity>.form.fixture.ts` exporting a `FormSpec` from `@/builders/form`.
   Define `entity`, `schemaImport`, `schemaName`, `valuesType`, `title`, optional `description`, and
   `fields`.
3. Generate the artifact:

   ```bash
   npm run gen:form -- <spec.ts> <out.tsx>
   ```

   Example:

   ```bash
   npm run gen:form -- src/builders/form/__fixtures__/supplier.form.fixture.ts src/builders/form/__fixtures__/supplier-form.generated.tsx
   ```

4. Keep the provenance banner. Own the output and fill page-specific submit, edit mapping, pending,
   success, and failure behavior in the parent.
5. Let the page own `open`, `onOpenChange`, selected entity, create/edit mode, fetched option data, and
   the RHF instance.
6. Run focused form/dialog tests and `npm run build`.

## Field Kinds

| Kind          | Project control       | Binding                                                      |
| ------------- | --------------------- | ------------------------------------------------------------ |
| `text`        | `Input`               | `{...field}`                                                 |
| `number`      | `Input type="number"` | `{...field}`; prefer `z.coerce.number()` for numeric schemas |
| `date`        | `DatePickerInput`     | `value`, `onChange`, and `onBlur`                            |
| `textarea`    | `Textarea`            | `{...field}`                                                 |
| `select`      | `Select`              | `value` and `onValueChange`                                  |
| `combobox`    | `Combobox`            | `value` and `onChange`                                       |
| `multiselect` | `MultiSelect`         | `value` and `onChange`                                       |
| `switch`      | `Switch`              | `checked` and `onCheckedChange`                              |

Date fields may set `format: 'display' | 'iso'`; number fields may set
`format: 'plain' | 'currency' | 'percent'`. These semantic presets are defined once by the shared
field schema and mapped to runtime controls by the field renderer.

Width presets use the responsive 12-column grid: `normal` is 6 columns, `large` is 8, and `full` is 12. Fields stack on mobile.

## Create/Edit Wiring

Use one form instance and reset it whenever the page changes mode:

```tsx
const form = useSupplierForm();

useEffect(() => {
  if (!open) return;

  if (selectedSupplier) {
    form.reset(mapSupplierToFormValues(selectedSupplier));
    return;
  }

  form.reset(supplierDefaultValues);
}, [form, open, selectedSupplier]);

<SupplierFormDialog
  open={open}
  onOpenChange={setOpen}
  form={form}
  onSubmit={handleSubmit}
  title={selectedSupplier ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}
  regionOptions={regionOptions}
/>;
```

- Opening create resets clean defaults.
- Opening edit maps the selected entity into form values and resets the form.
- A pending mutation cannot submit twice.
- Success invalidates affected queries, shows feedback, and then closes the dialog.
- Failure keeps the dialog and entered values open and shows normalized feedback.
- Closing clears stale selection at the page boundary.

### Dialog lifecycle pattern

Keep dialog visibility and the entity being edited in separate state values:

- `dialogOpen` controls whether the dialog is open.
- `dialogEntity` keeps the create/edit mode and source entity stable during the close animation.
- Reset the form when opening the dialog, after assigning `dialogEntity`.
- On cancel or successful submit, set only `dialogOpen` to `false`.
- Do not immediately clear `dialogEntity` or reset the form while the dialog is closing. The next
  open action replaces the entity and resets the form with fresh values.

This prevents a closing dialog from switching mode mid-animation, such as briefly showing a
create-only field while editing. It also prevents submitted values from appearing to change before
the dialog disappears. Failed submissions keep both the dialog and entered values unchanged.

The page may render `<Entity>Form` inline for a full page or drawer surface and reuse the same
`use<Entity>Form()` instance, submit callback, mapper, and option props.

## API-Fetched Options

For `select`, `combobox`, and `multiselect`, set `optionsFrom: 'prop'` when options come from the
page instead of a static list:

```ts
{
  kind: 'combobox',
  name: 'region',
  label: 'Khu vực',
  placeholder: 'Chọn khu vực',
  optionsFrom: 'prop',
}
```

The generated components require a `<fieldName>Options` prop. Types are:

- `select` → `Array<{ value: string; label: string }>`
- `combobox` → `ComboboxOption[]`
- `multiselect` → `MultiSelectOption[]`

Fetch options at the page boundary and pass them down:

```tsx
const regionsQuery = useQuery({
  queryKey: ['regions', 'options'],
  queryFn: fetchRegionOptions,
});

const regionOptions = (regionsQuery.data ?? []).map((region) => ({
  value: region.id,
  label: region.name,
}));

<SupplierFormDialog
  open={open}
  onOpenChange={setOpen}
  form={form}
  onSubmit={handleSubmit}
  regionOptions={regionOptions}
/>;
```

Do not move server calls into the generated artifact. Keep server state in React Query at the page or
feature boundary, then pass serializable option arrays to the generated form.

## Ownership

- The schema owns validation; do not redeclare validation in the spec.
- The spec owns field structure, widths, required markers, static option constants, and prop option
  contracts.
- Generated output is scaffold-and-own. Never regenerate over customized logic; use a scratch path.
- Read [`components/forms.md`](../components/forms.md) only when customizing a generated control.
