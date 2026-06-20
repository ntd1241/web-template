import type { ColumnKind } from './column-spec';

/**
 * Seed of the shared **field-kind registry** (plan decision 4). For now it only
 * carries the table-side mapping: each kind → the `data-grid-columns`
 * column-factory method it emits, and whether the cell needs a render callback
 * supplied by the owned container (JSX/handlers the builder can't serialize).
 *
 * The form builder will extend this with an `input` field per kind so a single
 * registry drives both table columns and form inputs.
 */
export interface ColumnKindMeta {
  /** Column-factory method this kind compiles to (`col.<factoryMethod>(...)`). */
  factoryMethod: string;
  /** True when the cell is emitted as an inline stub the owner fills in place. */
  needsCellStub: boolean;
  /** True when the cell reads a model field via `get: (row) => row.<field>`. */
  isAccessor: boolean;
}

export const COLUMN_KIND_REGISTRY: Record<ColumnKind, ColumnKindMeta> = {
  index: { factoryMethod: 'index', needsCellStub: false, isAccessor: false },
  select: { factoryMethod: 'select', needsCellStub: false, isAccessor: false },
  text: { factoryMethod: 'text', needsCellStub: false, isAccessor: true },
  number: { factoryMethod: 'number', needsCellStub: false, isAccessor: true },
  currency: {
    factoryMethod: 'currency',
    needsCellStub: false,
    isAccessor: true,
  },
  percent: { factoryMethod: 'percent', needsCellStub: false, isAccessor: true },
  date: { factoryMethod: 'date', needsCellStub: false, isAccessor: true },
  badge: { factoryMethod: 'badge', needsCellStub: false, isAccessor: true },
  editableSelect: {
    factoryMethod: 'editableSelect',
    needsCellStub: false,
    isAccessor: true,
  },
  actions: { factoryMethod: 'actions', needsCellStub: true, isAccessor: false },
  custom: { factoryMethod: 'custom', needsCellStub: true, isAccessor: false },
};
