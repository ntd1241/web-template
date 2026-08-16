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
      kind: 'multiselect',
      name: 'responsibleEmployeeIds',
      label: 'Nhân viên phụ trách',
      width: 'full',
      optionsFrom: 'prop',
      placeholder: 'Chọn nhân viên phụ trách',
      searchPlaceholder: 'Tìm nhân viên...',
      emptyMessage: 'Không tìm thấy nhân viên',
    },
    {
      kind: 'tagSelect',
      name: 'tagIds',
      label: 'Nhãn',
      width: 'full',
      moduleCodes: ['contracts'],
      placeholder: 'Chọn nhãn',
      searchPlaceholder: 'Tìm nhãn...',
      emptyMessage: 'Không tìm thấy nhãn',
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
      kind: 'textarea',
      name: 'note',
      label: 'Ghi chú',
      width: 'full',
      rows: 3,
    },
  ],
};

export default spec;
