import type { MaterialGroup } from '../model/material-group';
import type { MaterialModel } from '../model/material-model';

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

/** Đếm mẫu trực thuộc mỗi nhóm, gồm cả các nhóm con của nhóm đó. */
export function countModelsByGroup(
  models: MaterialModel[],
  groups: MaterialGroup[],
): Map<string, number> {
  const byId = new Map(groups.map((group) => [group.id, group]));
  const counts = new Map(groups.map((group) => [group.id, 0]));

  for (const model of models) {
    const visited = new Set<string>();
    let currentId: string | null = model.groupId;

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      if (counts.has(currentId)) {
        counts.set(currentId, (counts.get(currentId) ?? 0) + 1);
      }
      currentId = byId.get(currentId)?.parentId ?? null;
    }
  }

  return counts;
}
