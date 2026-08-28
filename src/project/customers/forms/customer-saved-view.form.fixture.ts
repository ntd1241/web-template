import type { FormSpec } from '@/builders/form';

const spec: FormSpec = {
  entity: 'CustomerSavedView',
  schemaImport: '../model/customer-saved-view',
  schemaName: 'customerSavedViewFormSchema',
  valuesType: 'CustomerSavedViewFormValues',
  title: 'Tạo chế độ xem',
  specPath: 'src/project/customers/forms/customer-saved-view.form.fixture.ts',
  fields: [
    {
      kind: 'text',
      name: 'name',
      label: 'Tên chế độ xem',
      width: 'full',
      placeholder: 'Ví dụ: Khách hàng tiềm năng',
      required: true,
    },
  ],
};

export default spec;
