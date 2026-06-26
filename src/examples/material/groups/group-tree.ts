import type { MaterialGroup } from '../model/material-group';

export interface GroupTreeNode extends MaterialGroup {
  children: GroupTreeNode[];
  depth: number;
}

/** Dựng cây từ danh sách phẳng, sắp xếp theo sortOrder rồi tên. */
export function buildGroupTree(groups: MaterialGroup[]): GroupTreeNode[] {
  const byId = new Map<string, GroupTreeNode>();
  for (const group of groups) {
    byId.set(group.id, { ...group, children: [], depth: 0 });
  }

  const roots: GroupTreeNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: GroupTreeNode[], depth: number) => {
    nodes.sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
    );
    for (const node of nodes) {
      node.depth = depth;
      sortNodes(node.children, depth + 1);
    }
  };
  sortNodes(roots, 0);

  return roots;
}

/** Tập id của chính nó + toàn bộ hậu duệ (để chặn chọn làm nhóm cha → vòng). */
export function getSelfAndDescendantIds(
  groups: MaterialGroup[],
  id: string,
): Set<string> {
  const childrenByParent = new Map<string, string[]>();
  for (const group of groups) {
    if (!group.parentId) continue;
    const list = childrenByParent.get(group.parentId) ?? [];
    list.push(group.id);
    childrenByParent.set(group.parentId, list);
  }

  const result = new Set<string>();
  const stack = [id];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (result.has(current)) continue;
    result.add(current);
    for (const child of childrenByParent.get(current) ?? []) {
      stack.push(child);
    }
  }
  return result;
}

export function countDirectChildren(
  groups: MaterialGroup[],
  id: string,
): number {
  return groups.filter((group) => group.parentId === id).length;
}
