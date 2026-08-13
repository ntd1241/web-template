import type { FormSpec } from '@/builders/form';

const spec: FormSpec = {
  entity: 'Tag',
  schemaImport: '../model/tag',
  schemaName: 'tagFormSchema',
  valuesType: 'TagFormValues',
  title: 'Nhãn',
  description: 'Tạo nhãn để gắn cho nhiều loại đối tượng.',
  specPath: 'src/project/tags/forms/tag.form.fixture.ts',
  fields: [
    {
      kind: 'select',
      name: 'groupId',
      label: 'Nhóm nhãn',
      width: 'full',
      required: true,
      placeholder: 'Chọn nhóm nhãn',
      optionsFrom: 'prop',
    },
    {
      kind: 'text',
      name: 'name',
      label: 'Tên nhãn',
      width: 'large',
      required: true,
    },
    {
      kind: 'textarea',
      name: 'description',
      label: 'Mô tả',
      width: 'full',
      rows: 3,
    },
    {
      kind: 'text',
      name: 'code',
      label: 'Mã nhãn',
      width: 'normal',
      required: true,
    },
    {
      kind: 'text',
      name: 'color',
      label: 'Màu',
      width: 'normal',
      required: true,
      placeholder: '#2563eb',
    },
  ],
};

export default spec;
