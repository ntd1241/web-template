import type { FormSpec } from '@/builders/form';

const spec: FormSpec = {
  entity: 'ContractTemplate',
  schemaImport: '../model/contract-template',
  schemaName: 'contractTemplateFormSchema',
  valuesType: 'ContractTemplateFormValues',
  title: 'Mẫu hợp đồng',
  specPath: 'src/project/contracts/templates/contract-template.form.fixture.ts',
  fields: [
    {
      kind: 'text',
      name: 'code',
      label: 'Mã mẫu',
      width: 'normal',
      required: true,
    },
    {
      kind: 'text',
      name: 'name',
      label: 'Tên mẫu / dịch vụ',
      width: 'normal',
      required: true,
    },
    {
      kind: 'select',
      name: 'currencyCode',
      label: 'Đơn vị tiền tệ',
      width: 'normal',
      options: [
        { value: 'VND', label: 'VND - Việt Nam đồng' },
        { value: 'USD', label: 'USD - Đô la Mỹ' },
        { value: 'EUR', label: 'EUR - Euro' },
      ],
    },
    {
      kind: 'switch',
      name: 'autoRenewDefault',
      label: 'Mặc định tự động gia hạn',
      width: 'normal',
    },
    {
      kind: 'textarea',
      name: 'description',
      label: 'Mô tả dịch vụ',
      width: 'full',
      rows: 3,
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
