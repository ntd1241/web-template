# Tree builder

The tree builder scaffolds a reusable hierarchical navigation surface from a
small `TreeSpec`. It owns the tree layout, selection state presentation,
count badges, hover actions, tooltips, and optional “Tất cả” row. The generated
component only exposes callbacks; it does not contain screen business logic.

```bash
npm run gen:tree -- <spec.ts> <out.tsx>
```

An action can be one of the built-ins (`add`, `edit`, `delete`) or a custom
action. Custom actions provide a Lucide icon name and receive the current node
through an optional callback prop. The generated file is scaffold-and-own:
wire callbacks or override the presentation in the generated file after
generation. To change the spec later, generate into a scratch path first.

Example:

```ts
export default {
  entity: 'GroupTreeNode',
  modelImport: '../group-tree',
  componentName: 'GeneratedMaterialGroupTree',
  includeAllRow: true,
  actions: [
    {
      key: 'add',
      kind: 'add',
      label: 'Thêm nhóm',
      nodeLabel: 'Thêm nhóm con',
    },
    { key: 'edit', kind: 'edit', label: 'Sửa nhóm', optional: true },
    { key: 'delete', kind: 'delete', label: 'Xóa nhóm', optional: true },
    {
      key: 'archive',
      kind: 'custom',
      label: 'Lưu trữ',
      icon: 'Archive',
      optional: true,
    },
  ],
} satisfies import('@/builders/tree').TreeSpec;
```
