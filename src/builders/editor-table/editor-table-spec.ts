import { z } from 'zod';

const IDENTIFIER = /^[a-zA-Z_$][\w$]*$/;

const identifier = z
  .string()
  .regex(IDENTIFIER, 'phải là một định danh TypeScript hợp lệ');

const widthClass = z.string().min(1).optional();

const baseColumn = {
  id: identifier.optional(),
  header: z.string().min(1),
  widthClass,
};

const fieldColumnBase = {
  name: identifier,
  ariaLabel: z.string().optional(),
  ...baseColumn,
};

const indexColumn = z.object({
  kind: z.literal('index'),
  ...baseColumn,
});

const textColumn = z.object({
  kind: z.literal('text'),
  inputType: z.enum(['text', 'email', 'tel', 'url']).optional(),
  ...fieldColumnBase,
});

const numberColumn = z.object({
  kind: z.literal('number'),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  ...fieldColumnBase,
});

const dateColumn = z.object({
  kind: z.literal('date'),
  ...fieldColumnBase,
});

const computedCurrencyColumn = z.object({
  kind: z.literal('computedCurrency'),
  id: identifier,
  header: z.string().min(1),
  widthClass,
});

export const editorTableColumnSchema = z.discriminatedUnion('kind', [
  indexColumn,
  textColumn,
  numberColumn,
  dateColumn,
  computedCurrencyColumn,
]);

export const editorTableSpecSchema = z.object({
  entity: z.string().regex(IDENTIFIER, 'entity phải là tên kiểu hợp lệ'),
  componentName: z.string().regex(IDENTIFIER).optional(),
  modelImport: z.string().min(1),
  valuesType: z.string().regex(IDENTIFIER),
  valuesImport: z.string().min(1),
  arrayName: z.string().regex(IDENTIFIER),
  specPath: z.string().optional(),
  createRowProp: z.string().regex(IDENTIFIER).optional(),
  tableMinWidthClass: z.string().min(1).default('min-w-[1200px]'),
  /**
   * Optional self-contained header above the table (title + row count + an
   * "add row" button) so the component owns the single `useFieldArray` — the
   * page does not need its own array instance to add rows.
   */
  toolbar: z
    .object({
      title: z.string().min(1),
      addLabel: z.string().min(1).default('Thêm dòng'),
    })
    .optional(),
  viewport: z
    .object({
      mode: z.enum(['fixed', 'remaining', 'natural']).default('fixed'),
      height: z.enum(['sm', 'md', 'lg']).optional(),
      className: z.string().optional(),
    })
    .default({ mode: 'fixed', height: 'lg' }),
  actions: z
    .object({
      enabled: z.boolean().default(true),
      header: z.string().optional(),
      widthClass: z.string().min(1).default('w-28'),
    })
    .default({ enabled: true, widthClass: 'w-28' }),
  columns: z
    .array(editorTableColumnSchema)
    .min(1, 'cần ít nhất một cột editor table'),
});

export type EditorTableColumnSpec = z.infer<typeof editorTableColumnSchema>;
export type EditorTableSpec = z.input<typeof editorTableSpecSchema>;
export type NormalizedEditorTableSpec = z.infer<typeof editorTableSpecSchema>;
