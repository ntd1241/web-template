import { describe, expect, it } from 'vitest';
import { buildTreeModule } from './tree-builder';
import { treeSpecSchema } from './tree-spec';

const baseSpec = {
  entity: 'Node',
  modelImport: '../node',
  componentName: 'GeneratedNodeTree',
  actions: [
    { key: 'add', kind: 'add', label: 'Thêm', nodeLabel: 'Thêm con' },
    { key: 'edit', kind: 'edit', label: 'Sửa', optional: true },
    { key: 'delete', kind: 'delete', label: 'Xóa', optional: true },
    {
      key: 'archive',
      kind: 'custom',
      label: 'Lưu trữ',
      icon: 'Archive',
      optional: true,
    },
  ],
} as const;

describe('tree-builder', () => {
  it('emits a callback-only tree with built-in and custom actions', () => {
    const source = buildTreeModule({ ...baseSpec, includeAllRow: true });

    expect(source).toContain('onAdd: (parentId: string | null) => void;');
    expect(source).toContain('onEdit?: (node: Node) => void;');
    expect(source).toContain('onArchive?: (node: Node) => void;');
    expect(source).toContain('<Archive className="size-3.5 !opacity-100" />');
    expect(source).toContain('onAdd(null)');
    expect(source).toContain('onAdd(node.id)');
    expect(source).toContain('onArchive(node)');
  });

  it('supports custom node field names', () => {
    const source = buildTreeModule({
      entity: 'TreeItem',
      modelImport: '../tree-item',
      componentName: 'TreeItemView',
      idField: 'key',
      labelField: 'title',
      depthField: 'level',
      childrenField: 'items',
      actions: [{ key: 'add', kind: 'add', label: 'Thêm' }],
    });

    expect(source).toContain('node.key');
    expect(source).toContain('node.title');
    expect(source).toContain('node.items');
    expect(source).toContain('node.level * 16 + 4');
  });

  it('rejects invalid action configurations', () => {
    expect(() =>
      treeSpecSchema.parse({
        ...baseSpec,
        includeAllRow: true,
        actions: [{ key: 'archive', kind: 'custom', label: 'Lưu trữ' }],
      }),
    ).toThrow(/custom action cần khai báo icon/);

    expect(() =>
      treeSpecSchema.parse({
        ...baseSpec,
        actions: [
          { key: 'add', kind: 'add', label: 'Thêm' },
          { key: 'add', kind: 'add', label: 'Thêm nữa' },
        ],
      }),
    ).toThrow(/action key bị trùng/);

    expect(() =>
      treeSpecSchema.parse({
        ...baseSpec,
        includeAllRow: true,
        actions: [{ key: 'edit', kind: 'edit', label: 'Sửa', scope: 'all' }],
      }),
    ).toThrow(/chỉ action add được hiển thị/);
  });
});
