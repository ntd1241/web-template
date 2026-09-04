# Dialog builder

Use the dialog builder for standard modal chrome whose feature-specific content is composed by the
caller. The spec owns the title, optional description, width, and footer actions. The generated
component receives `children` for the body and callback props for each configured action.

Create a fixture and generate the shell:

```bash
npm run gen:dialog -- <spec.ts> <out.tsx>
```

The generated dialog uses the shared spacing contract used by the existing form dialogs:

- content: `p-0`, `gap-0`, and a column layout;
- header: `px-6 py-5`;
- body: `px-6 py-5` with a bounded scroll area;
- footer: `px-6 py-4`.

This builder is for dialog chrome, not create/edit form behavior. Use `form-builder` when the dialog
is a reusable RHF + zod create/edit form.
