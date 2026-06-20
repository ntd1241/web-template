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
      'className="h-[clamp(480px,62dvh,760px)] overflow-auto"',
    );
    expect(source).toContain('<Table className="min-w-[1440px]">');
    expect(source).toContain('sticky right-0 z-20');
    expect(source).toContain('sticky right-0 z-10 bg-card');
  });

  it('emits editable inputs and computed currency stubs', () => {
    expect(source).toContain('name={`items.${index}.sku`}');
    expect(source).toContain('name={`items.${index}.quantity`}');
    expect(source).toContain('type="number"');
    expect(source).toContain('const lineTotal = 0;');
    expect(source).toContain('formatCurrencyVND(lineTotal)');
  });

  it('supports remaining and natural viewport modes', () => {
    expect(
      buildEditorTableModule({
        ...orderItemsSpec,
        viewport: { mode: 'remaining' },
      }),
    ).toContain('className="min-h-0 flex-1 overflow-auto"');

    expect(
      buildEditorTableModule({
        ...orderItemsSpec,
        viewport: { mode: 'natural' },
      }),
    ).toContain('className="overflow-auto"');
  });
});
