import { z } from 'zod';

/**
 * Spec schema for the table builder. A `TableSpec` is the **projection** of an
 * entity model into DataGrid columns; the builder turns it into a
 * `use<Entity>Columns()` hook on top of the `data-grid-columns` column-factory.
 *
 * Validated with zod so an invalid spec fails loudly before any TSX is emitted.
 */

const IDENTIFIER = /^[a-zA-Z_$][\w$]*$/;
/** Dot-path accessor, e.g. `fullName` or `profile.name`. */
const FIELD_PATH = /^[a-zA-Z_$][\w$]*(\.[a-zA-Z_$][\w$]*)*$/;

const columnId = z
  .string()
  .regex(IDENTIFIER, 'id phải là một định danh hợp lệ (vd: fullName)');

const fieldPath = z
  .string()
  .regex(
    FIELD_PATH,
    'field phải là đường dẫn thuộc tính hợp lệ (vd: profile.name)',
  );

/** Common meta forwarded into `ColumnDef.meta` by every column-factory builder. */
const commonMeta = {
  headerClassName: z.string().optional(),
  cellClassName: z.string().optional(),
  size: z.number().int().positive().optional(),
  visibility: z.boolean().optional(),
  enableSorting: z.boolean().optional(),
};

/** Accessor columns (text/number/date/…) all carry an id, header and a field. */
const accessorBase = {
  id: columnId,
  header: z.string().min(1),
  field: fieldPath,
  ...commonMeta,
};

const textColumn = z.object({
  kind: z.literal('text'),
  tooltipOnTruncate: z.boolean().optional(),
  ...accessorBase,
});

const numberColumn = z.object({
  kind: z.literal('number'),
  minimumFractionDigits: z.number().int().min(0).max(20).optional(),
  maximumFractionDigits: z.number().int().min(0).max(20).optional(),
  ...accessorBase,
});

const currencyColumn = z.object({
  kind: z.literal('currency'),
  ...accessorBase,
});

const percentColumn = z.object({
  kind: z.literal('percent'),
  fractionDigits: z.number().int().min(0).max(20).optional(),
  ...accessorBase,
});

const dateColumn = z.object({
  kind: z.literal('date'),
  mode: z.enum(['date', 'datetime', 'relative']).optional(),
  ...accessorBase,
});

/** One status entry in a badge column's config; all fields are serializable. */
const badgeStatus = z.object({
  label: z.string().min(1),
  variant: z.string().optional(),
  className: z.string().optional(),
  dotClassName: z.string().optional(),
});

const badgeColumn = z.object({
  kind: z.literal('badge'),
  config: z.record(z.string(), badgeStatus),
  ...accessorBase,
});

const option = z.object({
  value: z.string(),
  label: z.string().min(1),
});

const editableSelectColumn = z.object({
  kind: z.literal('editableSelect'),
  options: z.array(option).optional(),
  optionsFrom: z.enum(['static', 'prop']).optional(),
  placeholder: z.string().optional(),
  ...accessorBase,
});

const indexColumn = z.object({
  kind: z.literal('index'),
  id: columnId.optional(),
  header: z.string().min(1).optional(),
  ...commonMeta,
});

const selectColumn = z.object({
  kind: z.literal('select'),
});

/**
 * `actions`/`custom` cells are JSX/handlers the builder cannot serialize. The
 * generated hook exposes a `render<Id>` callback the owned container supplies.
 */
const actionsColumn = z.object({
  kind: z.literal('actions'),
  id: columnId.optional(),
  header: z.string().min(1).optional(),
  ...commonMeta,
});

const customColumn = z.object({
  kind: z.literal('custom'),
  id: columnId,
  header: z.string().min(1),
  ...commonMeta,
});

export const columnSpecSchema = z.discriminatedUnion('kind', [
  textColumn,
  numberColumn,
  currencyColumn,
  percentColumn,
  dateColumn,
  badgeColumn,
  editableSelectColumn,
  indexColumn,
  selectColumn,
  actionsColumn,
  customColumn,
]);

export const tableSpecSchema = z
  .object({
    /** Row type name, e.g. `Employee`. */
    entity: z.string().regex(IDENTIFIER, 'entity phải là tên kiểu hợp lệ'),
    /** Import specifier for the row type, e.g. `../model/employee`. */
    modelImport: z.string().min(1),
    /** Hook name; defaults to `use<Entity>Columns`. */
    hookName: z.string().regex(IDENTIFIER).optional(),
    /** Spec path recorded in the provenance banner of the generated file. */
    specPath: z.string().optional(),
    columns: z.array(columnSpecSchema).min(1, 'cần ít nhất một cột'),
  })
  .superRefine((spec, ctx) => {
    spec.columns.forEach((column, index) => {
      if (
        column.kind === 'editableSelect' &&
        column.optionsFrom !== 'prop' &&
        (!column.options || column.options.length < 1)
      ) {
        ctx.addIssue({
          code: 'custom',
          message:
            'Cột editableSelect dùng options tĩnh cần khai báo ít nhất một lựa chọn',
          path: ['columns', index, 'options'],
        });
      }
    });
  });

export type ColumnSpec = z.infer<typeof columnSpecSchema>;
export type TableSpec = z.infer<typeof tableSpecSchema>;
export type ColumnKind = ColumnSpec['kind'];
