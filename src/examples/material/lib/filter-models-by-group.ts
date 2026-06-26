import { getSelfAndDescendantIds } from '../groups/group-tree';
import type { MaterialGroup } from '../model/material-group';
import type { MaterialModel } from '../model/material-model';

export function filterModelsByGroup(
  models: MaterialModel[],
  groups: MaterialGroup[],
  groupId: string | null,
): MaterialModel[] {
  if (!groupId) return models;
  const ids = getSelfAndDescendantIds(groups, groupId);
  return models.filter((model) => ids.has(model.groupId));
}
