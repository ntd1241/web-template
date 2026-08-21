import type { EditorTableSpec } from '@/builders/editor-table';

const spec: EditorTableSpec = {
  entity: 'ContractFeeLineFormValue',
  componentName: 'ContractFeeLinesEditorTable',
  modelImport: './contract-fee-lines-editor',
  valuesType: 'ContractFeeLinesFormValues',
  valuesImport: './contract-fee-lines-editor',
  arrayName: 'lines',
  specPath:
    'src/project/contracts/table/contract-fee-lines.editor-table.fixture.ts',
  tableMinWidthClass: 'min-w-[1320px]',
  toolbar: {
    title: 'Các khoản phí',
    addLabel: 'Thêm khoản phí',
  },
  viewport: { mode: 'remaining' },
  columns: [
    { kind: 'index', header: 'STT', widthClass: 'w-14' },
    {
      kind: 'custom',
      id: 'direction',
      header: 'Loại',
      widthClass: 'w-28',
    },
    {
      kind: 'text',
      name: 'name',
      header: 'Tên khoản phí',
      widthClass: 'min-w-56',
    },
    {
      kind: 'custom',
      id: 'quantity',
      header: 'Số lượng',
      widthClass: 'w-28',
    },
    {
      kind: 'custom',
      id: 'unitPrice',
      header: 'Đơn giá',
      widthClass: 'w-40',
    },
    {
      kind: 'custom',
      id: 'amount',
      header: 'Thành tiền',
      widthClass: 'w-40',
    },
    {
      kind: 'custom',
      id: 'billing',
      header: 'Phát sinh / Chu kỳ',
      widthClass: 'w-64',
    },
    {
      kind: 'custom',
      id: 'due',
      header: 'Hạn thanh toán',
      widthClass: 'w-52',
    },
  ],
};

export default spec;
