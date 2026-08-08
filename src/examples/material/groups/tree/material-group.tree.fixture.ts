import type { TreeSpec } from '../../../../builders/tree';

const spec = {
  entity: 'GroupTreeNode',
  modelImport: '../group-tree',
  componentName: 'GeneratedMaterialGroupTree',
  panelComponentName: 'GeneratedMaterialGroupTreePanel',
  specPath: 'src/examples/material/groups/tree/material-group.tree.fixture.ts',
  includeAllRow: true,
  actions: [
    {
      key: 'add',
      kind: 'add',
      label: 'Thêm nhóm',
      nodeLabel: 'Thêm nhóm con',
    },
    {
      key: 'edit',
      kind: 'edit',
      label: 'Sửa nhóm',
      optional: true,
    },
    {
      key: 'delete',
      kind: 'delete',
      label: 'Xóa nhóm',
      optional: true,
    },
  ],
} satisfies TreeSpec;

export default spec;
