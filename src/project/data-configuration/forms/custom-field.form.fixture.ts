import type { FormSpec } from '@/builders/form';

const spec: FormSpec = {
  entity: 'CustomField',
  schemaImport: '../model/custom-field',
  schemaName: 'customFieldFormSchema',
  valuesType: 'CustomFieldFormValues',
  title: 'Trường bổ sung',
  specPath: 'src/project/data-configuration/forms/custom-field.form.fixture.ts',
  fields: [
    {
      kind: 'text',
      name: 'key',
      label: 'Mã trường',
      width: 'normal',
      required: true,
      placeholder: 'Ví dụ: education',
    },
    {
      kind: 'text',
      name: 'label',
      label: 'Tên trường',
      width: 'normal',
      required: true,
      placeholder: 'Ví dụ: Học vấn',
    },
    {
      kind: 'switch',
      name: 'isRequired',
      label: 'Bắt buộc nhập',
      width: 'normal',
    },
    {
      kind: 'switch',
      name: 'isActive',
      label: 'Kích hoạt trường',
      width: 'normal',
    },
    {
      kind: 'select',
      name: 'fieldType',
      label: 'Kiểu dữ liệu',
      width: 'full',
      required: true,
      options: [
        { value: 'text', label: 'Chữ' },
        { value: 'number', label: 'Số' },
        { value: 'select', label: 'Danh sách lựa chọn' },
      ],
    },
  ],
};

export default spec;
