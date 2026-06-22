import { describe, expect, it } from 'vitest';
import { buildEditorTableModule } from './editor-table-builder';
import type { EditorTableSpec } from './editor-table-spec';

const orderItemsSpec: EditorTableSpec = {
  entity: 'OrderItem',
  componentName: 'OrderItemsEditorTable',
  modelImport: './order-item',
  valuesType: 'OrderItemsFormValues',
  valuesImport: './order-item',
  arrayName: 'items',
  tableMinWidthClass: 'min-w-[1440px]',
  viewport: { mode: 'fixed', height: 'lg' },
  columns: [
    { kind: 'index', header: 'STT', widthClass: 'w-14' },
    { kind: 'text', name: 'sku', header: 'Mã hàng', widthClass: 'w-36' },
    { kind: 'date', name: 'expiryDate', header: 'Hạn dùng' },
    { kind: 'number', name: 'quantity', header: 'Số lượng', min: 0 },
    {
      kind: 'computedCurrency',
      id: 'lineTotal',
      header: 'Thành tiền',
      widthClass: 'w-40',
    },
  ],
};

describe('buildEditorTableModule', () => {
  const source = buildEditorTableModule(orderItemsSpec);

  it('emits the scaffold banner and component signature', () => {
    expect(source).toContain('Scaffolded by editor-table-builder');
    expect(source).toContain('export function OrderItemsEditorTable({');
    expect(source).toContain('form: UseFormReturn<OrderItemsFormValues>;');
    expect(source).toContain('createRow: () => OrderItem;');
  });

  it('wires react-hook-form field array operations', () => {
    expect(source).toContain("name: 'items'");
    expect(source).toContain("const watchedRows = form.watch('items') ?? [];");
    expect(source).toContain('append(createRow());');
    expect(source).toContain('insert(index + 1, createRow());');
    expect(source).toContain('remove(index)');
  });

  it('emits fixed viewport, horizontal min width, sticky headers and pinned actions', () => {
    expect(source).toContain(
      '<ScrollArea className="h-[clamp(480px,62dvh,760px)]">',
    );
    expect(source).toContain(
      '<table className="min-w-[1440px] w-full caption-bottom text-foreground text-sm">',
    );
    expect(source).toContain('<ScrollBar orientation="horizontal" />');
    expect(source).toContain('sticky top-0 z-20 bg-muted'); // column headers
    expect(source).toContain('sticky top-0 right-0 z-30 bg-muted'); // action header
    expect(source).toContain('sticky right-0 z-10 bg-card'); // action body cell
  });

  it('emits editable inputs and computed currency stubs', () => {
    expect(source).toContain('name={`items.${index}.sku`}');
    expect(source).toContain('name={`items.${index}.expiryDate`}');
    expect(source).toContain('name={`items.${index}.quantity`}');
    expect(source).toContain('type="number"');
    expect(source).toContain(
      "import { DatePickerInput } from '@/components/ui/inputs/date-picker-input';",
    );
    expect(source).toContain('valueMode="iso-date"');
    expect(source).not.toContain('type="date"');
    expect(source).toContain('const lineTotal = 0;');
    expect(source).toContain('formatCurrencyVND(lineTotal)');
  });

  it('supports remaining and natural viewport modes', () => {
    expect(
      buildEditorTableModule({
        ...orderItemsSpec,
        viewport: { mode: 'remaining' },
      }),
    ).toContain('<ScrollArea className="h-full min-h-[360px] min-h-0">');

    const withToolbar = buildEditorTableModule({
      ...orderItemsSpec,
      toolbar: { title: 'Hàng hóa trong đơn' },
      viewport: { mode: 'remaining' },
    });
    expect(withToolbar).toContain(
      '<div className="flex h-full min-h-0 min-w-0 flex-col">',
    );
    expect(withToolbar).toContain(
      '<ScrollArea className="min-h-[360px] min-h-0 flex-1">',
    );

    expect(
      buildEditorTableModule({
        ...orderItemsSpec,
        viewport: { mode: 'natural' },
      }),
    ).toContain('<ScrollBar orientation="horizontal" />');
  });

  it('omits unused imports/plumbing when no currency column and actions are off', () => {
    // Regression guard for `noUnusedLocals`: a lean spec must not import or
    // reference anything its cells do not use.
    const lean = buildEditorTableModule({
      ...orderItemsSpec,
      actions: { enabled: false },
      columns: [
        { kind: 'index', header: 'STT' },
        { kind: 'text', name: 'name', header: 'Tên' },
        { kind: 'number', name: 'quantity', header: 'Số lượng' },
      ],
    });

    expect(lean).not.toContain('formatCurrencyVND');
    expect(lean).not.toContain('Copy');
    expect(lean).not.toContain('Trash2');
    expect(lean).not.toContain('insert(');
    expect(lean).not.toContain('remove(');
    expect(lean).toContain('const { fields, append } = useFieldArray(');
    // editable columns still pull Controller + Input + the per-row errors.
    expect(lean).toContain('Controller');
    expect(lean).toContain('const errors = form.formState.errors.items');
  });

  it('renders a self-contained toolbar (title + count + add) when requested', () => {
    const withToolbar = buildEditorTableModule({
      ...orderItemsSpec,
      toolbar: { title: 'Hàng hóa trong đơn' },
    });

    expect(withToolbar).toContain('Hàng hóa trong đơn');
    expect(withToolbar).toContain('{fields.length} dòng');
    expect(withToolbar).toContain('onClick={handleAddRow}');
    expect(withToolbar).toContain(
      '<Button type="button" variant="primary" onClick={handleAddRow}>',
    );
    expect(withToolbar).not.toContain(
      '<Button type="button" variant="primary" size="sm" onClick={handleAddRow}>',
    );
    // default add label
    expect(withToolbar).toContain('Thêm dòng');
    // no toolbar by default → no header markup
    expect(source).not.toContain('{fields.length} dòng');
  });

  it('emits multi-edit selection, action bar, and optional header inputs', () => {
    const multiEdit = buildEditorTableModule({
      ...orderItemsSpec,
      multiEdit: { enabled: true, headerInputs: true },
      columns: [
        { kind: 'index', header: 'STT' },
        { kind: 'text', name: 'warehouse', header: 'Kho', bulkEdit: true },
        { kind: 'number', name: 'taxRate', header: 'VAT %', bulkEdit: true },
        {
          kind: 'date',
          name: 'expiryDate',
          header: 'Hạn dùng',
          bulkEdit: true,
        },
        { kind: 'text', name: 'sku', header: 'Mã hàng' },
      ],
    });

    expect(multiEdit).toContain("import { useMemo, useState } from 'react';");
    expect(multiEdit).toContain(
      "import { Checkbox } from '@/components/ui/checkbox';",
    );
    expect(multiEdit).toContain('role="toolbar"');
    expect(multiEdit).toContain('Đã chọn {selectedIndexes.length} dòng');
    expect(multiEdit).toContain('handleBulkApply');
    expect(multiEdit).toContain('handleHeaderBulkChange');
    expect(multiEdit).toContain('selectedRowIds.includes(field.fieldId)');
    expect(multiEdit).toContain(
      "const [bulkField, setBulkField] = useState<BulkFieldName>('warehouse');",
    );
    expect(multiEdit).toContain(
      "{ name: 'warehouse', label: 'Kho', kind: 'text' }",
    );
    expect(multiEdit).toContain(
      "{ name: 'taxRate', label: 'VAT %', kind: 'number' }",
    );
    expect(multiEdit).toContain(
      "{ name: 'expiryDate', label: 'Hạn dùng', kind: 'date' }",
    );
    expect(multiEdit).not.toContain("{ name: 'sku', label: 'Mã hàng'");
  });

  it('omits Controller/Input/errors when there is no editable column', () => {
    const displayOnly = buildEditorTableModule({
      ...orderItemsSpec,
      actions: { enabled: false },
      columns: [
        { kind: 'index', header: 'STT' },
        {
          kind: 'computedCurrency',
          id: 'lineTotal',
          header: 'Thành tiền',
        },
      ],
    });

    expect(displayOnly).not.toContain('Controller');
    expect(displayOnly).not.toContain("from '@/components/ui/input'");
    expect(displayOnly).not.toContain('const errors =');
    expect(displayOnly).toContain('formatCurrencyVND'); // currency column present
  });
});
