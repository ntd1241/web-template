import { describe, expect, it } from 'vitest';
import type { MaterialGroup } from '../model/material-group';
import type { MaterialModel } from '../model/material-model';
import { filterModelsByGroup } from './filter-models-by-group';

const groups: MaterialGroup[] = [
  { id: 'g1', code: 'A', name: 'A', parentId: null, sortOrder: 1 },
  { id: 'g2', code: 'B', name: 'B', parentId: 'g1', sortOrder: 1 },
];

const models = [
  { id: 'm1', groupId: 'g1' },
  { id: 'm2', groupId: 'g2' },
] as MaterialModel[];

describe('filterModelsByGroup', () => {
  it('null group trả tất cả', () => {
    expect(filterModelsByGroup(models, groups, null)).toHaveLength(2);
  });

  it('nhóm cha gồm cả model nhóm con', () => {
    expect(filterModelsByGroup(models, groups, 'g1').map((m) => m.id)).toEqual([
      'm1',
      'm2',
    ]);
  });

  it('nhóm con chỉ model của nó', () => {
    expect(filterModelsByGroup(models, groups, 'g2').map((m) => m.id)).toEqual([
      'm2',
    ]);
  });
});
