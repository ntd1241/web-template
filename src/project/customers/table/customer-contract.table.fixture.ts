import type { TableSpec } from '@/builders/table';

const spec: TableSpec = {
  entity: 'Contract',
  modelImport: '../../contracts/model/contract',
  specPath: 'src/project/customers/table/customer-contract.table.fixture.ts',
  columns: [
    {
      kind: 'custom',
      id: 'contract',
      header: 'Hợp đồng',
      headerClassName: 'min-w-[300px]',
      size: 360,
    },
    {
      kind: 'custom',
      id: 'status',
      header: 'Trạng thái',
      headerClassName: 'w-[150px]',
      size: 150,
    },
    {
      kind: 'date',
      id: 'startDate',
      header: 'Ngày bắt đầu',
      field: 'startDate',
      headerClassName: 'w-[150px]',
      size: 150,
    },
    {
      kind: 'custom',
      id: 'endDate',
      header: 'Ngày kết thúc',
      headerClassName: 'w-[150px]',
      size: 150,
    },
    {
      kind: 'currency',
      id: 'totalOutstanding',
      header: 'Còn phải thu',
      field: 'totalOutstanding',
      headerClassName: 'w-[160px]',
      cellClassName: 'px-3',
      size: 160,
    },
    {
      kind: 'custom',
      id: 'nextDueDate',
      header: 'Hạn gần nhất',
      headerClassName: 'w-[160px]',
      size: 160,
    },
    {
      kind: 'actions',
      id: 'actions',
      header: '',
      actionPresets: ['primary', 'view', 'other'],
      headerClassName: 'w-[280px]',
      cellClassName: 'text-right',
      size: 280,
    },
  ],
};

export default spec;
