import type { FormSpec } from '@/builders/form';

const spec: FormSpec = {
  entity: 'Contract',
  schemaImport: '../model/contract',
  schemaName: 'contractFormSchema',
  valuesType: 'ContractFormValues',
  title: 'Thêm hợp đồng',
  specPath: 'src/project/contracts/forms/contract.form.fixture.ts',
  fields: [
    {
      kind: 'customerSelect',
      name: 'customerId',
      label: 'Khách hàng',
      width: 'normal',
      placeholder: 'Chọn khách hàng',
      required: true,
    },
    {
      kind: 'text',
      name: 'contractCode',
      label: 'Mã hợp đồng',
      width: 'normal',
      breakBefore: true,
      required: true,
    },
    {
      kind: 'text',
      name: 'name',
      label: 'Tên hợp đồng',
      width: 'normal',
      required: true,
    },
    {
      kind: 'date',
      name: 'startDate',
      label: 'Ngày bắt đầu',
      width: 'normal',
      required: true,
    },
    {
      kind: 'date',
      name: 'endDate',
      label: 'Ngày kết thúc',
      width: 'normal',
    },
    {
      kind: 'switch',
      name: 'autoRenew',
      label: 'Tự động gia hạn',
      width: 'normal',
    },
    {
      kind: 'number',
      name: 'renewalNoticeDays',
      label: 'Nhắc gia hạn trước (ngày)',
      width: 'normal',
      placeholder: 'Không áp dụng',
    },
    {
      kind: 'number',
      name: 'paymentPriority',
      label: 'Thứ tự ưu tiên thanh toán',
      width: 'normal',
    },
    {
      kind: 'textarea',
      name: 'note',
      label: 'Ghi chú',
      width: 'full',
      rows: 3,
    },
  ],
};

export default spec;
