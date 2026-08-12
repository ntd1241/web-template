import type { ColumnKind } from './column-spec';

/**
 * Table-side projection of the shared field vocabulary. Display columns map to
 * the `data-grid-columns` factory; editable form controls are owned by
 * `shared/form-field-builder.ts` and are reused by the form/editor-table
 * builders instead of being duplicated here.
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
